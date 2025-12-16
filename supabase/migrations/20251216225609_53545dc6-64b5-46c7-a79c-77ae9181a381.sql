-- Create junction table linking models to identifying features
CREATE TABLE public.model_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.identifying_features(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(model_id, feature_id)
);

-- Enable RLS
ALTER TABLE public.model_features ENABLE ROW LEVEL SECURITY;

-- Public can read (needed for identify wizard)
CREATE POLICY "Model features are viewable by everyone" 
ON public.model_features
FOR SELECT USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage model_features" 
ON public.model_features
FOR ALL USING (public.has_role(auth.uid(), 'admin'));