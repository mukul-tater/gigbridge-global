-- Drop the existing incorrect foreign key
ALTER TABLE public.jobs DROP CONSTRAINT jobs_employer_id_fkey;

-- Add the correct foreign key referencing employer_profiles
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_employer_id_fkey 
FOREIGN KEY (employer_id) 
REFERENCES public.employer_profiles(user_id) 
ON DELETE CASCADE;