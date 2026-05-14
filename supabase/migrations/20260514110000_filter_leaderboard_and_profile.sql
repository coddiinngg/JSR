-- ============================================================
-- 리더보드 + 공개 프로필 RPC 필터 강화
--
-- 1. get_group_leaderboard:
--    - 멤버: ACTIVE/EXIT_ELIGIBLE만 (LEFT/REMOVED 제외)
--    - 인증 카운트: 챌린지 기간 내만 (이전 라운드 잔재 제거)
-- 2. get_public_profile:
--    - joined_groups: ACTIVE/EXIT_ELIGIBLE만
--    - past_groups 신규: ACTIVE로 끝까지 참여한 종료 챌린지
-- ============================================================

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
    SELECT
      GREATEST(1, ROUND(EXTRACT(EPOCH FROM (challenge_end - challenge_start)) / 86400)::INT) AS days,
      challenge_start,
      challenge_end
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
    JOIN dur d ON TRUE
    WHERE v.group_id = p_group_id
      AND v.status   = 'completed'
      AND v.verified_at >= d.challenge_start
      AND v.verified_at <= d.challenge_end
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
    WHERE gm.group_id     = p_group_id
      AND gm.member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
    GROUP BY gm.user_id, p.username, p.avatar_url
  ),
  ranked AS (
    SELECT
      DENSE_RANK() OVER (ORDER BY ms.total_done DESC, ms.user_id ASC)::INT AS rank,
      ms.user_id,
      ms.username,
      ms.avatar_url,
      ms.total_done,
      ms.recent_done,
      LEAST(100, ROUND(
        (ms.total_done::NUMERIC / GREATEST(1, COALESCE((SELECT days FROM dur), 7))) * 100
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

-- ============================================================
-- get_public_profile: joined_groups + past_groups 분리
-- ============================================================
DROP FUNCTION IF EXISTS get_public_profile(UUID);

CREATE OR REPLACE FUNCTION get_public_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  streak_count INT,
  xp_total INT,
  verification_total INT,
  verification_rate INT,
  joined_groups JSONB,
  past_groups JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_profile AS (
    SELECT
      p.id,
      p.username,
      p.avatar_url,
      p.streak_count,
      p.xp_total
    FROM profiles p
    WHERE p.id = p_user_id
  ),
  -- 인증 통계 (전체)
  ver_stats AS (
    SELECT
      COUNT(*)::INT AS total,
      COALESCE(ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC
        / NULLIF(COUNT(*), 0)
      ), 0)::INT AS rate_pct
    FROM verifications
    WHERE user_id = p_user_id
  ),
  -- 참여중: ACTIVE/EXIT_ELIGIBLE
  joined AS (
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id', g.id, 'name', g.name) ORDER BY g.name) AS list
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id     = p_user_id
      AND gm.member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
      AND (g.challenge_end IS NULL OR g.challenge_end > NOW())
  ),
  -- 참여했던: ACTIVE/EXIT_ELIGIBLE로 끝까지 + 챌린지 종료됨
  past AS (
    SELECT JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', g.id,
        'name', g.name,
        'emoji', g.emoji,
        'cover', g.cover,
        'crew_rate', g.crew_rate,
        'crew_grade', g.crew_grade,
        'challenge_end', g.challenge_end
      ) ORDER BY g.challenge_end DESC
    ) AS list
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id     = p_user_id
      AND gm.member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
      AND g.challenge_end IS NOT NULL
      AND g.challenge_end <= NOW()
  )
  SELECT
    up.id,
    up.username,
    up.avatar_url,
    up.streak_count,
    up.xp_total,
    COALESCE((SELECT total FROM ver_stats), 0),
    COALESCE((SELECT rate_pct FROM ver_stats), 0),
    COALESCE((SELECT list FROM joined), '[]'::JSONB),
    COALESCE((SELECT list FROM past),   '[]'::JSONB)
  FROM user_profile up;
$$;

GRANT EXECUTE ON FUNCTION get_public_profile(UUID) TO anon, authenticated;
