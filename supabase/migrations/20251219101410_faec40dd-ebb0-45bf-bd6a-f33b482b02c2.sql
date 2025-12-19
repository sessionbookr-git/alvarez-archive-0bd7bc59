-- Create table for multiple model photos
CREATE TABLE public.model_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.model_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Model photos are viewable by everyone" 
ON public.model_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage model_photos" 
ON public.model_photos 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_model_photos_model_id ON public.model_photos(model_id);
CREATE INDEX idx_model_photos_order ON public.model_photos(model_id, photo_order);