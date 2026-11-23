-- ==============================================================================
-- Migration: 20261123000001_initial_schema.sql
-- Project: Joki Skripsi (PRD v7.0)
-- Target: PostgreSQL / Supabase
-- Author: Senior Full-Stack & Database Architect
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUMS
CREATE TYPE user_role_enum AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE kyc_status_enum AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE project_status_enum AS ENUM ('DRAFT', 'OPEN', 'BIDDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'DISPUTED', 'REFUNDED');
CREATE TYPE service_type_enum AS ENUM ('CONSULTATION', 'RESEARCH_ASSISTANCE', 'PROOFREADING', 'FORMATTING');
CREATE TYPE bidding_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE milestone_status_enum AS ENUM ('LOCKED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REVISION', 'DISPUTED', 'PAID');
CREATE TYPE payment_verification_status_enum AS ENUM ('UNPAID', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');
CREATE TYPE escrow_status_enum AS ENUM ('AWAITING_DEPOSIT', 'HELD', 'RELEASED', 'REFUNDED', 'FROZEN_DISPUTE');
CREATE TYPE dispute_reason_enum AS ENUM ('QUALITY_ISSUE', 'DEADLINE_MISSED', 'COMMUNICATION_BREAKDOWN', 'PLAGIARISM_DETECTED', 'CLIENT_UNRESPONSIVE', 'OTHER');
CREATE TYPE dispute_status_enum AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_RELEASE', 'RESOLVED_REFUND', 'RESOLVED_SPLIT', 'CANCELLED');
CREATE TYPE doc_category_enum AS ENUM ('BRIEF', 'DRAFT_INITIAL', 'REVISION', 'FINAL_DELIVERABLE', 'PLAGIARISM_REPORT', 'PAYMENT_PROOF', 'DISPUTE_EVIDENCE');
CREATE TYPE notification_channel_enum AS ENUM ('WHATSAPP', 'IN_APP', 'BOTH');
CREATE TYPE notification_delivery_status_enum AS ENUM ('PENDING', 'SENT', 'FAILED');

-- 3. CORE TABLES

-- 3.1 PROFILES (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'buyer',
    full_name VARCHAR(150) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL UNIQUE,
    avatar_url TEXT,
    university VARCHAR(150),
    faculty VARCHAR(150),
    major VARCHAR(150),
    bio TEXT,
    kyc_status kyc_status_enum NOT NULL DEFAULT 'UNVERIFIED',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (rating_avg >= 0.00 AND rating_avg <= 5.00),
    rating_count INT NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
    completed_projects_count INT NOT NULL DEFAULT 0 CHECK (completed_projects_count >= 0),
    bank_name VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    assigned_joki_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    major VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    service_type service_type_enum NOT NULL,
    budget_min NUMERIC(12,2) NOT NULL CHECK (budget_min > 0),
    budget_max NUMERIC(12,2) NOT NULL CHECK (budget_max >= budget_min),
    deadline TIMESTAMPTZ NOT NULL,
    status project_status_enum NOT NULL DEFAULT 'DRAFT',
    initial_draft_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 BIDDINGS (Blind Bidding: 1 Bid per Joki per Project)
CREATE TABLE biddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    joki_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bid_amount NUMERIC(12,2) NOT NULL CHECK (bid_amount > 0),
    proposal TEXT NOT NULL,
    estimated_days INT NOT NULL CHECK (estimated_days > 0),
    status bidding_status_enum NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_joki_bid UNIQUE (project_id, joki_id)
);

-- 3.4 MILESTONES (Per-bab progression)
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    order_index INT NOT NULL CHECK (order_index >= 1),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    due_date TIMESTAMPTZ NOT NULL,
    status milestone_status_enum NOT NULL DEFAULT 'LOCKED',
    submission_notes TEXT,
    submission_doc_url TEXT,
    plagiarism_report_url TEXT,
    plagiarism_score NUMERIC(5,2) CHECK (plagiarism_score >= 0.00 AND plagiarism_score <= 100.00),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    escalation_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_milestone_order UNIQUE (project_id, order_index)
);

-- 3.5 PAYMENTS (Direct-to-Owner Deposit Billings)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT,
    payer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal > 0),
    unique_code INT NOT NULL CHECK (unique_code BETWEEN 100 AND 999),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
    bank_name VARCHAR(50) NOT NULL,
    transfer_ref VARCHAR(100) UNIQUE,
    payment_proof_url TEXT,
    verification_status payment_verification_status_enum NOT NULL DEFAULT 'UNPAID',
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 ESCROW TRANSACTIONS (Internal Holding Ledger)
CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT UNIQUE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status escrow_status_enum NOT NULL DEFAULT 'AWAITING_DEPOSIT',
    held_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    frozen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 PAYOUTS (Settlement Transfer from Platform to Joki)
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE RESTRICT,
    joki_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (platform_fee >= 0),
    net_amount NUMERIC(12,2) NOT NULL CHECK (net_amount > 0),
    bank_name VARCHAR(50) NOT NULL,
    bank_account_number VARCHAR(50) NOT NULL,
    bank_account_holder VARCHAR(150) NOT NULL,
    payout_ref VARCHAR(100) NOT NULL UNIQUE,
    proof_payout_url TEXT,
    processed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 DISPUTES (Arbitration Queue)
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT,
    initiator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    against_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    reason dispute_reason_enum NOT NULL,
    description TEXT NOT NULL,
    status dispute_status_enum NOT NULL DEFAULT 'OPEN',
    admin_notes TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 DISPUTE EVIDENCES
CREATE TABLE dispute_evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    file_url TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 CONVERSATIONS (Project Chat Room)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    joki_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11 MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.12 DOCUMENT PORTAL
CREATE TABLE document_portal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    doc_category doc_category_enum NOT NULL,
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.13 KYC SUBMISSIONS
CREATE TABLE kyc_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    joki_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    id_card_type VARCHAR(20) NOT NULL DEFAULT 'KTP',
    id_card_number_hash VARCHAR(64) NOT NULL,
    id_card_image_url TEXT NOT NULL,
    selfie_with_id_url TEXT NOT NULL,
    status kyc_status_enum NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 3.14 PORTFOLIOS
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    joki_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    major VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    abstract_preview TEXT,
    sample_file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.15 REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    joki_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.16 NOTIFICATIONS (Wablas & In-App Logs)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel notification_channel_enum NOT NULL DEFAULT 'BOTH',
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_status notification_delivery_status_enum NOT NULL DEFAULT 'PENDING',
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.17 AUDIT LOGS (Immutable Security Ledger)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX idx_projects_buyer_id ON projects(buyer_id);
CREATE INDEX idx_projects_assigned_joki_id ON projects(assigned_joki_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_major_status ON projects(major, status);
CREATE INDEX idx_biddings_project_id ON biddings(project_id);
CREATE INDEX idx_biddings_joki_id ON biddings(joki_id);
CREATE INDEX idx_biddings_status ON biddings(status);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_milestone_id ON payments(milestone_id);
CREATE INDEX idx_payments_verification_status ON payments(verification_status);
CREATE INDEX idx_payments_transfer_ref ON payments(transfer_ref);
CREATE INDEX idx_escrow_project_id ON escrow_transactions(project_id);
CREATE INDEX idx_escrow_milestone_id ON escrow_transactions(milestone_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_project_id ON disputes(project_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX idx_document_portal_project_id ON document_portal(project_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- 5. TRIGGERS & FUNCTIONS

-- 5.1 Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_biddings_updated_at BEFORE UPDATE ON biddings FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_escrow_updated_at BEFORE UPDATE ON escrow_transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 5.2 Auto-create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        whatsapp_number,
        avatar_url
    ) VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role_enum, 'buyer'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Pengguna Baru'),
        COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', '08000000000' || SUBSTRING(NEW.id::TEXT, 1, 4)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5.3 Audit Log Helper Function
CREATE OR REPLACE FUNCTION record_audit_log(
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_action VARCHAR,
    p_actor_id UUID,
    p_previous_state JSONB,
    p_new_state JSONB,
    p_ip INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        action,
        actor_id,
        previous_state,
        new_state,
        ip_address,
        user_agent
    ) VALUES (
        p_entity_type,
        p_entity_id,
        p_action,
        p_actor_id,
        p_previous_state,
        p_new_state,
        p_ip,
        p_user_agent
    ) RETURNING id INTO v_log_id;
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_verified_seller()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller' AND is_verified = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 6.1 Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE biddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_portal ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.2 PROFILES POLICIES
CREATE POLICY "Public profiles are readable by authenticated users"
ON profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 6.3 PROJECTS POLICIES
CREATE POLICY "Buyers can view their own projects"
ON projects FOR SELECT TO authenticated
USING (
    buyer_id = auth.uid()
    OR assigned_joki_id = auth.uid()
    OR (status IN ('OPEN', 'BIDDING') AND is_verified_seller())
    OR is_admin()
);

CREATE POLICY "Buyers can create projects"
ON projects FOR INSERT TO authenticated
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Buyers can update their own draft/open projects"
ON projects FOR UPDATE TO authenticated
USING (
    (buyer_id = auth.uid() AND status IN ('DRAFT', 'OPEN'))
    OR is_admin()
);

-- 6.4 BIDDINGS POLICIES (Strict Blind Bidding)
CREATE POLICY "Strict Blind Bidding View Policy"
ON biddings FOR SELECT TO authenticated
USING (
    joki_id = auth.uid()
    OR EXISTS (SELECT 1 FROM projects WHERE projects.id = biddings.project_id AND projects.buyer_id = auth.uid())
    OR is_admin()
);

CREATE POLICY "Verified jokis can submit one bid"
ON biddings FOR INSERT TO authenticated
WITH CHECK (
    joki_id = auth.uid()
    AND is_verified_seller()
    AND EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.status IN ('OPEN', 'BIDDING'))
);

CREATE POLICY "Jokis can update/withdraw their own pending bid"
ON biddings FOR UPDATE TO authenticated
USING (joki_id = auth.uid() AND status = 'PENDING');

-- 6.5 MILESTONES POLICIES
CREATE POLICY "Project stakeholders can view milestones"
ON milestones FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = milestones.project_id 
        AND (projects.buyer_id = auth.uid() OR projects.assigned_joki_id = auth.uid())
    )
    OR is_admin()
);

CREATE POLICY "Buyers or Admin can insert milestones"
ON milestones FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.buyer_id = auth.uid())
    OR is_admin()
);

CREATE POLICY "Stakeholders can update milestone status"
ON milestones FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = milestones.project_id 
        AND (projects.buyer_id = auth.uid() OR projects.assigned_joki_id = auth.uid())
    )
    OR is_admin()
);

-- 6.6 PAYMENTS POLICIES
CREATE POLICY "Payers and Admin can view payments"
ON payments FOR SELECT TO authenticated
USING (payer_id = auth.uid() OR is_admin());

CREATE POLICY "Payers can create payments"
ON payments FOR INSERT TO authenticated
WITH CHECK (payer_id = auth.uid());

CREATE POLICY "Payers can submit transfer ref and proof"
ON payments FOR UPDATE TO authenticated
USING (payer_id = auth.uid() AND verification_status = 'UNPAID')
WITH CHECK (verification_status IN ('UNPAID', 'PENDING_VERIFICATION'));

CREATE POLICY "Admin can verify or reject payments"
ON payments FOR UPDATE TO authenticated
USING (is_admin());

-- 6.7 ESCROW POLICIES
CREATE POLICY "Project stakeholders and Admin can view escrow"
ON escrow_transactions FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = escrow_transactions.project_id 
        AND (projects.buyer_id = auth.uid() OR projects.assigned_joki_id = auth.uid())
    )
    OR is_admin()
);

-- 6.8 CONVERSATIONS & MESSAGES POLICIES
CREATE POLICY "Conversation participants can view conversation"
ON conversations FOR SELECT TO authenticated
USING (buyer_id = auth.uid() OR joki_id = auth.uid() OR is_admin());

CREATE POLICY "Message participants can view messages"
ON messages FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE conversations.id = messages.conversation_id 
        AND (conversations.buyer_id = auth.uid() OR conversations.joki_id = auth.uid())
    )
    OR is_admin()
);

CREATE POLICY "Message participants can insert messages"
ON messages FOR INSERT TO authenticated
WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM conversations 
        WHERE conversations.id = conversation_id 
        AND (conversations.buyer_id = auth.uid() OR conversations.joki_id = auth.uid())
    )
);

-- 6.9 DOCUMENT PORTAL POLICIES
CREATE POLICY "Project stakeholders can view documents"
ON document_portal FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = document_portal.project_id 
        AND (projects.buyer_id = auth.uid() OR projects.assigned_joki_id = auth.uid())
    )
    OR is_admin()
);

CREATE POLICY "Project stakeholders can upload documents"
ON document_portal FOR INSERT TO authenticated
WITH CHECK (
    uploader_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_id 
        AND (projects.buyer_id = auth.uid() OR projects.assigned_joki_id = auth.uid())
    )
);

-- 6.10 KYC POLICIES
CREATE POLICY "Jokis can view their own KYC submission"
ON kyc_submissions FOR SELECT TO authenticated
USING (joki_id = auth.uid() OR is_admin());

CREATE POLICY "Jokis can insert KYC submission"
ON kyc_submissions FOR INSERT TO authenticated
WITH CHECK (joki_id = auth.uid());

CREATE POLICY "Admin can update KYC submission"
ON kyc_submissions FOR UPDATE TO authenticated
USING (is_admin());

-- 6.11 REVIEWS & PORTFOLIOS POLICIES
CREATE POLICY "Public portfolios viewable by all"
ON portfolios FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Sellers can manage their own portfolio"
ON portfolios FOR ALL TO authenticated USING (joki_id = auth.uid());

CREATE POLICY "Public reviews viewable by all"
ON reviews FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Eligible buyers can insert reviews"
ON reviews FOR INSERT TO authenticated
WITH CHECK (
    buyer_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_id 
        AND projects.buyer_id = auth.uid() 
        AND projects.status = 'COMPLETED'
    )
);

-- 6.12 NOTIFICATIONS & AUDIT LOGS
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT TO authenticated
USING (recipient_id = auth.uid());

CREATE POLICY "Only admin can view audit logs"
ON audit_logs FOR SELECT TO authenticated
USING (is_admin());
