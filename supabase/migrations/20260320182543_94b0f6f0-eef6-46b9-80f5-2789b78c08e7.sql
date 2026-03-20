-- Add a salary_display column to the jobs table for custom salary strings
ALTER TABLE public.jobs ADD COLUMN salary_display TEXT;

-- Update the specific jobs with the user's requested text
UPDATE public.jobs SET salary_display = '₹100000
' WHERE id = 'b1396ac1-47f6-48a5-ade0-1bc5b0f07d40';

UPDATE public.jobs SET salary_display = '90000' WHERE id = 'b44da5e3-d5e0-4ca1-8c46-9e1086e28d25';

UPDATE public.jobs SET salary_display = '₹83000-100000' WHERE id = '58bfe417-b98f-436a-9dfd-c4ac68a83f95';

UPDATE public.jobs SET salary_display = '₹165K - ₹265k' WHERE id = 'dbde159e-a90d-4a64-adc8-39faddab9a23';
