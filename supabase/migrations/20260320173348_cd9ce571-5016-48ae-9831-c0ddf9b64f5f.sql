
-- Add 'agent' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';

-- Create agent_profiles table
CREATE TABLE public.agent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  agency_name text,
  license_number text,
  regions_covered text[],
  commission_rate numeric DEFAULT 5,
  total_placements integer DEFAULT 0,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_profiles
CREATE POLICY "Agents can view their own profile"
  ON public.agent_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Agents can update their own profile"
  ON public.agent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Agents can create their own profile"
  ON public.agent_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all agent profiles"
  ON public.agent_profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_agent_profiles_updated_at
  BEFORE UPDATE ON public.agent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to create agent profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert base profile
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
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
    ELSIF NEW.raw_user_meta_data->>'role' = 'agent' THEN
      INSERT INTO public.agent_profiles (user_id)
      VALUES (NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
