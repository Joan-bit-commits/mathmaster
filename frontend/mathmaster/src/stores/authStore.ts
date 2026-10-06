import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get as apiGet, post as apiPost, configureApiAuth, type ApiRequestConfig } from '@/lib/api';

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  first_name: string;
  last_name: string;
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const mockUsers: Record<string, AuthUser> = {
  'student@demo.com': {
    id: 1,
    first_name: 'Alex',
    last_name: 'Student',
    username: 'alex_student',
    email: 'student@demo.com',
    role: 'student',
  },
  'teacher@demo.com': {
    id: 2,
    first_name: 'Jordan',
    last_name: 'Teacher',
    username: 'jordan_teacher',
    email: 'teacher@demo.com',
    role: 'teacher',
  },
};

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    role: 'student' | 'teacher';
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        if (USE_MOCKS) {
          const user = mockUsers[username] ?? Object.values(mockUsers).find((u) => u.username === username || u.email === username);
          if (!user || password !== 'password123') {
            throw new Error('Invalid demo credentials. Use the demo buttons to fill in credentials.');
          }
          set({ user, accessToken: 'mock-access', refreshToken: 'mock-refresh', isAuthenticated: true });
          return;
        }

        const { access, refresh } = await apiPost<{ access: string; refresh: string }>('/api/accounts/login/', { username, password }, { skipAuth: true } satisfies ApiRequestConfig);
        set({ accessToken: access, refreshToken: refresh });
        const profile = await apiGet<AuthUser>('/api/accounts/profile/');
        set({ user: profile, isAuthenticated: true });
      },

      register: async (data) => {
        if (USE_MOCKS) {
          const user: AuthUser = {
            id: Date.now(),
            username: data.username,
            email: data.email,
            role: data.role,
            first_name: data.first_name ?? '',
            last_name: data.last_name ?? '',
          };
          set({ user, accessToken: 'mock-access', refreshToken: 'mock-refresh', isAuthenticated: true });
          return;
        }

        const res = await apiPost<{ user: AuthUser; access: string; refresh: string }>('/api/accounts/register/', data, { skipAuth: true } satisfies ApiRequestConfig);
        set({ user: res.user, accessToken: res.access, refreshToken: res.refresh, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshProfile: async () => {
        if (USE_MOCKS) {
          set({ isLoading: false });
          return;
        }
        const { accessToken } = get();
        if (!accessToken) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          useSchoolStore.getState().clear();
          return;
        }
        try {
          const profile = await apiGet<AuthUser>('/api/accounts/profile/');
          set({ user: profile, isAuthenticated: true, isLoading: false });
          // Bootstrap the school context from the backend. The persisted
          // localStorage school may be a stale mock (e.g. 'school-1') that
          // the real API 404s on — always refresh from the server.
          const { fetchMySchools } = await import('@/services/schools');
          const schools = await fetchMySchools();
          const schoolStore = useSchoolStore.getState();
          if (schools.length === 0) {
            // Fresh user with no school yet — drop any stale persisted school
            // so pages don't fire requests against a nonexistent id.
            schoolStore.clear();
          } else {
            const memberships = schools
              .filter((s) => s.membership)
              .map((s) => ({ ...s.membership!, school: String(s.id) }));
            const currentId = String(schoolStore.currentSchool?.id ?? '');
            const persistedStillValid = memberships.some((m) => m.school === currentId);
            const active = persistedStillValid ? currentId : String(schools[0].id);
            const school = schools.find((s) => String(s.id) === active)!;
            const membership = memberships.find((m) => m.school === active) ?? null;
            schoolStore.setMemberships(memberships);
            if (membership) schoolStore.setCurrentSchool(school, membership);
          }
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'mathmaster-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Wire the API client's auth interceptors to this store
configureApiAuth({
  getAuthState: () => ({
    accessToken: useAuthStore.getState().accessToken,
    refreshToken: useAuthStore.getState().refreshToken,
  }),
  onAuthRefreshed: (token) => useAuthStore.setState({ accessToken: token }),
  onAuthFailed: () => useAuthStore.getState().logout(),
});

// Wire the school context header to the school store
import { configureApiSchool } from '@/lib/api';
import { useSchoolStore } from '@/stores/schoolStore';
configureApiSchool(() => useSchoolStore.getState().currentSchool?.id ?? null);
