-- Create formalities for existing approved applications that have valid job_id references
INSERT INTO public.job_formalities (application_id, worker_id, job_id, visa_required, ecr_check_required, medical_exam_required, police_verification_required)
SELECT ja.id, ja.worker_id, ja.job_id, true, true, true, true
FROM public.job_applications ja
INNER JOIN public.jobs j ON j.id = ja.job_id
WHERE ja.status = 'APPROVED'
AND NOT EXISTS (SELECT 1 FROM public.job_formalities jf WHERE jf.application_id = ja.id);