-- Create saved searches table
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('jobs', 'workers')),
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  alerts_enabled BOOLEAN DEFAULT false,
  alert_frequency TEXT CHECK (alert_frequency IN ('immediate', 'daily', 'weekly')),
  last_alerted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved searches"
  ON public.saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches"
  ON public.saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches"
  ON public.saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches"
  ON public.saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX idx_saved_searches_search_type ON public.saved_searches(search_type);
CREATE INDEX idx_saved_searches_alerts_enabled ON public.saved_searches(alerts_enabled);
