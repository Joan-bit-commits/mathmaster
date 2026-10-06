import type {
  School,
  Membership,
  Invitation,
  SchoolClass,
  Subscription,
  UsageMetric,
  Invoice,
  AuditLog,
  PlanInfo,
} from '@/types/school';

export const mockSchool: School = {
  id: 'school-1',
  name: 'Kampala Secondary School',
  slug: 'kampala-secondary',
  logo_url: null,
  primary_color: '#006591',
  contact_email: 'admin@kampalasecondary.ac.ug',
  contact_phone: '+256 700 123456',
  address: 'Plot 12, Kira Road, Kampala, Uganda',
  school_type: 'secondary',
  plan: 'school',
  status: 'active',
  trial_ends_at: null,
  current_period_end: '2026-12-31T23:59:59Z',
  created_at: '2026-01-15T08:00:00Z',
  student_count: 347,
  teacher_count: 28,
};

export const mockMemberships: Membership[] = [
  { id: 'm-1', user: { id: 'u-1', username: 'admin', email: 'admin@kampalasecondary.ac.ug', first_name: 'Sarah', last_name: 'Nakimuli', avatar_url: null }, school: 'school-1', role: 'owner', class_level: null, class_stream: null, admission_number: null, parent_email: null, is_active: true, joined_at: '2026-01-15T08:00:00Z', last_active_at: '2026-10-01T14:23:00Z' },
  { id: 'm-2', user: { id: 'u-2', username: 'jokello', email: 'okello@kampalasecondary.ac.ug', first_name: 'John', last_name: 'Okello', avatar_url: null }, school: 'school-1', role: 'teacher', class_level: 'S3', class_stream: 'North', admission_number: null, parent_email: null, is_active: true, joined_at: '2026-01-20T08:00:00Z', last_active_at: '2026-10-01T09:15:00Z' },
  { id: 'm-3', user: { id: 'u-3', username: 'pnalule', email: 'nalule@kampalasecondary.ac.ug', first_name: 'Pearl', last_name: 'Nalule', avatar_url: null }, school: 'school-1', role: 'teacher', class_level: 'S4', class_stream: 'East', admission_number: null, parent_email: null, is_active: true, joined_at: '2026-01-20T08:00:00Z', last_active_at: '2026-09-30T16:40:00Z' },
  { id: 'm-4', user: { id: 'u-4', username: 'dmukasa', email: 'mukasa@kampalasecondary.ac.ug', first_name: 'David', last_name: 'Mukasa', avatar_url: null }, school: 'school-1', role: 'admin', class_level: null, class_stream: null, admission_number: null, parent_email: null, is_active: true, joined_at: '2026-02-01T08:00:00Z', last_active_at: '2026-10-01T11:00:00Z' },
  { id: 'm-5', user: { id: 'u-5', username: 'anamuli', email: 'anamuli@student.kampalasecondary.ac.ug', first_name: 'Alex', last_name: 'Namuli', avatar_url: null }, school: 'school-1', role: 'student', class_level: 'S3', class_stream: 'North', admission_number: 'KS-2026-001', parent_email: 'parent.namuli@gmail.com', is_active: true, joined_at: '2026-01-25T08:00:00Z', last_active_at: '2026-10-01T13:30:00Z' },
  { id: 'm-6', user: { id: 'u-6', username: 'bkato', email: 'bkato@student.kampalasecondary.ac.ug', first_name: 'Brian', last_name: 'Kato', avatar_url: null }, school: 'school-1', role: 'student', class_level: 'S4', class_stream: 'East', admission_number: 'KS-2026-015', parent_email: 'parent.kato@gmail.com', is_active: true, joined_at: '2026-01-25T08:00:00Z', last_active_at: '2026-09-29T10:00:00Z' },
  { id: 'm-7', user: { id: 'u-7', username: 'cnakato', email: 'cnakato@student.kampalasecondary.ac.ug', first_name: 'Carol', last_name: 'Nakato', avatar_url: null }, school: 'school-1', role: 'student', class_level: 'S2', class_stream: 'South', admission_number: 'KS-2026-022', parent_email: 'parent.nakato@gmail.com', is_active: true, joined_at: '2026-02-01T08:00:00Z', last_active_at: '2026-09-28T14:00:00Z' },
  { id: 'm-8', user: { id: 'u-8', username: 'essemakula', email: 'essemakula@kampalasecondary.ac.ug', first_name: 'Esther', last_name: 'Ssemakula', avatar_url: null }, school: 'school-1', role: 'teacher', class_level: 'S1', class_stream: null, admission_number: null, parent_email: null, is_active: true, joined_at: '2026-03-01T08:00:00Z', last_active_at: '2026-09-27T08:00:00Z' },
];

export const mockInvitations: Invitation[] = [
  { id: 'inv-1', school: 'school-1', email: 'newteacher@kampalasecondary.ac.ug', role: 'teacher', class_level: 'S3', token: 'tok-abc', status: 'pending', invited_by_name: 'Sarah Nakimuli', expires_at: '2026-10-08T00:00:00Z', accepted_at: null, created_at: '2026-10-01T10:00:00Z' },
  { id: 'inv-2', school: 'school-1', email: 'newstudent1@student.kampalasecondary.ac.ug', role: 'student', class_level: 'S1', token: 'tok-def', status: 'pending', invited_by_name: 'David Mukasa', expires_at: '2026-10-10T00:00:00Z', accepted_at: null, created_at: '2026-10-01T11:00:00Z' },
  { id: 'inv-3', school: 'school-1', email: 'parent.namuli@gmail.com', role: 'parent', class_level: null, token: 'tok-ghi', status: 'pending', invited_by_name: 'Sarah Nakimuli', expires_at: '2026-10-05T00:00:00Z', accepted_at: null, created_at: '2026-09-28T14:00:00Z' },
];

export const mockClasses: SchoolClass[] = [
  { id: 'c-1', school: 'school-1', name: 'S3 North', level: 'S3', class_teacher_name: 'Mr. Okello John', academic_year: '2026', student_count: 42, created_at: '2026-01-20T08:00:00Z' },
  { id: 'c-2', school: 'school-1', name: 'S4 East', level: 'S4', class_teacher_name: 'Ms. Nalule Pearl', academic_year: '2026', student_count: 38, created_at: '2026-01-20T08:00:00Z' },
  { id: 'c-3', school: 'school-1', name: 'S1 South', level: 'S1', class_teacher_name: 'Ms. Ssemakula Esther', academic_year: '2026', student_count: 45, created_at: '2026-01-20T08:00:00Z' },
  { id: 'c-4', school: 'school-1', name: 'S2 South', level: 'S2', class_teacher_name: null, academic_year: '2026', student_count: 40, created_at: '2026-01-20T08:00:00Z' },
  { id: 'c-5', school: 'school-1', name: 'S5 West', level: 'S5', class_teacher_name: 'Mr. Okello John', academic_year: '2026', student_count: 28, created_at: '2026-01-20T08:00:00Z' },
  { id: 'c-6', school: 'school-1', name: 'S6 West', level: 'S6', class_teacher_name: 'Ms. Nalule Pearl', academic_year: '2026', student_count: 22, created_at: '2026-01-20T08:00:00Z' },
];

export const mockSubscription: Subscription = {
  id: 'sub-1',
  plan: 'school',
  status: 'active',
  billing_cycle: 'annual',
  amount: 1990,
  currency: 'USD',
  current_period_start: '2026-01-15T00:00:00Z',
  current_period_end: '2026-12-31T23:59:59Z',
  trial_ends_at: null,
  payment_method_last4: '4242',
  invoices_url: '/billing/invoices',
};

export const mockUsage: UsageMetric[] = [
  { metric: 'students', label: 'Students', used: 347, limit: 500, percent: 69 },
  { metric: 'teachers', label: 'Teachers', used: 28, limit: 50, percent: 56 },
  { metric: 'documents', label: 'Documents', used: 23, limit: 500, percent: 5 },
  { metric: 'ai_questions', label: 'AI Questions (this month)', used: 1834, limit: 10000, percent: 18 },
  { metric: 'storage_gb', label: 'Storage', used: 4.2, limit: 50, percent: 8 },
];

export const mockInvoices: Invoice[] = [
  { id: 'inv-1', amount: 1990, currency: 'USD', status: 'paid', period_start: '2026-01-15', period_end: '2026-12-31', paid_at: '2026-01-15T08:00:00Z', pdf_url: '#', created_at: '2026-01-15T08:00:00Z' },
  { id: 'inv-2', amount: 199, currency: 'USD', status: 'paid', period_start: '2025-09-01', period_end: '2025-09-30', paid_at: '2025-09-01T08:00:00Z', pdf_url: '#', created_at: '2025-09-01T08:00:00Z' },
  { id: 'inv-3', amount: 199, currency: 'USD', status: 'paid', period_start: '2025-08-01', period_end: '2025-08-31', paid_at: '2025-08-01T08:00:00Z', pdf_url: '#', created_at: '2025-08-01T08:00:00Z' },
  { id: 'inv-4', amount: 199, currency: 'USD', status: 'paid', period_start: '2025-07-01', period_end: '2025-07-31', paid_at: '2025-07-01T08:00:00Z', pdf_url: '#', created_at: '2025-07-01T08:00:00Z' },
  { id: 'inv-5', amount: 49, currency: 'USD', status: 'failed', period_start: '2025-06-01', period_end: '2025-06-30', paid_at: null, pdf_url: null, created_at: '2025-06-01T08:00:00Z' },
  { id: 'inv-6', amount: 49, currency: 'USD', status: 'paid', period_start: '2025-05-01', period_end: '2025-05-31', paid_at: '2025-05-01T08:00:00Z', pdf_url: '#', created_at: '2025-05-01T08:00:00Z' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'al-1', actor_name: 'Sarah Nakimuli', actor_email: 'admin@kampalasecondary.ac.ug', action: 'member.invited', target: 'newteacher@kampalasecondary.ac.ug', metadata: { role: 'teacher' }, created_at: '2026-10-01T10:00:00Z' },
  { id: 'al-2', actor_name: 'David Mukasa', actor_email: 'mukasa@kampalasecondary.ac.ug', action: 'member.invited', target: 'newstudent1@student.kampalasecondary.ac.ug', metadata: { role: 'student' }, created_at: '2026-10-01T11:00:00Z' },
  { id: 'al-3', actor_name: 'Sarah Nakimuli', actor_email: 'admin@kampalasecondary.ac.ug', action: 'class.created', target: 'S5 West', metadata: { level: 'S5' }, created_at: '2026-09-28T14:30:00Z' },
  { id: 'al-4', actor_name: 'John Okello', actor_email: 'okello@kampalasecondary.ac.ug', action: 'quiz.published', target: 'Algebra Quiz 3', metadata: {}, created_at: '2026-09-27T09:00:00Z' },
  { id: 'al-5', actor_name: 'Sarah Nakimuli', actor_email: 'admin@kampalasecondary.ac.ug', action: 'plan.upgraded', target: 'school', metadata: { from: 'starter', to: 'school' }, created_at: '2026-09-20T08:00:00Z' },
  { id: 'al-6', actor_name: 'Pearl Nalule', actor_email: 'nalule@kampalasecondary.ac.ug', action: 'member.removed', target: 'oldteacher@kampalasecondary.ac.ug', metadata: { reason: 'left school' }, created_at: '2026-09-15T10:00:00Z' },
  { id: 'al-7', actor_name: 'David Mukasa', actor_email: 'mukasa@kampalasecondary.ac.ug', action: 'bulk_import.students', target: '12 students', metadata: { count: 12 }, created_at: '2026-09-10T14:00:00Z' },
  { id: 'al-8', actor_name: 'Sarah Nakimuli', actor_email: 'admin@kampalasecondary.ac.ug', action: 'settings.updated', target: 'Branding', metadata: { primary_color: '#006591' }, created_at: '2026-09-05T08:00:00Z' },
  { id: 'al-9', actor_name: 'John Okello', actor_email: 'okello@kampalasecondary.ac.ug', action: 'lesson.created', target: 'Linear Equations', metadata: {}, created_at: '2026-09-03T09:00:00Z' },
  { id: 'al-10', actor_name: 'Sarah Nakimuli', actor_email: 'admin@kampalasecondary.ac.ug', action: 'member.role_changed', target: 'David Mukasa', metadata: { from: 'teacher', to: 'admin' }, created_at: '2026-09-01T08:00:00Z' },
];

export const mockPlans: PlanInfo[] = [
  { id: 'free', name: 'Free', price_monthly: 0, price_annual: 0, currency: 'USD', limits: { students: 30, teachers: 5, documents: 10, ai_questions_per_month: 100, storage_gb: 1 }, features: { core_features: true, custom_branding: false, sso: false, priority_support: false } },
  { id: 'starter', name: 'Starter', price_monthly: 49, price_annual: 490, currency: 'USD', limits: { students: 100, teachers: 10, documents: 50, ai_questions_per_month: 1000, storage_gb: 5 }, features: { core_features: true, custom_branding: false, sso: false, priority_support: false } },
  { id: 'school', name: 'School', price_monthly: 199, price_annual: 1990, currency: 'USD', limits: { students: 500, teachers: 50, documents: 500, ai_questions_per_month: 10000, storage_gb: 50 }, features: { core_features: true, custom_branding: true, sso: false, priority_support: true }, popular: true },
  { id: 'district', name: 'District', price_monthly: 799, price_annual: 7990, currency: 'USD', limits: { students: 5000, teachers: 500, documents: null, ai_questions_per_month: 100000, storage_gb: 500 }, features: { core_features: true, custom_branding: true, sso: true, priority_support: true, dedicated_csm: true } },
  { id: 'enterprise', name: 'Enterprise', price_monthly: 0, price_annual: 0, currency: 'USD', limits: { students: null, teachers: null, documents: null, ai_questions_per_month: null, storage_gb: null }, features: { core_features: true, custom_branding: true, sso: true, priority_support: true, on_premise: true, custom_sla: true } },
];
