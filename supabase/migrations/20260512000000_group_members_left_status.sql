-- group_members member_status 에 LEFT 추가
-- 자발적 탈퇴(LEFT) vs 강제 퇴장(REMOVED) 구분, 탈퇴 후 재참여 불가

ALTER TABLE group_members
  DROP CONSTRAINT IF EXISTS gm_status_chk;

ALTER TABLE group_members
  ADD CONSTRAINT gm_status_chk
  CHECK (member_status IN ('ACTIVE', 'EXIT_ELIGIBLE', 'REMOVED', 'LEFT'));
