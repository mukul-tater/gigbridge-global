
-- Partners can manage their own folder in partner-documents
CREATE POLICY "Partners read own partner documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'partner-documents'
    AND (auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Partners upload own partner documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Partners update own partner documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'partner-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Partners delete own partner documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'partner-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]);
