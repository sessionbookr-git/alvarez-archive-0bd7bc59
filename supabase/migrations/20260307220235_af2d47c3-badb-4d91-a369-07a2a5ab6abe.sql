
-- 1. Create a secure function to check invite codes without exposing all codes
CREATE OR REPLACE FUNCTION public.check_invite_code(_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object('valid', true, 'notes', ic.notes)
  INTO result
  FROM invite_codes ic
  WHERE ic.code = upper(_code)
    AND ic.used_at IS NULL;

  IF result IS NULL THEN
    RETURN json_build_object('valid', false, 'notes', null);
  END IF;

  RETURN result;
END;
$$;

-- 2. Drop overly permissive invite_codes policies
DROP POLICY IF EXISTS "Anyone can validate unused codes" ON invite_codes;
DROP POLICY IF EXISTS "Anyone can use a valid code" ON invite_codes;

-- 3. Fix models: only published models visible publicly
DROP POLICY IF EXISTS "Models are viewable by everyone" ON models;
CREATE POLICY "Published models are viewable by everyone"
ON models FOR SELECT
USING (is_published = true);

-- 4. Tighten guitar submission INSERT to require authentication
DROP POLICY IF EXISTS "Anyone can submit a guitar" ON guitars;
CREATE POLICY "Authenticated users can submit a guitar"
ON guitars FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Tighten guitar photos INSERT to require authentication
DROP POLICY IF EXISTS "Anyone can upload guitar photos" ON guitar_photos;
CREATE POLICY "Authenticated users can upload guitar photos"
ON guitar_photos FOR INSERT
TO authenticated
WITH CHECK (true);
