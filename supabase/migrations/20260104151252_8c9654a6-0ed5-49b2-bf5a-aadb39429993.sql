-- Add RLS policy for workers to view their own interviews
CREATE POLICY "Workers can view their own interviews"
ON public.interviews
FOR SELECT
USING (auth.uid() = worker_id);