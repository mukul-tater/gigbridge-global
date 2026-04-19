CREATE OR REPLACE FUNCTION public.list_public_workers(p_limit int DEFAULT 24)
RETURNS TABLE (
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
  top_skills text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    wp.user_id,
    -- Anonymize: first name + last initial only (e.g. "Rahul S.")
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
    ) AS top_skills
  FROM public.worker_profiles wp
  LEFT JOIN public.profiles p ON p.id = wp.user_id
  ORDER BY wp.updated_at DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(p_limit, 100));
$$;

GRANT EXECUTE ON FUNCTION public.list_public_workers(int) TO anon, authenticated;