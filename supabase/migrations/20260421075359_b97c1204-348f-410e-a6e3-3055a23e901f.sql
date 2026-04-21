DROP FUNCTION IF EXISTS public.list_public_workers(integer);

CREATE OR REPLACE FUNCTION public.list_public_workers(p_limit integer DEFAULT 24)
 RETURNS TABLE(
   user_id uuid,
   display_name text,
   avatar_url text,
   nationality text,
   current_location text,
   primary_work_type text,
   years_of_experience numeric,
   skill_level text,
   has_passport boolean,
   has_visa boolean,
   availability text,
   top_skills text[],
   video_url text,
   verified_documents text[],
   certifications_count integer,
   languages text[],
   open_to_relocation boolean,
   preferred_shift text,
   ecr_status text,
   last_active_at timestamptz
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    wp.user_id,
    CASE
      WHEN p.full_name IS NULL OR length(trim(p.full_name)) = 0 THEN 'Worker'
      WHEN position(' ' in trim(p.full_name)) = 0 THEN split_part(trim(p.full_name), ' ', 1)
      ELSE split_part(trim(p.full_name), ' ', 1) || ' ' || left(split_part(trim(p.full_name), ' ', 2), 1) || '.'
    END AS display_name,
    p.avatar_url,
    wp.nationality,
    COALESCE(wp.current_city, wp.current_location) AS current_location,
    wp.primary_work_type,
    wp.years_of_experience::numeric,
    wp.skill_level,
    COALESCE(wp.has_passport, false) AS has_passport,
    COALESCE(wp.has_visa, false) AS has_visa,
    wp.availability,
    COALESCE(
      (SELECT array_agg(ws.skill_name ORDER BY ws.skill_name)
       FROM (
         SELECT skill_name FROM public.worker_skills
         WHERE worker_id = wp.user_id
         LIMIT 5
       ) ws),
      '{}'::text[]
    ) AS top_skills,
    (SELECT wv.video_url
     FROM public.worker_videos wv
     WHERE wv.worker_id = wp.user_id
     ORDER BY wv.created_at DESC NULLS LAST
     LIMIT 1) AS video_url,
    COALESCE(
      (SELECT array_agg(DISTINCT wd.document_type)
       FROM public.worker_documents wd
       WHERE wd.worker_id = wp.user_id
         AND wd.verification_status = 'verified'),
      '{}'::text[]
    ) AS verified_documents,
    COALESCE(
      (SELECT count(*)::int FROM public.worker_certifications wc
       WHERE wc.worker_id = wp.user_id),
      0
    ) AS certifications_count,
    COALESCE(wp.languages, '{}'::text[]) AS languages,
    COALESCE(wp.open_to_relocation, false) AS open_to_relocation,
    wp.preferred_shift,
    wp.ecr_status,
    wp.updated_at AS last_active_at
  FROM public.worker_profiles wp
  LEFT JOIN public.profiles p ON p.id = wp.user_id
  ORDER BY wp.updated_at DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(p_limit, 200));
$function$;