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

/**
 * Loads the user's schools and applies them (restoring the school they last used).
 * A network/API hiccup keeps whatever school was already remembered instead of signing the user out.
 */
async function syncSchools(userId: string) {
  useSchoolStore.getState().setLoading(true);
  try {
    const { fetchMySchools } = await import('@/services/schools');
    useSchoolStore.getState().setSchools(userId, await fetchMySchools());
  } catch {
    // keep the remembered school
  } finally {
    useSchoolStore.getState().setLoading(false);
  }
}

/** Show the user's remembered school at once, then refresh it from the server. */
async function startSchoolSession(userId: string) {
  useSchoolStore.getState().hydrateForUser(userId);
  await syncSchools(userId);
}

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
          await startSchoolSession(String(user.id));
          return;
        }

        const { access, refresh } = await apiPost<{ access: string; refresh: string }>('/api/accounts/login/', { username, password }, { skipAuth: true } satisfies ApiRequestConfig);
        set({ accessToken: access, refreshToken: refresh });
        const profile = await apiGet<AuthUser>('/api/accounts/profile/');
        set({ user: profile, isAuthenticated: true });
        await startSchoolSession(String(profile.id));
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
          await startSchoolSession(String(user.id));
          return;
        }

        const res = await apiPost<{ user: AuthUser; access: string; refresh: string }>('/api/accounts/register/', data, { skipAuth: true } satisfies ApiRequestConfig);
        set({ user: res.user, accessToken: res.access, refreshToken: res.refresh, isAuthenticated: true });
        await startSchoolSession(String(res.user.id));
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        // Drop the active school so the next account never inherits it (the per-user "last school" memory stays).
        useSchoolStore.getState().deactivate();
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
          // Bootstrap the school context (restores the school this user last used).
          await syncSchools(String(profile.id));
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