-- ============================================================
-- 크루 달성률 수식 변경
--
-- 기존: 분모 = is_contributor=TRUE 전체 (REMOVED 포함)
-- 변경: 분모 = is_contributor=TRUE AND member_status != 'REMOVED'
--       분자 = is_contributor=TRUE 전체 인증 (강퇴자 기여분 유지)
--
-- 이유: 강퇴자를 분모에 남기면 6명이 남은 상황에서 최대 60%밖에
--       달성 못 하는 구조가 되므로, 강퇴 시 분모에서 제거하되
--       이미 쌓은 인증은 분자에 유지해 기여분을 보존한다.
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
  -- 분모: 강퇴되지 않은 기여자만
  active_contributors AS (
    SELECT user_id
    FROM group_members
    WHERE group_id       = p_group_id
      AND is_contributor = TRUE
      AND member_status != 'REMOVED'
  ),
  -- 분자: 강퇴 포함 전체 기여자의 인증 (기여분 보존)
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
    WHERE v.group_id = p_group_id
      AND v.status   = 'completed'
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

-- 기존 그룹 crew_rate 전체 재계산
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM groups LOOP
    PERFORM update_crew_cache(r.id);
  END LOOP;
END;
$$;
