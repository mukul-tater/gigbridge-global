-- Drop the incorrect policy that targets public role
DROP POLICY IF EXISTS "Workers can view their own interviews" ON public.interviews;

-- Ensure the correct authenticated policy exists (it already does, but let's make sure it's properly set)
DROP POLICY IF EXISTS "Workers can view their interviews" ON public.interviews;
CREATE POLICY "Workers can view their interviews" 
ON public.interviews 
FOR SELECT 
TO authenticated
USING (auth.uid() = worker_id);