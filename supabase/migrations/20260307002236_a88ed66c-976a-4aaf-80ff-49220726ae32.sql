
CREATE OR REPLACE FUNCTION public.redeem_invite_code(_code text, _email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _found boolean;
BEGIN
  UPDATE invite_codes
  SET used_at = now(),
      used_by_email = _email
  WHERE code = _code
    AND used_at IS NULL;
  
  GET DIAGNOSTICS _found = ROW_COUNT;
  RETURN _found > 0;
END;
$$;
