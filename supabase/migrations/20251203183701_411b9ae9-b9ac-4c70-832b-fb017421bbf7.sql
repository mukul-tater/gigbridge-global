-- Update handle_new_user to create employer/worker profiles based on role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert base profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Insert role from metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role);
    
    -- Create role-specific profile
    IF NEW.raw_user_meta_data->>'role' = 'employer' THEN
      INSERT INTO public.employer_profiles (user_id)
      VALUES (NEW.id);
    ELSIF NEW.raw_user_meta_data->>'role' = 'worker' THEN
      INSERT INTO public.worker_profiles (user_id)
      VALUES (NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create missing employer_profiles for existing employers who don't have one
INSERT INTO public.employer_profiles (user_id)
SELECT ur.user_id 
FROM public.user_roles ur
LEFT JOIN public.employer_profiles ep ON ep.user_id = ur.user_id
WHERE ur.role = 'employer' AND ep.user_id IS NULL;

-- Create missing worker_profiles for existing workers who don't have one
INSERT INTO public.worker_profiles (user_id)
SELECT ur.user_id 
FROM public.user_roles ur
LEFT JOIN public.worker_profiles wp ON wp.user_id = ur.user_id
WHERE ur.role = 'worker' AND wp.user_id IS NULL;