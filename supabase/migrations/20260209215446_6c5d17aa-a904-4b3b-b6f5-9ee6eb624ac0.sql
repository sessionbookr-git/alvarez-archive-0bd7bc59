
-- Allow users to update their own pending submissions
CREATE POLICY "Users can update own pending submissions"
ON public.guitars
FOR UPDATE
USING (
  submitted_by_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
)
WITH CHECK (
  submitted_by_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
);
