-- Create training_courses table for training content
CREATE TABLE public.training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  duration_hours INTEGER,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker_training_enrollments table to track worker progress
CREATE TABLE public.worker_training_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  progress INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(worker_id, course_id)
);

-- Enable RLS
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_training_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_courses (viewable by all authenticated users)
CREATE POLICY "Anyone can view active training courses"
ON public.training_courses
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage training courses"
ON public.training_courses
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for worker_training_enrollments
CREATE POLICY "Workers can view their own enrollments"
ON public.worker_training_enrollments
FOR SELECT
USING (auth.uid() = worker_id);

CREATE POLICY "Workers can enroll themselves"
ON public.worker_training_enrollments
FOR INSERT
WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update their own enrollments"
ON public.worker_training_enrollments
FOR UPDATE
USING (auth.uid() = worker_id);

-- Trigger for updated_at
CREATE TRIGGER update_training_courses_updated_at
BEFORE UPDATE ON public.training_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_training_enrollments_updated_at
BEFORE UPDATE ON public.worker_training_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some default training courses
INSERT INTO public.training_courses (name, description, category, duration_hours, is_mandatory) VALUES
('Pre-Departure Orientation Training (PDOT)', 'Mandatory orientation for workers traveling abroad covering immigration procedures, rights, and responsibilities.', 'orientation', 8, true),
('Safety & Health Training', 'Workplace safety regulations, hazard identification, and emergency procedures.', 'safety', 6, true),
('Cultural Sensitivity Training', 'Understanding local customs, workplace culture, and communication practices.', 'culture', 4, false),
('Language Proficiency - English Basics', 'Basic English communication skills for workplace environments.', 'language', 20, false),
('Technical Skills - Construction Safety', 'Specialized safety training for construction industry workers.', 'technical', 8, false),
('Financial Literacy Training', 'Managing finances, remittances, and understanding employment contracts.', 'general', 4, false);