-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_type text NOT NULL CHECK (dispute_type IN ('payment', 'contract', 'conduct', 'quality', 'other')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed', 'escalated')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  filed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filed_against uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  evidence jsonb,
  admin_notes text,
  resolution text,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create messages table for employer-worker communication
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  subject text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  is_flagged boolean DEFAULT false,
  flagged_reason text,
  parent_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user moderation table for tracking blocks/suspensions
CREATE TABLE IF NOT EXISTS public.user_moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('warning', 'suspended', 'blocked', 'banned', 'unblocked', 'unbanned')),
  reason text NOT NULL,
  duration_days integer,
  expires_at timestamp with time zone,
  actioned_by uuid NOT NULL REFERENCES auth.users(id),
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create content moderation table
CREATE TABLE IF NOT EXISTS public.content_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('job_post', 'profile', 'message', 'document', 'review')),
  content_id uuid NOT NULL,
  flagged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  flag_reason text NOT NULL CHECK (flag_reason IN ('spam', 'inappropriate', 'fraud', 'harassment', 'fake', 'other')),
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id),
  action_taken text,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create compliance checks table
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type text NOT NULL CHECK (check_type IN ('document_verification', 'payment_audit', 'job_posting', 'user_verification', 'data_retention')),
  entity_type text NOT NULL CHECK (entity_type IN ('user', 'job', 'payment', 'document')),
  entity_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'needs_review')),
  findings jsonb,
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes
CREATE POLICY "Users can view disputes they're involved in"
  ON public.disputes FOR SELECT
  USING (auth.uid() = filed_by OR auth.uid() = filed_against);

CREATE POLICY "Users can create disputes"
  ON public.disputes FOR INSERT
  WITH CHECK (auth.uid() = filed_by);

CREATE POLICY "Admins have full access to disputes"
  ON public.disputes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Admins can read all messages"
  ON public.messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user moderation
CREATE POLICY "Admins can manage moderation actions"
  ON public.user_moderation FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own moderation history"
  ON public.user_moderation FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for content flags
CREATE POLICY "Users can create content flags"
  ON public.content_flags FOR INSERT
  WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Admins can manage content flags"
  ON public.content_flags FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for compliance checks
CREATE POLICY "Admins can manage compliance checks"
  ON public.compliance_checks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_disputes_filed_by ON public.disputes(filed_by);
CREATE INDEX idx_disputes_filed_against ON public.disputes(filed_against);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_user_moderation_user ON public.user_moderation(user_id);
CREATE INDEX idx_user_moderation_active ON public.user_moderation(is_active);
CREATE INDEX idx_content_flags_status ON public.content_flags(status);
CREATE INDEX idx_compliance_checks_entity ON public.compliance_checks(entity_type, entity_id);

-- Triggers
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();