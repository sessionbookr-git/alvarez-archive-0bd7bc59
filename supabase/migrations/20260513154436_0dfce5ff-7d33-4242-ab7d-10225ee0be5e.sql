-- Reset Chris's password and ensure account is properly set up
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'chris.meikle@stlouismusic.com';

  IF v_user_id IS NULL THEN
    -- Create user
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      'chris.meikle@stlouismusic.com', crypt('AlvarezYairi_1965!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
    VALUES (gen_random_uuid(), v_user_id, v_user_id::text,
      json_build_object('sub', v_user_id::text, 'email', 'chris.meikle@stlouismusic.com', 'email_verified', true)::jsonb,
      'email', now(), now(), now());
  ELSE
    -- Reset password and confirm email
    UPDATE auth.users
    SET encrypted_password = crypt('AlvarezYairi_1965!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now(),
        confirmation_token = '',
        recovery_token = ''
    WHERE id = v_user_id;

    -- Ensure identity exists
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id AND provider = 'email') THEN
      INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
      VALUES (gen_random_uuid(), v_user_id, v_user_id::text,
        json_build_object('sub', v_user_id::text, 'email', 'chris.meikle@stlouismusic.com', 'email_verified', true)::jsonb,
        'email', now(), now(), now());
    END IF;
  END IF;
END $$;