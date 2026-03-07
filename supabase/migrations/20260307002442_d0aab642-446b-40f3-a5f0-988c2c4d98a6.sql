
DROP FUNCTION IF EXISTS public.redeem_invite_code(_code text, _email text);

CREATE OR REPLACE FUNCTION public.validate_and_redeem_invite_code(_code text, _email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE invite_codes
  SET used_at = now(),
      used_by_email = _email
  WHERE code = _code
    AND used_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Grant execute to anon and authenticated so PostgREST exposes it
GRANT EXECUTE ON FUNCTION public.validate_and_redeem_invite_code(text, text) TO anon, authenticated;
