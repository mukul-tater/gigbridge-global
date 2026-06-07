-- Ensure storage buckets exist (fixes "Bucket not found" on worker registration)

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('partner-worker-media', 'partner-worker-media', false),
  ('partner-documents', 'partner-documents', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Optional limits (ignore if columns missing on older Supabase)
DO $$
BEGIN
  UPDATE storage.buckets
  SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime'
    ]
  WHERE id = 'partner-worker-media';
EXCEPTION WHEN undefined_column THEN
  NULL;
END $$;

DROP POLICY IF EXISTS "Partners upload worker media" ON storage.objects;
DROP POLICY IF EXISTS "Partners read own worker media" ON storage.objects;
DROP POLICY IF EXISTS "Partners update own worker media" ON storage.objects;
DROP POLICY IF EXISTS "Partners delete own worker media" ON storage.objects;

CREATE POLICY "Partners upload worker media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'partner-worker-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Partners read own worker media"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'partner-worker-media'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Partners update own worker media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'partner-worker-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'partner-worker-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Partners delete own worker media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'partner-worker-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

NOTIFY pgrst, 'reload schema';
