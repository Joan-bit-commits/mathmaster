import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { School, Membership } from '@/types/school';

interface SchoolState {
  currentSchool: School | null;
  currentMembership: Membership | null;
  memberships: Membership[];
  isLoading: boolean;
  setCurrentSchool: (school: School, membership: Membership) => void;
  setMemberships: (memberships: Membership[]) => void;
  switchSchool: (schoolId: string) => void;
  clear: () => void;
}

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set, get) => ({
      currentSchool: null,
      currentMembership: null,
      memberships: [],
      isLoading: true,

      setCurrentSchool: (school, membership) => {
        set({ currentSchool: school, currentMembership: membership });
      },

      setMemberships: (memberships) => {
        set({ memberships });
        if (!get().currentSchool && memberships.length > 0) {
          set({ currentMembership: memberships[0] });
        }
      },

      switchSchool: (schoolId) => {
        const membership = get().memberships.find((m) => m.school === schoolId);
        if (membership) {
          set({ currentMembership: membership });
        }
      },

      clear: () => set({ currentSchool: null, currentMembership: null, memberships: [] }),
    }),
    {
      name: 'mathmaster-school',
      partialize: (state) => ({
        currentSchool: state.currentSchool,
        currentMembership: state.currentMembership,
      }),
    }
  )
);
