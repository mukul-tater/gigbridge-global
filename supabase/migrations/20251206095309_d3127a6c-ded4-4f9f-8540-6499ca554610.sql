-- Update trigger function to check if job exists before creating formalities
CREATE OR REPLACE FUNCTION public.create_job_formalities_on_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = 'APPROVED' AND OLD.status != 'APPROVED') THEN
    -- Only insert if the job still exists
    IF EXISTS (SELECT 1 FROM public.jobs WHERE id = NEW.job_id) THEN
      INSERT INTO public.job_formalities (
        application_id,
        worker_id,
        job_id,
        visa_required,
        ecr_check_required,
        medical_exam_required,
        police_verification_required
      )
      VALUES (
        NEW.id,
        NEW.worker_id,
        NEW.job_id,
        true,
        true,
        true,
        true
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;