-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('producer', 'csr', 'admin', 'principal');
CREATE TYPE opportunity_stage AS ENUM ('intake', 'quote', 'uw_review', 'bind', 'lost');
CREATE TYPE quote_status AS ENUM ('draft', 'submitted_api', 'submitted_agent', 'awaiting_uw', 'quoted', 'accepted', 'rejected', 'expired');
CREATE TYPE policy_status AS ENUM ('pending_issue', 'active', 'cancelled', 'expired');
CREATE TYPE quote_outcome AS ENUM ('quoted', 'declined', 'error', 'no_offer');
CREATE TYPE email_event_type AS ENUM ('delivered', 'opened', 'bounced', 'clicked');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'producer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts (Companies/Insureds)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  dba_name TEXT,
  naics_code TEXT,
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  annual_revenue DECIMAL,
  employee_count INTEGER,
  years_in_business INTEGER,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile_phone TEXT,
  title TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage opportunity_stage NOT NULL DEFAULT 'intake',
  owner_id UUID REFERENCES profiles(id),
  expected_premium DECIMAL,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  close_date DATE,
  product_lines TEXT[], -- ['GL', 'WC', 'Surety', etc.]
  notes TEXT,
  lost_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  carrier_name TEXT NOT NULL,
  product_line TEXT NOT NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  quote_number TEXT,
  premium DECIMAL,
  effective_date DATE,
  expiration_date DATE,
  coverage_details JSONB,
  submission_method TEXT, -- 'api' or 'agent'
  submitted_at TIMESTAMPTZ,
  quoted_at TIMESTAMPTZ,
  outcome quote_outcome,
  decline_reason TEXT,
  error_message TEXT,
  browserbase_run_id UUID,
  quote_document_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Policies
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id),
  quote_id UUID REFERENCES quotes(id),
  policy_number TEXT NOT NULL UNIQUE,
  carrier_name TEXT NOT NULL,
  product_line TEXT NOT NULL,
  status policy_status NOT NULL DEFAULT 'pending_issue',
  premium DECIMAL NOT NULL,
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  renewal_date DATE,
  coverage_details JSONB,
  policy_document_url TEXT,
  binder_document_url TEXT,
  payment_id TEXT,
  payment_status TEXT,
  bound_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  parsed_data JSONB, -- OCR extracted data
  parse_confidence_score DECIMAL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Endorsements
CREATE TABLE endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  endorsement_number TEXT NOT NULL,
  effective_date DATE NOT NULL,
  description TEXT NOT NULL,
  premium_change DECIMAL DEFAULT 0,
  coverage_changes JSONB,
  document_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Messages
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resend_id TEXT UNIQUE,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  cc TEXT[],
  bcc TEXT[],
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  related_object_type TEXT, -- 'account', 'policy', 'opportunity', 'quote'
  related_object_id UUID,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Events
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_message_id UUID REFERENCES email_messages(id) ON DELETE CASCADE,
  event_type email_event_type NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT, -- 'quote', 'policy', 'binder', 'coi', 'receipt', etc.
  related_object_type TEXT,
  related_object_id UUID,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Browserbase Runs
CREATE TABLE browserbase_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  browserbase_session_id TEXT,
  carrier_name TEXT NOT NULL,
  quote_id UUID REFERENCES quotes(id),
  status TEXT NOT NULL, -- 'running', 'success', 'error', 'retry'
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  screenshot_urls TEXT[],
  logs TEXT,
  retry_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES profiles(id),
  related_object_type TEXT,
  related_object_id UUID,
  task_type TEXT, -- 'renewal', 'follow_up', 'underwriting', etc.
  metadata JSONB,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_accounts_created_at ON accounts(created_at DESC);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_opportunities_account_id ON opportunities(account_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_quotes_opportunity_id ON quotes(opportunity_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_policies_account_id ON policies(account_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_renewal_date ON policies(renewal_date);
CREATE INDEX idx_endorsements_policy_id ON endorsements(policy_id);
CREATE INDEX idx_email_messages_related_object ON email_messages(related_object_type, related_object_id);
CREATE INDEX idx_email_events_message_id ON email_events(email_message_id);
CREATE INDEX idx_documents_related_object ON documents(related_object_type, related_object_id);
CREATE INDEX idx_browserbase_runs_quote_id ON browserbase_runs(quote_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_endorsements_updated_at BEFORE UPDATE ON endorsements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE browserbase_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all authenticated users for MVP - refine later)
CREATE POLICY "Allow all for authenticated users" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON opportunities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON quotes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON policies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON endorsements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON email_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON email_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON browserbase_runs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON activity_log FOR ALL USING (auth.role() = 'authenticated');