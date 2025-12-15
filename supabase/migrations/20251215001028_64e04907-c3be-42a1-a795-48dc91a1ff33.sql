-- Add photo_url column to models table
ALTER TABLE public.models ADD COLUMN photo_url TEXT;

-- Create storage bucket for model photos
INSERT INTO storage.buckets (id, name, public) VALUES ('model-photos', 'model-photos', true);

-- Allow anyone to view model photos
CREATE POLICY "Model photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'model-photos');

-- Allow admins to upload model photos
CREATE POLICY "Admins can upload model photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'model-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update model photos
CREATE POLICY "Admins can update model photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'model-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete model photos
CREATE POLICY "Admins can delete model photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'model-photos' AND has_role(auth.uid(), 'admin'::app_role));