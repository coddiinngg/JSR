-- groups.member_count를 group_members 실제 수로 재계산
-- 초기 시딩 때 임의 값이 들어가 있어 실제 수와 달랐던 문제 수정
UPDATE groups
SET member_count = (
  SELECT COUNT(*)::int
  FROM group_members
  WHERE group_members.group_id = groups.id
);
