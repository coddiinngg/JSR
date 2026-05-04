-- verifications 스토리지 버킷 생성 + RLS
-- Edge Function(service role)이 업로드하고, 누구나 공개 조회 가능

INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', true)
ON CONFLICT (id) DO NOTHING;

-- 공개 조회
DROP POLICY IF EXISTS "verifications_public_select" ON storage.objects;
CREATE POLICY "verifications_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'verifications');

-- 본인 폴더에만 업로드 (클라이언트 직접 업로드 허용; Edge Function은 service role로 우회)
DROP POLICY IF EXISTS "verifications_owner_insert" ON storage.objects;
CREATE POLICY "verifications_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verifications'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
