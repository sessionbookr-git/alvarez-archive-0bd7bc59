-- Add publish status to models for staging workflow
ALTER TABLE public.models
ADD COLUMN is_published boolean DEFAULT true;

-- Create index for efficient filtering
CREATE INDEX idx_models_published ON public.models (is_published) WHERE is_published = true;

-- Add a comment explaining the field
COMMENT ON COLUMN public.models.is_published IS 'When false, model is hidden from public encyclopedia (staging/draft mode)';