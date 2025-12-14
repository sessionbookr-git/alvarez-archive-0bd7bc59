-- Create invite_codes table for single-use registration codes
CREATE TABLE public.invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone,
  used_by_email text,
  created_by uuid REFERENCES auth.users(id),
  notes text
);

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can view all invite codes
CREATE POLICY "Admins can manage invite_codes"
ON public.invite_codes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can check if a code is valid (for signup validation)
CREATE POLICY "Anyone can validate unused codes"
ON public.invite_codes
FOR SELECT
TO anon, authenticated
USING (used_at IS NULL);

-- Allow marking a code as used during signup (anon user)
CREATE POLICY "Anyone can use a valid code"
ON public.invite_codes
FOR UPDATE
TO anon, authenticated
USING (used_at IS NULL)
WITH CHECK (used_at IS NOT NULL);