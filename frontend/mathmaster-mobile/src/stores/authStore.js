// Auth store — Zustand + AsyncStorage persistence.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as authService from '../services/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setTokens: ({ access, refresh }) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),

      login: async (username, password) => {
        const data = await authService.login(username, password);
        set({ accessToken: data.access, refreshToken: data.refresh, isAuthenticated: true });
        const user = await authService.profile(data.access);
        set({ user });
        return user;
      },

      register: async (payload) => {
        const data = await authService.register(payload);
        set({ accessToken: data.access, refreshToken: data.refresh, isAuthenticated: true });
        const user = await authService.profile(data.access);
        set({ user });
        return user;
      },

      refreshProfile: async () => {
        const user = await authService.profile(get().accessToken);
        set({ user });
      },

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'mathmaster-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
    }
  )
);

// Manual hydration flag helper (zustand persist v5)
useAuthStore.setState({ isHydrated: false });
export async function rehydrateAuth() {
  await useAuthStore.persist.rehydrate();
  useAuthStore.setState({ isHydrated: true });
}
