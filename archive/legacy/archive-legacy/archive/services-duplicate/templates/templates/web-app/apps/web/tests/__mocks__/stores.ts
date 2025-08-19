// Mock store implementation for tests
import { create } from 'zustand';

import type { User } from '@/types/auth';

// Auth Store Types
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  updateUserData: (data: Partial<User>) => void;
}

// Theme Store Types
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  setEffectiveTheme: (theme: 'light' | 'dark') => void;
}

// Create actual mock stores that can be used in tests
export const createMockAuthStore = () => {
  return create<AuthState>((set, get) => ({
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
  }));
};

export const createMockThemeStore = () => {
  return create<ThemeState>((set, get) => ({
    theme: 'system',
    effectiveTheme: 'light',
    setTheme: theme => {
      set({ theme });
      if (theme === 'system') {
        // In tests, system theme defaults to light
        get().setEffectiveTheme('light');
      } else {
        get().setEffectiveTheme(theme);
      }
    },
    toggleTheme: () => {
      const currentTheme = get().theme;
      if (currentTheme === 'system') {
        set({ theme: 'light' });
        get().setEffectiveTheme('light');
      } else if (currentTheme === 'light') {
        set({ theme: 'dark' });
        get().setEffectiveTheme('dark');
      } else {
        set({ theme: 'light' });
        get().setEffectiveTheme('light');
      }
    },
    setEffectiveTheme: effectiveTheme => {
      set({ effectiveTheme });
    },
  }));
};
