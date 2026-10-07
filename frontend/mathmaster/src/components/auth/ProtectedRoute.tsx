import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSchoolStore } from '@/stores/schoolStore';
import { homePathFor, isStudentAccount } from '@/lib/permissions';

export function ProtectedRoute({
  children,
  role,
  roles,
  accountRoles,
}: {
  children: React.ReactNode;
  role?: 'student' | 'teacher';
  /** School-membership roles (owner/admin/...) — used for admin routes. */
  roles?: string[];
  /** Account types allowed on this route, e.g. ['teacher', 'admin'] to keep students out. */
  accountRoles?: string[];
}) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { currentMembership, memberships } = useSchoolStore();
  const location = useLocation();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-ink-900"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  // Account-type gate (e.g. school creation is closed to student accounts).
  if (accountRoles && !accountRoles.includes(user?.role ?? '')) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  // School-aware role check (for admin routes). Student accounts never manage a school,
  // even if a stale owner/admin membership is cached.
  if (roles) {
    const effectiveRole = currentMembership?.role ?? user?.role;
    if (isStudentAccount(user) || !roles.includes(effectiveRole ?? '')) return <Navigate to={homePathFor(user)} replace />;
  }

  // Legacy single-role check
  if (role && user?.role !== role) return <Navigate to={homePathFor(user)} replace />;
  return <>{children}</>;
}

export function RoleGate({ roles, children }: { roles: Array<'student' | 'teacher' | 'admin'>; children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return user && roles.includes(user.role) ? <>{children}</> : null;
}