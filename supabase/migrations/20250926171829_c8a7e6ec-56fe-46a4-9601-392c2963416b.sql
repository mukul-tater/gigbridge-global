-- Create custom types for the platform
CREATE TYPE public.worker_status AS ENUM ('pending', 'verified', 'suspended', 'blocked');
CREATE TYPE public.employer_status AS ENUM ('pending', 'verified', 'suspended', 'blocked');
CREATE TYPE public.job_status AS ENUM ('draft', 'published', 'filled', 'expired', 'cancelled');
CREATE TYPE public.contract_status AS ENUM ('pending', 'signed', 'active', 'completed', 'cancelled');
CREATE TYPE public.visa_status AS ENUM ('not_required', 'pending', 'approved', 'rejected', 'expired');
CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE public.document_type AS ENUM ('passport', 'aadhaar', 'visa', 'certificate', 'license', 'photo', 'resume', 'contract');

-- Worker profiles table
CREATE TABLE public.worker_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT NOT NULL,
  passport_number TEXT,
  aadhaar_number TEXT,
  profile_photo_url TEXT,
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  preferred_countries TEXT[] DEFAULT '{}',
  expected_min_salary DECIMAL(10,2),
  expected_max_salary DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  available_from DATE,
  contract_duration_months INTEGER,
  status worker_status DEFAULT 'pending',
  kyc_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employer profiles table  
CREATE TABLE public.employer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_registration_number TEXT,
  industry TEXT NOT NULL,
  company_size TEXT,
  website_url TEXT,
  description TEXT,
  contact_person_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  status employer_status DEFAULT 'pending',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Skills catalog
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Worker skills junction table
CREATE TABLE public.worker_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level skill_level DEFAULT 'intermediate',
  years_experience INTEGER DEFAULT 0,
  certified BOOLEAN DEFAULT FALSE,
  certificate_url TEXT,
  UNIQUE(worker_id, skill_id)
);

-- Job postings table
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  job_type TEXT NOT NULL,
  min_salary DECIMAL(10,2),
  max_salary DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  contract_duration_months INTEGER,
  positions_available INTEGER DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,
  visa_sponsorship BOOLEAN DEFAULT FALSE,
  accommodation_provided BOOLEAN DEFAULT FALSE,
  food_provided BOOLEAN DEFAULT FALSE,
  transport_provided BOOLEAN DEFAULT FALSE,
  insurance_provided BOOLEAN DEFAULT FALSE,
  requirements TEXT,
  benefits TEXT,
  application_deadline DATE,
  status job_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job required skills junction table
CREATE TABLE public.job_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  required_level skill_level DEFAULT 'intermediate',
  is_mandatory BOOLEAN DEFAULT TRUE,
  UNIQUE(job_id, skill_id)
);

-- Job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  expected_salary DECIMAL(10,2),
  available_from DATE,
  visa_status visa_status DEFAULT 'not_required',
  application_status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(job_id, worker_id)
);

-- Documents table for KYC and certifications
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  contract_terms TEXT NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE,
  status contract_status DEFAULT 'pending',
  worker_signed_at TIMESTAMP WITH TIME ZONE,
  employer_signed_at TIMESTAMP WITH TIME ZONE,
  contract_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payer_id UUID NOT NULL,
  payee_id UUID,
  contract_id UUID REFERENCES public.contracts(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_type TEXT NOT NULL, -- 'onboarding_fee', 'deposit', 'salary', 'platform_fee'
  description TEXT,
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages table for in-app communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  job_id UUID REFERENCES public.job_postings(id),
  contract_id UUID REFERENCES public.contracts(id),
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'job_match', 'application', 'contract', 'payment', 'document'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  sent_via TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms', 'whatsapp'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert common skills
INSERT INTO public.skills (name, category) VALUES
('Electrical Installation', 'Electrical'),
('Electrical Maintenance', 'Electrical'),
('Industrial Wiring', 'Electrical'),
('Plumbing Installation', 'Plumbing'),
('Pipe Fitting', 'Plumbing'),
('Welding - MIG', 'Welding'),
('Welding - TIG', 'Welding'),
('Arc Welding', 'Welding'),
('Concrete Work', 'Construction'),
('Carpentry', 'Construction'),
('Masonry', 'Construction'),
('Painting', 'Construction'),
('Heavy Equipment Operation', 'Construction'),
('Food Delivery', 'Delivery'),
('Package Delivery', 'Delivery'),
('Motorcycle Riding', 'Delivery'),
('Safety Protocols', 'General'),
('Quality Control', 'General'),
('Team Leadership', 'General'),
('Equipment Maintenance', 'General');

-- Enable RLS on all tables
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Worker Profiles
CREATE POLICY "Workers can view their own profile" ON public.worker_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Workers can update their own profile" ON public.worker_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Workers can insert their own profile" ON public.worker_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Employers can view verified worker profiles" ON public.worker_profiles
  FOR SELECT USING (status = 'verified');

-- RLS Policies for Employer Profiles  
CREATE POLICY "Employers can view their own profile" ON public.employer_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Employers can update their own profile" ON public.employer_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Employers can insert their own profile" ON public.employer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Workers can view verified employer profiles" ON public.employer_profiles
  FOR SELECT USING (status = 'verified');

-- RLS Policies for Skills (public read)
CREATE POLICY "Anyone can view skills" ON public.skills
  FOR SELECT USING (TRUE);

-- RLS Policies for Worker Skills
CREATE POLICY "Workers can manage their own skills" ON public.worker_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles 
      WHERE id = worker_skills.worker_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Employers can view worker skills" ON public.worker_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles 
      WHERE id = worker_skills.worker_id AND status = 'verified'
    )
  );

-- RLS Policies for Job Postings
CREATE POLICY "Employers can manage their own jobs" ON public.job_postings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles 
      WHERE id = job_postings.employer_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Workers can view published jobs" ON public.job_postings
  FOR SELECT USING (status = 'published');

-- RLS Policies for Job Applications
CREATE POLICY "Workers can manage their own applications" ON public.job_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles 
      WHERE id = job_applications.worker_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Employers can view applications for their jobs" ON public.job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings jp
      JOIN public.employer_profiles ep ON jp.employer_id = ep.id
      WHERE jp.id = job_applications.job_id AND ep.user_id = auth.uid()
    )
  );

-- RLS Policies for Documents
CREATE POLICY "Users can manage their own documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Messages
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for Notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_worker_profiles_user_id ON public.worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_status ON public.worker_profiles(status);
CREATE INDEX idx_employer_profiles_user_id ON public.employer_profiles(user_id);
CREATE INDEX idx_employer_profiles_status ON public.employer_profiles(status);
CREATE INDEX idx_job_postings_employer_id ON public.job_postings(employer_id);
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_country ON public.job_postings(country);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_worker_id ON public.job_applications(worker_id);
CREATE INDEX idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_worker_profiles_updated_at
  BEFORE UPDATE ON public.worker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at
  BEFORE UPDATE ON public.employer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();