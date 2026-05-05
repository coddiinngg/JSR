-- Public, privacy-limited profile reads for user profile pages and friend search.

CREATE OR REPLACE FUNCTION get_public_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  streak_count INT,
  xp_total INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.streak_count,
    p.xp_total
  FROM profiles p
  WHERE p.id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION search_public_profiles(p_query TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url
  FROM profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND p.username IS NOT NULL
    AND char_length(trim(COALESCE(p_query, ''))) >= 2
    AND p.username ILIKE '%' || trim(p_query) || '%'
  ORDER BY p.username ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 30));
$$;

GRANT EXECUTE ON FUNCTION get_public_profile(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_public_profiles(TEXT, INT) TO authenticated;
