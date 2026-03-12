ALTER TABLE public.models ADD COLUMN IF NOT EXISTS product_status text DEFAULT 'current';
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS source_url text;