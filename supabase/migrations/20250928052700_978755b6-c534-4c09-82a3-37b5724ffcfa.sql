-- Create app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Basic policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Now create RLS policies for worker onboarding without admin checks first
CREATE POLICY "Workers can manage their own onboarding" 
ON public.worker_onboarding 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Workers can manage their onboarding profile" 
ON public.worker_onboarding_profile 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.worker_onboarding 
  WHERE id = onboarding_id AND user_id = auth.uid()
));

CREATE POLICY "Workers can manage their documents" 
ON public.worker_onboarding_documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.worker_onboarding 
  WHERE id = onboarding_id AND user_id = auth.uid()
));

CREATE POLICY "Workers can manage their skills" 
ON public.worker_onboarding_skills 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.worker_onboarding 
  WHERE id = onboarding_id AND user_id = auth.uid()
));

CREATE POLICY "Workers can manage their certifications" 
ON public.worker_onboarding_certifications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.worker_onboarding 
  WHERE id = onboarding_id AND user_id = auth.uid()
));

CREATE POLICY "Workers can manage their work history" 
ON public.worker_onboarding_work_history 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.worker_onboarding 
  WHERE id = onboarding_id AND user_id = auth.uid()
));

CREATE POLICY "Workers can manage their languages" 
ON public.worker_onboarding_languages 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.worker_onboarding 
  WHERE id = onboarding_id AND user_id = auth.uid()
));

CREATE POLICY "Workers can manage their preferences" 
ON public.worker_onboarding_preferences 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.worker_onboarding 
  WHERE id = onboarding_id AND user_id = auth.uid()
));

-- Create storage bucket for onboarding documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('onboarding-documents', 'onboarding-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Workers can upload their documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'onboarding-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Workers can view their documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'onboarding-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create triggers for updated_at
CREATE TRIGGER update_worker_onboarding_updated_at
BEFORE UPDATE ON public.worker_onboarding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_onboarding_profile_updated_at
BEFORE UPDATE ON public.worker_onboarding_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_onboarding_documents_updated_at
BEFORE UPDATE ON public.worker_onboarding_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_onboarding_preferences_updated_at
BEFORE UPDATE ON public.worker_onboarding_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();