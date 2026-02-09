
-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can manage guitars" ON public.guitars;
DROP POLICY IF EXISTS "Admins can view all guitars including pending" ON public.guitars;
DROP POLICY IF EXISTS "Anyone can submit a guitar" ON public.guitars;
DROP POLICY IF EXISTS "Approved guitars are viewable by everyone" ON public.guitars;
DROP POLICY IF EXISTS "Users can update own pending submissions" ON public.guitars;

-- Recreate as PERMISSIVE (default) so any matching policy grants access
CREATE POLICY "Admins can manage guitars"
ON public.guitars FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Approved guitars are viewable by everyone"
ON public.guitars FOR SELECT
USING (status = 'approved');

CREATE POLICY "Anyone can submit a guitar"
ON public.guitars FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own pending submissions"
ON public.guitars FOR UPDATE
USING (
  submitted_by_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
)
WITH CHECK (
  submitted_by_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
);

-- Also fix guitar_photos policies (same restrictive issue for admin deletes)
DROP POLICY IF EXISTS "Admins can manage guitar_photos" ON public.guitar_photos;
DROP POLICY IF EXISTS "Anyone can upload guitar photos" ON public.guitar_photos;
DROP POLICY IF EXISTS "Photos of approved guitars are viewable" ON public.guitar_photos;

CREATE POLICY "Admins can manage guitar_photos"
ON public.guitar_photos FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can upload guitar photos"
ON public.guitar_photos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Photos of approved guitars are viewable"
ON public.guitar_photos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM guitars WHERE guitars.id = guitar_photos.guitar_id AND guitars.status = 'approved'
));
