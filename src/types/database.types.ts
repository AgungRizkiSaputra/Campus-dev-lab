export type UserRole = 'buyer' | 'seller' | 'admin';
export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ProjectStatus = 'DRAFT' | 'OPEN' | 'BIDDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'DISPUTED' | 'REFUNDED';
export type ServiceType = 'CONSULTATION' | 'RESEARCH_ASSISTANCE' | 'PROOFREADING' | 'FORMATTING';
export type BiddingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type MilestoneStatus = 'LOCKED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REVISION' | 'DISPUTED' | 'PAID';
export type PaymentVerificationStatus = 'UNPAID' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
export type EscrowStatus = 'AWAITING_DEPOSIT' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'FROZEN_DISPUTE';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_RELEASE' | 'RESOLVED_REFUND' | 'RESOLVED_SPLIT' | 'CANCELLED';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  whatsapp_number: string;
  avatar_url?: string | null;
  university?: string | null;
  faculty?: string | null;
  major?: string | null;
  bio?: string | null;
  kyc_status: KycStatus;
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
  completed_projects_count: number;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  buyer_id: string;
  assigned_joki_id?: string | null;
  title: string;
  faculty: string;
  major: string;
  topic: string;
  description: string;
  service_type: ServiceType;
  budget_min: number;
  budget_max: number;
  deadline: string;
  status: ProjectStatus;
  initial_draft_url?: string | null;
  created_at: string;
  updated_at: string;
  buyer?: Profile;
  assigned_joki?: Profile | null;
}

export interface Bidding {
  id: string;
  project_id: string;
  joki_id: string;
  bid_amount: number;
  proposal: string;
  estimated_days: number;
  status: BiddingStatus;
  created_at: string;
  updated_at: string;
  joki?: Profile;
}

export interface Milestone {
  id: string;
  project_id: string;
  order_index: number;
  title: string;
  description?: string | null;
  amount: number;
  due_date: string;
  status: MilestoneStatus;
  submission_notes?: string | null;
  submission_doc_url?: string | null;
  plagiarism_report_url?: string | null;
  plagiarism_score?: number | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  escalation_deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  milestone_id: string;
  payer_id: string;
  subtotal: number;
  unique_code: number;
  total_amount: number;
  bank_name: string;
  transfer_ref?: string | null;
  payment_proof_url?: string | null;
  verification_status: PaymentVerificationStatus;
  verified_by?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  project_id: string;
  milestone_id: string;
  payment_id: string;
  amount: number;
  status: EscrowStatus;
  held_at?: string | null;
  released_at?: string | null;
  refunded_at?: string | null;
  frozen_at?: string | null;
  created_at: string;
  updated_at: string;
}
