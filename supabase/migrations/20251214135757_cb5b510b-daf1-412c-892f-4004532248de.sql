-- Create storage bucket for guitar photos
INSERT INTO storage.buckets (id, name, public) VALUES ('guitar-photos', 'guitar-photos', true);

-- Storage policies for guitar photos
CREATE POLICY "Anyone can view guitar photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'guitar-photos');

CREATE POLICY "Anyone can upload guitar photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'guitar-photos');

-- Create admin role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Admin policies for all tables
CREATE POLICY "Admins can manage models"
ON public.models FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage guitars"
ON public.guitars FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all guitars including pending"
ON public.guitars FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage guitar_photos"
ON public.guitar_photos FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage serial_patterns"
ON public.serial_patterns FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage identifying_features"
ON public.identifying_features FOR ALL
USING (public.has_role(auth.uid(), 'admin'));