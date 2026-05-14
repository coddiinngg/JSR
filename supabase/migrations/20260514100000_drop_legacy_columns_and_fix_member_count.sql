-- ============================================================
-- 레거시 컬럼 제거 + member_count 트리거 수정
--
-- 변경:
--   1. groups.{rate, my_rank, my_rate, my_streak, status, status_color} 제거
--      → 모두 사용 안 함. rate/my_*는 leaderboard RPC가, status는 phase 계산으로 대체
--   2. profiles.joined_group_ids 제거
--      → group_members 테이블이 source of truth
--   3. member_count 트리거: ACTIVE/EXIT_ELIGIBLE만 카운트
--      → LEFT/REMOVED 포함하던 버그 수정
-- ============================================================

-- 1. groups 레거시 컬럼 제거
ALTER TABLE groups
  DROP COLUMN IF EXISTS rate,
  DROP COLUMN IF EXISTS my_rank,
  DROP COLUMN IF EXISTS my_rate,
  DROP COLUMN IF EXISTS my_streak,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS status_color;

-- 2. profiles 레거시 컬럼 제거
ALTER TABLE profiles
  DROP COLUMN IF EXISTS joined_group_ids;

-- 3. member_count 트리거 함수 재정의 — ACTIVE/EXIT_ELIGIBLE만 카운트
CREATE OR REPLACE FUNCTION adjust_group_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID;
BEGIN
  v_group_id := COALESCE(NEW.group_id, OLD.group_id);

  UPDATE groups g
  SET member_count = (
    SELECT COUNT(*)::INT
    FROM group_members gm
    WHERE gm.group_id = v_group_id
      AND gm.member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
  )
  WHERE g.id = v_group_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. UPDATE 트리거 추가 — member_status 변경 시 카운트 재계산
DROP TRIGGER IF EXISTS group_members_adjust_count_update ON group_members;
CREATE TRIGGER group_members_adjust_count_update
AFTER UPDATE OF member_status ON group_members
FOR EACH ROW
WHEN (OLD.member_status IS DISTINCT FROM NEW.member_status)
EXECUTE FUNCTION adjust_group_member_count();

-- 5. 기존 모든 그룹 member_count 재계산
UPDATE groups g
SET member_count = (
  SELECT COUNT(*)::INT
  FROM group_members gm
  WHERE gm.group_id = g.id
    AND gm.member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
);
