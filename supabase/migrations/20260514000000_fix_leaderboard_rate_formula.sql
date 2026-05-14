-- leaderboard rate 수정: hardcoded 7 → 실제 챌린지 일수 기반
-- 기존: recent_done / 7 * 100 (7일 고정, 챌린지 기간 무시)
-- 변경: total_done / challenge_days * 100 (실제 챌린지 기간 기준)
-- 순위 기준도 recent_done → total_done 으로 변경 (크루 달성률과 일관성)

CREATE OR REPLACE FUNCTION get_group_leaderboard(p_group_id UUID, p_limit INT DEFAULT 30)
RETURNS TABLE (
  rank INT,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_done INT,
  recent_done INT,
  rate INT,
  streak INT,
  is_me BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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
  completed AS (
    SELECT
      v.user_id,
      ((v.verified_at AT TIME ZONE 'Asia/Seoul')::date) AS day
    FROM verifications v
    WHERE v.group_id = p_group_id
      AND v.status = 'completed'
  ),
  member_stats AS (
    SELECT
      gm.user_id,
      p.username,
      p.avatar_url,
      COUNT(c.day)::INT AS total_done,
      COUNT(c.day) FILTER (WHERE c.day >= ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 6))::INT AS recent_done
    FROM group_members gm
    JOIN profiles p ON p.id = gm.user_id
    LEFT JOIN completed c ON c.user_id = gm.user_id
    WHERE gm.group_id = p_group_id
    GROUP BY gm.user_id, p.username, p.avatar_url
  ),
  ranked AS (
    SELECT
      DENSE_RANK() OVER (
        ORDER BY ms.total_done DESC, ms.user_id ASC
      )::INT AS rank,
      ms.user_id,
      ms.username,
      ms.avatar_url,
      ms.total_done,
      ms.recent_done,
      LEAST(100, ROUND(
        (ms.total_done::NUMERIC
          / GREATEST(1, COALESCE((SELECT days FROM dur), 7))
        ) * 100
      ))::INT AS rate,
      ms.recent_done::INT AS streak,
      auth.uid() = ms.user_id AS is_me
    FROM member_stats ms
  )
  SELECT *
  FROM ranked
  ORDER BY rank ASC, total_done DESC, streak DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 30), 100));
$$;

GRANT EXECUTE ON FUNCTION get_group_leaderboard(UUID, INT) TO anon, authenticated;
