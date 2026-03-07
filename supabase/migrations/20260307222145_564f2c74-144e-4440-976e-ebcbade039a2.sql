
-- Add foreign key from guitars.submitted_by_user_id to profiles.id
ALTER TABLE public.guitars
ADD CONSTRAINT guitars_submitted_by_user_id_fkey
FOREIGN KEY (submitted_by_user_id) REFERENCES public.profiles(id);
