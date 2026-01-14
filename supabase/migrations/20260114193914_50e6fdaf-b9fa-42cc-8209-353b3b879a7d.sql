-- Add fields for user-submitted model info and guitar specifications
-- This allows displaying model name even when not matched to models table

ALTER TABLE public.guitars
ADD COLUMN IF NOT EXISTS model_name_submitted text,
ADD COLUMN IF NOT EXISTS body_style text,
ADD COLUMN IF NOT EXISTS country_of_origin text,
ADD COLUMN IF NOT EXISTS electronics text,
ADD COLUMN IF NOT EXISTS finish_type text,
ADD COLUMN IF NOT EXISTS top_wood text,
ADD COLUMN IF NOT EXISTS back_sides_wood text;

-- Add comments for clarity
COMMENT ON COLUMN public.guitars.model_name_submitted IS 'User-submitted model name for display when model_id not matched';
COMMENT ON COLUMN public.guitars.body_style IS 'Dreadnought, Concert, Parlor, Jumbo, etc.';
COMMENT ON COLUMN public.guitars.electronics IS 'Acoustic-Electric, Pure Acoustic, etc.';
COMMENT ON COLUMN public.guitars.top_wood IS 'Spruce, Cedar, Mahogany, etc.';
COMMENT ON COLUMN public.guitars.back_sides_wood IS 'Rosewood, Mahogany, Walnut, etc.';