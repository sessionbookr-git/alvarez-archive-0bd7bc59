
-- 1. Add submitted_by_user_id to guitars
ALTER TABLE public.guitars ADD COLUMN submitted_by_user_id UUID;

-- 2. Backfill from auth.users
UPDATE public.guitars g
SET submitted_by_user_id = au.id
FROM auth.users au
WHERE g.submitted_by_email = au.email;

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: users can read own profile, admins can read all
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Backfill profiles from existing auth.users
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Update RLS policies on guitars for user_id ownership
DROP POLICY IF EXISTS "Users can view own submissions" ON public.guitars;
CREATE POLICY "Users can view own submissions"
ON public.guitars FOR SELECT
TO authenticated
USING (submitted_by_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own pending submissions" ON public.guitars;
CREATE POLICY "Users can update own pending submissions"
ON public.guitars FOR UPDATE
TO authenticated
USING (submitted_by_user_id = auth.uid() AND status = 'pending')
WITH CHECK (submitted_by_user_id = auth.uid() AND status = 'pending');
