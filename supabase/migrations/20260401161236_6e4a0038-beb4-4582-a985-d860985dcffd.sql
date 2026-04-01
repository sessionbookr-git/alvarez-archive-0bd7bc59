CREATE TABLE public.serial_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT NOT NULL,
  neck_block TEXT,
  is_match BOOLEAN NOT NULL,
  correction_notes TEXT,
  parsed_year INTEGER,
  parsed_country TEXT,
  parsed_format TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.serial_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can submit feedback
CREATE POLICY "Authenticated users can submit feedback"
ON public.serial_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can manage serial_feedback"
ON public.serial_feedback
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view own feedback
CREATE POLICY "Users can view own feedback"
ON public.serial_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);