import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  updateUserData: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: user => {
        set({
          user,
          isAuthenticated: Boolean(user),
          isLoading: false,
        });
      },

      setLoading: loading => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUserData: data => {
        const currentUser = get().user;
        if (currentUser != null) {
          // Deep merge for preferences to avoid overwriting existing fields
          const updatedUser = { ...currentUser, ...data };
          if (data.preferences && currentUser.preferences) {
            updatedUser.preferences = {
              ...currentUser.preferences,
              ...data.preferences,
            };
            // Deep merge notifications if both exist
            if (
              data.preferences.notifications &&
              currentUser.preferences.notifications
            ) {
              updatedUser.preferences.notifications = {
                ...currentUser.preferences.notifications,
                ...data.preferences.notifications,
              };
            }
          }
          set({
            user: updatedUser,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
