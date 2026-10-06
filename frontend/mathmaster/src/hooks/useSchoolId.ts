import * as React from 'react';
import { useSchoolStore } from '@/stores/schoolStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * The active school id for school-scoped queries — or null while the school
 * context is still bootstrapping (or the user has no school at all).
 *
 * Callers must treat null as "not ready" and disable their school-scoped
 * queries (enabled: schoolId != null) so no request is ever fired with a
 * stale/fabricated id like 'school-1' against the real API.
 */
export function useSchoolId(): string | null {
  const currentSchool = useSchoolStore((s) => s.currentSchool);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const id = currentSchool?.id;
  // Only trust a numeric id from the backend; 'school-1' style mock ids and
  // anything present while logged out are never valid API targets.
  if (!isAuthed || !id || id.startsWith('school-') || !/^\d+$/.test(String(id))) return null;
  return String(id);
}
