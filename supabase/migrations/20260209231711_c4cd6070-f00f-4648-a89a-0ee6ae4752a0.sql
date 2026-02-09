
CREATE POLICY "Users can view own submissions"
ON public.guitars
FOR SELECT
USING (submitted_by_email = auth.email());
