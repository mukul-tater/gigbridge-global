-- Add slug column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS jobs_slug_idx ON public.jobs (slug);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_job_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from title (lowercase, replace spaces with hyphens, remove special chars)
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Add short ID suffix (first 8 chars of UUID)
  final_slug := base_slug || '-' || substring(NEW.id::text from 1 for 8);
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM jobs WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || substring(NEW.id::text from 1 for 8) || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-generate slug on insert/update
DROP TRIGGER IF EXISTS generate_job_slug_trigger ON public.jobs;
CREATE TRIGGER generate_job_slug_trigger
BEFORE INSERT OR UPDATE OF title ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.generate_job_slug();

-- Update existing jobs with slugs
UPDATE public.jobs SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
UPDATE public.jobs SET slug = regexp_replace(slug, '\s+', '-', 'g');
UPDATE public.jobs SET slug = regexp_replace(slug, '-+', '-', 'g');
UPDATE public.jobs SET slug = trim(both '-' from slug) || '-' || substring(id::text from 1 for 8);