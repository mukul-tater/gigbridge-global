-- Allow workers to update their own offers (for accepting/rejecting)
CREATE POLICY "Workers can update their own offers"
ON public.offers
FOR UPDATE
USING (auth.uid() = worker_id)
WITH CHECK (auth.uid() = worker_id);