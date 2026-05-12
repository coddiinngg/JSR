-- group_members UPDATE RLS 정책 추가
-- LEFT 멤버가 재참여(ACTIVE로 UPDATE)할 수 있도록 허용
CREATE POLICY "group_members_update"
  ON group_members
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
