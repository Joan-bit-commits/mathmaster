// ─── School (tenant) ─────────────────────────────────────────────
export type School = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  school_type: 'primary' | 'secondary' | 'university' | 'tutoring';
  plan: 'free' | 'starter' | 'school' | 'district' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'suspended' | 'archived';
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  student_count: number;
  teacher_count: number;
  /** Caller's membership in this school — present on /api/schools/me/ responses. */
  membership?: Membership | null;
};

// ─── Membership (user × school × role) ──────────────────────────
export type MembershipRole = 'owner' | 'admin' | 'teacher' | 'student' | 'parent';

export type Membership = {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  school: string;
  role: MembershipRole;
  class_level: string | null;
  class_stream: string | null;
  admission_number: string | null;
  parent_email: string | null;
  is_active: boolean;
  joined_at: string;
  last_active_at: string | null;
};

// ─── Invitation ──────────────────────────────────────────────────
export type Invitation = {
  id: string;
  school: string;
  email: string;
  role: MembershipRole;
  class_level: string | null;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invited_by_name: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

// ─── Class ──────────────────────────────────────────────────────
export type SchoolClass = {
  id: string;
  school: string;
  name: string;
  level: string;
  class_teacher_name: string | null;
  academic_year: string;
  student_count: number;
  created_at: string;
};

// ─── Subscription / billing ────────────────────────────────────
export type Subscription = {
  id: string;
  plan: 'free' | 'starter' | 'school' | 'district' | 'enterprise';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
  billing_cycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  payment_method_last4: string | null;
  invoices_url: string | null;
};

export type Invoice = {
  id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'failed';
  period_start: string;
  period_end: string;
  paid_at: string | null;
  pdf_url: string | null;
  created_at: string;
};

export type UsageMetric = {
  metric: 'students' | 'teachers' | 'documents' | 'ai_questions' | 'storage_gb';
  label: string;
  used: number;
  limit: number | null;
  percent: number;
};

// ─── Audit log ──────────────────────────────────────────────────
export type AuditLog = {
  id: string;
  actor_name: string;
  actor_email: string;
  action: string;
  target: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

// ─── Plan catalog (UI) ──────────────────────────────────────────
export type PlanInfo = {
  id: 'free' | 'starter' | 'school' | 'district' | 'enterprise';
  name: string;
  price_monthly: number;
  price_annual: number;
  currency: string;
  limits: {
    students: number | null;
    teachers: number | null;
    documents: number | null;
    ai_questions_per_month: number | null;
    storage_gb: number | null;
  };
  features: Record<string, boolean | string>;
  popular?: boolean;
};
