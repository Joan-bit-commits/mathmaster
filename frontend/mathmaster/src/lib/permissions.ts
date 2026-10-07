import type { Membership } from '@/types/school';

type AccountUser = { role?: string } | null | undefined;

/** Accounts registered as students can join schools but never create or manage one. */
export const isStudentAccount = (user: AccountUser) => user?.role === 'student';

/** Create a new school: teacher / admin accounts only. */
export const canCreateSchool = (user: AccountUser) => !!user && !isStudentAccount(user);

/** Manage the active school (members, classes, billing, settings): non-student account + owner/admin membership. */
export const canManageSchool = (user: AccountUser, membership: Pick<Membership, 'role'> | null | undefined) =>
  !!user && !isStudentAccount(user) && (membership?.role === 'owner' || membership?.role === 'admin');

export const homePathFor = (user: AccountUser) => (user?.role === 'teacher' ? '/teacher' : '/dashboard');
