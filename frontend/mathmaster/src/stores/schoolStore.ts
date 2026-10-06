import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { School, Membership } from '@/types/school';

/** Snapshot of the school a given user last had active — lets the shell show it instantly on re-login. */
type RememberedContext = { school: School; membership: Membership | null };

interface SchoolState {
  currentSchool: School | null;
  currentMembership: Membership | null;
  memberships: Membership[];
  /** Every school the signed-in user belongs to (names are needed by the switcher). */
  schools: School[];
  /** Which user the active context above belongs to — never shown to a different user. */
  ownerUserId: string | null;
  /** Last active school per user id; survives sign-out so the next sign-in starts where they left off. */
  remembered: Record<string, RememberedContext>;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  setCurrentSchool: (school: School, membership: Membership) => void;
  setMemberships: (memberships: Membership[]) => void;
  /** Apply the result of GET /api/schools/me/ for this user. */
  setSchools: (userId: string, schools: School[]) => void;
  switchSchool: (schoolId: string) => void;
  /** Called right after sign-in: show this user's remembered school immediately, never another user's. */
  hydrateForUser: (userId: string) => void;
  /** Called on sign-out: drop the active context (keeps `remembered`). */
  deactivate: () => void;
  clear: () => void;
}

const emptyActive = {
  currentSchool: null,
  currentMembership: null,
  memberships: [] as Membership[],
  schools: [] as School[],
  ownerUserId: null,
};

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set, get) => ({
      ...emptyActive,
      remembered: {},
      isLoading: false,

      setLoading: (isLoading) => set({ isLoading }),

      setCurrentSchool: (school, membership) => {
        set({ currentSchool: school, currentMembership: membership });
      },

      setMemberships: (memberships) => {
        set({ memberships });
        if (!get().currentSchool && memberships.length > 0) {
          set({ currentMembership: memberships[0] });
        }
      },

      setSchools: (userId, schools) => {
        const state = get();
        if (schools.length === 0) {
          // No school yet — drop anything stale so pages don't call the API with a dead id.
          const remembered = { ...state.remembered };
          delete remembered[userId];
          set({ ...emptyActive, ownerUserId: userId, remembered });
          return;
        }
        const memberships = schools
          .filter((s) => s.membership)
          .map((s) => ({ ...s.membership!, school: String(s.id) }));
        const preferredId =
          (state.ownerUserId === userId ? state.currentSchool?.id : undefined) ?? state.remembered[userId]?.school.id;
        const active =
          schools.find((s) => String(s.id) === String(preferredId)) ?? schools.find((s) => s.membership) ?? schools[0];
        const membership = memberships.find((m) => m.school === String(active.id)) ?? null;
        set({
          schools,
          memberships,
          currentSchool: active,
          currentMembership: membership,
          ownerUserId: userId,
          remembered: { ...state.remembered, [userId]: { school: active, membership } },
        });
      },

      switchSchool: (schoolId) => {
        const { schools, memberships, ownerUserId, remembered } = get();
        const school = schools.find((s) => String(s.id) === String(schoolId));
        if (!school) return;
        const membership = memberships.find((m) => m.school === String(school.id)) ?? null;
        set({
          currentSchool: school,
          currentMembership: membership,
          remembered: ownerUserId ? { ...remembered, [ownerUserId]: { school, membership } } : remembered,
        });
      },

      hydrateForUser: (userId) => {
        const state = get();
        if (state.ownerUserId === userId && state.currentSchool) {
          set({ isLoading: true });
          return;
        }
        const last = state.remembered[userId];
        set({
          ...emptyActive,
          ownerUserId: userId,
          currentSchool: last?.school ?? null,
          currentMembership: last?.membership ?? null,
          isLoading: true,
        });
      },

      deactivate: () => set({ ...emptyActive, isLoading: false }),

      clear: () => {
        const { ownerUserId, remembered } = get();
        const next = { ...remembered };
        if (ownerUserId) delete next[ownerUserId];
        set({ ...emptyActive, remembered: next, isLoading: false });
      },
    }),
    {
      name: 'mathmaster-school',
      partialize: (state) => ({
        currentSchool: state.currentSchool,
        currentMembership: state.currentMembership,
        memberships: state.memberships,
        schools: state.schools,
        ownerUserId: state.ownerUserId,
        remembered: state.remembered,
      }),
    }
  )
);