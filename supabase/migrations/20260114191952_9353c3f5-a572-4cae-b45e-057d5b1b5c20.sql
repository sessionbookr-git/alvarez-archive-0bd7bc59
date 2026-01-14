-- Add community storytelling fields to guitars table
ALTER TABLE public.guitars
ADD COLUMN story text,
ADD COLUMN display_name text,
ADD COLUMN is_story_public boolean DEFAULT false,
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for public stories queries
CREATE INDEX idx_guitars_public_stories ON public.guitars (is_story_public, is_featured, approved_at DESC)
WHERE status = 'approved' AND is_story_public = true;