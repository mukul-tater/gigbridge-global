-- Remove the existing RLS policy that allows employers to view full worker profiles (including passport_number)
DROP POLICY IF EXISTS "Employers can view applicant worker profiles" ON worker_profiles;

-- Note: Employers should now use the get_worker_profile_for_employer() function instead,
-- which returns worker profile data WITHOUT the passport_number field.