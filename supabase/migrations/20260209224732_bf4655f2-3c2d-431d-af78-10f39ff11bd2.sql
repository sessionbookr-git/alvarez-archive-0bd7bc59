
-- Add DELETE policy for guitar-photos bucket so admins can remove files from storage
CREATE POLICY "Admins can delete guitar photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'guitar-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Add UPDATE policy for guitar-photos bucket (needed for replacing photos)
CREATE POLICY "Admins can update guitar photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'guitar-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
