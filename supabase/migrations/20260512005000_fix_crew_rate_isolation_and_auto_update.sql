-- ================================================================
-- 1. calculate_crew_rate 수정
--    - 챌린지 기간 내 인증만 집계 (재시작 전 데이터 제외)
--    - REMOVED/LEFT 멤버를 분모에서 제외 (기여 인증은 분자에 유지)
-- ================================================================
CREATE OR REPLACE FUNCTION calculate_crew_rate(p_group_id UUID)
RETURNS DOUBLE PRECISION
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  WITH dur AS (
    SELECT
      GREATEST(1,
        ROUND(EXTRACT(EPOCH FROM (challenge_end - challenge_start)) / 86400)::INT
      ) AS days,
      challenge_start,
      challenge_end
    FROM groups
    WHERE id = p_group_id
      AND challenge_start IS NOT NULL
      AND challenge_end   IS NOT NULL
  ),
  active_contributors AS (
    SELECT user_id
    FROM group_members
    WHERE group_id       = p_group_id
      AND is_contributor = TRUE
      AND member_status NOT IN ('REMOVED', 'LEFT')
  ),
  all_contributors AS (
    SELECT user_id
    FROM group_members
    WHERE group_id       = p_group_id
      AND is_contributor = TRUE
  ),
  done AS (
    SELECT v.user_id,
           COUNT(DISTINCT (v.verified_at AT TIME ZONE 'Asia/Seoul')::date)::INT AS cnt
    FROM verifications v
    JOIN all_contributors c ON c.user_id = v.user_id
    JOIN dur d ON TRUE
    WHERE v.group_id   = p_group_id
      AND v.status     = 'completed'
      AND v.verified_at >= d.challenge_start
      AND v.verified_at <= d.challenge_end
    GROUP BY v.user_id
  )
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM dur)                 THEN 0.0
    WHEN NOT EXISTS (SELECT 1 FROM active_contributors) THEN 0.0
    ELSE LEAST(1.0,
      COALESCE((SELECT SUM(cnt) FROM done), 0)::DOUBLE PRECISION
      / NULLIF(
          (SELECT COUNT(*) FROM active_contributors)::DOUBLE PRECISION
          * (SELECT days FROM dur),
          0
        )
    )
  END;
$$;

-- ================================================================
-- 2. update_crew_cache: crew_rate 갱신 래퍼
-- ================================================================
CREATE OR REPLACE FUNCTION update_crew_cache(p_group_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE groups
  SET crew_rate = calculate_crew_rate(p_group_id)
  WHERE id = p_group_id;
END;
$$;

-- ================================================================
-- 3. 트리거: 인증 완료 시 crew_rate 자동 갱신
-- ================================================================
CREATE OR REPLACE FUNCTION trg_fn_crew_rate_on_verification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  PERFORM update_crew_cache(NEW.group_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crew_rate_on_verification ON verifications;
CREATE TRIGGER trg_crew_rate_on_verification
AFTER INSERT OR UPDATE ON verifications
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION trg_fn_crew_rate_on_verification();

-- ================================================================
-- 4. 트리거: 챌린지 기간 변경(재시작) 시 is_contributor 리셋 + crew_rate 초기화
-- ================================================================
CREATE OR REPLACE FUNCTION trg_fn_reset_on_challenge_restart()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF (OLD.challenge_start IS DISTINCT FROM NEW.challenge_start OR
      OLD.challenge_end   IS DISTINCT FROM NEW.challenge_end) THEN
    UPDATE group_members
    SET is_contributor = TRUE,
        join_day       = 0
    WHERE group_id     = NEW.id
      AND member_status IN ('ACTIVE', 'EXIT_ELIGIBLE');
    PERFORM update_crew_cache(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crew_rate_on_challenge_restart ON groups;
CREATE TRIGGER trg_crew_rate_on_challenge_restart
AFTER UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION trg_fn_reset_on_challenge_restart();

-- ================================================================
-- 5. 기존 모든 그룹 crew_rate 초기 재계산
-- ================================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM groups LOOP
    PERFORM update_crew_cache(r.id);
  END LOOP;
END;
$$;
