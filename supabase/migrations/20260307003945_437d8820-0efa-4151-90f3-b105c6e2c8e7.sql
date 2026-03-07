
-- Access requests / waitlist table
CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a request
CREATE POLICY "Anyone can submit access request"
  ON public.access_requests FOR INSERT
  WITH CHECK (true);

-- Admins can manage all requests
CREATE POLICY "Admins can manage access_requests"
  ON public.access_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add notes column to invite_codes for storing sender name context
-- (already has notes column, so skip)
