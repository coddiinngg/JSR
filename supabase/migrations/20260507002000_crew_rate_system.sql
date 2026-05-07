-- ============================================================
-- 크루 달성률 시스템
-- group_members: is_contributor, member_status, exit_deadline,
--                removed_at, join_day, last_verified_at
-- groups:        crew_rate, crew_grade
-- ============================================================

-- ── 1. group_members 컬럼 추가 ────────────────────────────────
ALTER TABLE group_members
  ADD COLUMN IF NOT EXISTS is_contributor   BOOLEAN          NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS member_status    TEXT             NOT NULL DEFAULT 'ACTIVE'
    CONSTRAINT gm_status_chk CHECK (member_status IN ('ACTIVE', 'EXIT_ELIGIBLE', 'REMOVED')),
  ADD COLUMN IF NOT EXISTS exit_deadline    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS removed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS join_day         INT              NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- ── 2. groups 컬럼 추가 ───────────────────────────────────────
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS crew_rate  DOUBLE PRECISION NOT NULL DEFAULT 0
    CONSTRAINT groups_crew_rate_chk CHECK (crew_rate BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS crew_grade TEXT             NOT NULL DEFAULT 'D'
    CONSTRAINT groups_crew_grade_chk CHECK (crew_grade IN ('A', 'B', 'C', 'D'));

-- ── 3. 기존 멤버 last_verified_at 백필 ──────────────────────
UPDATE group_members gm
SET last_verified_at = sub.last_at
FROM (
  SELECT user_id, group_id, MAX(verified_at) AS last_at
  FROM verifications
  WHERE status   = 'completed'
    AND group_id IS NOT NULL
  GROUP BY user_id, group_id
) sub
WHERE gm.user_id  = sub.user_id
  AND gm.group_id = sub.group_id;

-- ── 4. 인덱스 ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS gm_group_status_idx
  ON group_members (group_id, member_status);

CREATE INDEX IF NOT EXISTS gm_group_contributor_idx
  ON group_members (group_id, is_contributor);

CREATE INDEX IF NOT EXISTS gm_active_last_verified_idx
  ON group_members (last_verified_at)
  WHERE member_status = 'ACTIVE';

-- ============================================================
-- 5. 헬퍼: 달성률 → 등급
-- ============================================================
CREATE OR REPLACE FUNCTION grade_from_rate(p_rate DOUBLE PRECISION)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_rate >= 1.0 - 1e-9 THEN 'A'
    WHEN p_rate >= 0.8         THEN 'B'
    WHEN p_rate >= 0.5         THEN 'C'
    ELSE                            'D'
  END;
$$;

-- ============================================================
-- 6. 크루 달성률 계산 (verifications 기준, 실시간)
--
-- 수식: total_completed / (|contributors| × D)
--   - contributors = is_contributor = TRUE (REMOVED 포함, 분모 감소 없음)
--   - total_completed = 기여자들의 인증 일수 합산 (KST 기준 unique day)
--   - D = challenge_start ~ challenge_end 일수
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_crew_rate(p_group_id UUID)
RETURNS DOUBLE PRECISION
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH dur AS (
    SELECT GREATEST(1,
      ROUND(EXTRACT(EPOCH FROM (challenge_end - challenge_start)) / 86400)::INT
    ) AS days
    FROM groups
    WHERE id = p_group_id
      AND challenge_start IS NOT NULL
      AND challenge_end   IS NOT NULL
  ),
  contributors AS (
    SELECT user_id
    FROM group_members
    WHERE group_id     = p_group_id
      AND is_contributor = TRUE
  ),
  done AS (
    SELECT v.user_id,
           COUNT(DISTINCT (v.verified_at AT TIME ZONE 'Asia/Seoul')::date)::INT AS cnt
    FROM verifications v
    JOIN contributors c ON c.user_id = v.user_id
    WHERE v.group_id = p_group_id
      AND v.status   = 'completed'
    GROUP BY v.user_id
  )
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM dur)          THEN 0.0
    WHEN NOT EXISTS (SELECT 1 FROM contributors) THEN 0.0
    ELSE LEAST(1.0,
      COALESCE((SELECT SUM(cnt) FROM done), 0)::DOUBLE PRECISION
      / NULLIF(
          (SELECT COUNT(*) FROM contributors)::DOUBLE PRECISION
          * (SELECT days FROM dur),
          0
        )
    )
  END;
$$;

REVOKE EXECUTE ON FUNCTION calculate_crew_rate(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION calculate_crew_rate(UUID) TO authenticated;

-- ============================================================
-- 7. 크루 달성률 캐시 갱신 (Edge Function 호출용)
-- ============================================================
CREATE OR REPLACE FUNCTION update_crew_cache(p_group_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate DOUBLE PRECISION;
BEGIN
  v_rate := calculate_crew_rate(p_group_id);
  UPDATE groups
  SET crew_rate  = v_rate,
      crew_grade = grade_from_rate(v_rate)
  WHERE id = p_group_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_crew_cache(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION update_crew_cache(UUID) TO service_role;

-- ============================================================
-- 8. 가입 시 is_contributor / join_day 자동 설정 트리거
--
-- 규칙 (컷오프):
--   D=7:  cutoff=3  → join_day <= 4  이면 contributor
--   D=14: cutoff=6  → join_day <= 8
--   D=21: cutoff=10 → join_day <= 11
--   D=30: cutoff=14 → join_day <= 16
--   기타: cutoff = ROUND(D * 0.47)
--   챌린지 미시작 / 날짜 없음 → join_day=0, is_contributor=TRUE
-- ============================================================
CREATE OR REPLACE FUNCTION set_member_contributor()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_start    TIMESTAMPTZ;
  v_end      TIMESTAMPTZ;
  v_days     INT;
  v_cutoff   INT;
  v_join_day INT;
BEGIN
  SELECT challenge_start, challenge_end
  INTO v_start, v_end
  FROM groups
  WHERE id = NEW.group_id;

  IF v_start IS NULL OR v_end IS NULL OR NOW() < v_start THEN
    NEW.join_day       := 0;
    NEW.is_contributor := TRUE;
    RETURN NEW;
  END IF;

  v_days := GREATEST(1,
    ROUND(EXTRACT(EPOCH FROM (v_end - v_start)) / 86400)::INT
  );
  v_cutoff := CASE v_days
    WHEN  7 THEN 3
    WHEN 14 THEN 6
    WHEN 21 THEN 10
    WHEN 30 THEN 14
    ELSE ROUND(v_days * 0.47)::INT
  END;
  -- FLOOR + 1: 시작 당일 = 1일차, 24h 경계 정확히 처리 (CEIL은 정확히 86400s 경계에서 off-by-one)
  v_join_day := GREATEST(1,
    (FLOOR(EXTRACT(EPOCH FROM (NOW() - v_start)) / 86400)::INT + 1)
  );

  NEW.join_day       := v_join_day;
  NEW.is_contributor := (v_join_day <= v_days - v_cutoff);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gm_set_contributor ON group_members;
CREATE TRIGGER gm_set_contributor
  BEFORE INSERT ON group_members
  FOR EACH ROW EXECUTE FUNCTION set_member_contributor();

-- ============================================================
-- 9. 멤버 상태 전이 (주기적 호출)
--
-- ACTIVE → EXIT_ELIGIBLE : 48시간 미인증
-- EXIT_ELIGIBLE → REMOVED : 2시간 유예 경과
-- 반환: 변경된 행 수
--
-- pg_cron 설정 (Supabase Dashboard > SQL Editor):
--   SELECT cron.schedule(
--     'update-member-statuses',
--     '*/30 * * * *',
--     $$SELECT update_member_statuses()$$
--   );
-- ============================================================
CREATE OR REPLACE FUNCTION update_member_statuses(p_group_id UUID DEFAULT NULL)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INT := 0;
  v_cnt     INT;
BEGIN
  UPDATE group_members
  SET member_status = 'EXIT_ELIGIBLE',
      exit_deadline = NOW() + INTERVAL '2 hours'
  WHERE member_status = 'ACTIVE'
    AND is_contributor = TRUE
    AND COALESCE(last_verified_at, joined_at) < NOW() - INTERVAL '48 hours'
    AND (p_group_id IS NULL OR group_id = p_group_id);
  GET DIAGNOSTICS v_cnt = ROW_COUNT;
  v_updated := v_updated + v_cnt;

  UPDATE group_members
  SET member_status = 'REMOVED',
      removed_at    = NOW(),
      exit_deadline = NULL
  WHERE member_status = 'EXIT_ELIGIBLE'
    AND exit_deadline IS NOT NULL
    AND exit_deadline < NOW()
    AND (p_group_id IS NULL OR group_id = p_group_id);
  GET DIAGNOSTICS v_cnt = ROW_COUNT;
  v_updated := v_updated + v_cnt;

  RETURN v_updated;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_member_statuses(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION update_member_statuses(UUID) TO service_role;

-- ============================================================
-- 10. 수동 즉시 퇴장 (EXIT_ELIGIBLE 상태에서만 허용)
-- ============================================================
CREATE OR REPLACE FUNCTION member_voluntary_exit(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows INT;
BEGIN
  IF p_user_id <> auth.uid() THEN
    RETURN FALSE;
  END IF;

  UPDATE group_members
  SET member_status = 'REMOVED',
      removed_at    = NOW(),
      exit_deadline = NULL
  WHERE group_id    = p_group_id
    AND user_id     = p_user_id
    AND member_status = 'EXIT_ELIGIBLE';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION member_voluntary_exit(UUID, UUID) TO authenticated;

-- ============================================================
-- 11. 크루 현황 조회 RPC (프론트엔드용)
-- ============================================================
CREATE OR REPLACE FUNCTION get_crew_status(p_group_id UUID)
RETURNS TABLE (
  crew_rate         DOUBLE PRECISION,
  crew_grade        TEXT,
  contributor_count INT,
  active_count      INT,
  removed_count     INT,
  my_status         TEXT,
  my_is_contributor BOOLEAN,
  my_exit_deadline  TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    g.crew_rate,
    g.crew_grade,
    COUNT(*) FILTER (WHERE gm.is_contributor)::INT,
    COUNT(*) FILTER (WHERE gm.member_status = 'ACTIVE')::INT,
    COUNT(*) FILTER (WHERE gm.member_status = 'REMOVED')::INT,
    MAX(CASE WHEN gm.user_id = v_uid THEN gm.member_status END),
    COALESCE(BOOL_OR(CASE WHEN gm.user_id = v_uid AND gm.is_contributor THEN TRUE END), FALSE),
    MAX(CASE WHEN gm.user_id = v_uid THEN gm.exit_deadline END)
  FROM groups g
  LEFT JOIN group_members gm ON gm.group_id = g.id
  WHERE g.id = p_group_id
  GROUP BY g.crew_rate, g.crew_grade;
END;
$$;

GRANT EXECUTE ON FUNCTION get_crew_status(UUID) TO authenticated;

-- ============================================================
-- 12. 기존 그룹 crew_rate 초기화
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM groups LOOP
    PERFORM update_crew_cache(r.id);
  END LOOP;
END;
$$;
