-- ==========================================
-- ALVAREZ LEGACY ARCHIVE DATABASE SCHEMA
-- ==========================================

-- Table 1: models (guitar model reference data)
CREATE TABLE public.models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  production_start_year INTEGER,
  production_end_year INTEGER,
  country_of_manufacture TEXT CHECK (country_of_manufacture IN ('Japan', 'Korea', 'China', 'USA')),
  series TEXT,
  body_shape TEXT,
  description TEXT,
  key_features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on models
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Models are publicly readable (reference data)
CREATE POLICY "Models are viewable by everyone" 
ON public.models FOR SELECT 
USING (true);

-- Table 2: guitars (user-submitted guitar examples)
CREATE TABLE public.guitars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES public.models(id) ON DELETE SET NULL,
  serial_number TEXT NOT NULL,
  neck_block_number TEXT,
  estimated_year INTEGER,
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('high', 'medium', 'low')),
  tuner_type TEXT,
  truss_rod_location TEXT,
  bridge_style TEXT,
  label_type TEXT,
  label_color TEXT,
  submitted_by_email TEXT,
  submission_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on guitars
ALTER TABLE public.guitars ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved guitars
CREATE POLICY "Approved guitars are viewable by everyone" 
ON public.guitars FOR SELECT 
USING (status = 'approved');

-- Anyone can submit a guitar (insert)
CREATE POLICY "Anyone can submit a guitar" 
ON public.guitars FOR INSERT 
WITH CHECK (true);

-- Table 3: guitar_photos
CREATE TABLE public.guitar_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guitar_id UUID NOT NULL REFERENCES public.guitars(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('headstock', 'body', 'label', 'back', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on guitar_photos
ALTER TABLE public.guitar_photos ENABLE ROW LEVEL SECURITY;

-- Photos of approved guitars are publicly visible
CREATE POLICY "Photos of approved guitars are viewable" 
ON public.guitar_photos FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.guitars 
    WHERE guitars.id = guitar_photos.guitar_id 
    AND guitars.status = 'approved'
  )
);

-- Anyone can insert photos (with a guitar submission)
CREATE POLICY "Anyone can upload guitar photos" 
ON public.guitar_photos FOR INSERT 
WITH CHECK (true);

-- Table 4: serial_patterns (for intelligent serial lookup)
CREATE TABLE public.serial_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE,
  serial_prefix TEXT,
  serial_range_start TEXT,
  serial_range_end TEXT,
  year_range_start INTEGER NOT NULL,
  year_range_end INTEGER NOT NULL,
  confidence_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on serial_patterns
ALTER TABLE public.serial_patterns ENABLE ROW LEVEL SECURITY;

-- Serial patterns are publicly readable (reference data)
CREATE POLICY "Serial patterns are viewable by everyone" 
ON public.serial_patterns FOR SELECT 
USING (true);

-- Table 5: identifying_features (reference library)
CREATE TABLE public.identifying_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_category TEXT NOT NULL CHECK (feature_category IN ('tuner', 'truss_rod', 'bridge', 'label', 'body_shape')),
  feature_name TEXT NOT NULL,
  feature_value TEXT,
  description TEXT,
  photo_url TEXT,
  era_start INTEGER,
  era_end INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on identifying_features
ALTER TABLE public.identifying_features ENABLE ROW LEVEL SECURITY;

-- Features are publicly readable (reference data)
CREATE POLICY "Features are viewable by everyone" 
ON public.identifying_features FOR SELECT 
USING (true);

-- ==========================================
-- TRIGGER: Auto-update updated_at on models
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_models_updated_at
BEFORE UPDATE ON public.models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- INDEXES for performance
-- ==========================================
CREATE INDEX idx_guitars_serial_number ON public.guitars(serial_number);
CREATE INDEX idx_guitars_status ON public.guitars(status);
CREATE INDEX idx_guitars_model_id ON public.guitars(model_id);
CREATE INDEX idx_serial_patterns_model_id ON public.serial_patterns(model_id);
CREATE INDEX idx_models_series ON public.models(series);
CREATE INDEX idx_models_country ON public.models(country_of_manufacture);