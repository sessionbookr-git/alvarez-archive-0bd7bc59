
-- Fix the user update policy to use auth.email() instead of subquerying auth.users
DROP POLICY IF EXISTS "Users can update own pending submissions" ON public.guitars;

CREATE POLICY "Users can update own pending submissions"
ON public.guitars FOR UPDATE
USING (
  submitted_by_email = auth.email()
  AND status = 'pending'
)
WITH CHECK (
  submitted_by_email = auth.email()
  AND status = 'pending'
);
