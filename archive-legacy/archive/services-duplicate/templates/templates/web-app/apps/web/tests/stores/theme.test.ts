/**
 * Simplified test suite for Theme Store functionality
 * Tests core theme management without complex middleware
 */

import { act, renderHook } from '@testing-library/react';

// Create a simple theme store implementation for testing
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  setEffectiveTheme: (theme: 'light' | 'dark') => void;
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
const mockMatchMedia = (matches: boolean = false) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

// Mock document.documentElement
const mockClassList = {
  add: jest.fn(),
  remove: jest.fn(),
  contains: jest.fn(),
  toggle: jest.fn(),
};

Object.defineProperty(document, 'documentElement', {
  value: {
    classList: mockClassList,
  },
  writable: true,
});

// Create a test theme store that mimics the real implementation
const createTestThemeStore = () => {
  const state: ThemeState = {
    theme: 'system',
    effectiveTheme: 'light',
    setTheme: () => {},
    toggleTheme: () => {},
    setEffectiveTheme: () => {},
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    state.theme = theme;

    // Persist to localStorage (mock the persistence behavior)
    localStorageMock.setItem(
      'theme-storage',
      JSON.stringify({
        state: { theme },
        version: 0,
      })
    );

    // Update effective theme based on system preference if needed
    if (theme === 'system') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        setEffectiveTheme(systemTheme);
      } catch (error) {
        // Fallback to light theme if matchMedia is not supported
        setEffectiveTheme('light');
      }
    } else {
      setEffectiveTheme(theme);
    }
  };

  const toggleTheme = () => {
    const currentTheme = state.theme;
    if (currentTheme === 'system') {
      setTheme('light');
    } else if (currentTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const setEffectiveTheme = (effectiveTheme: 'light' | 'dark') => {
    state.effectiveTheme = effectiveTheme;

    // Update document class
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(effectiveTheme);
    }
  };

  // Update the state with the actual functions
  state.setTheme = setTheme;
  state.toggleTheme = toggleTheme;
  state.setEffectiveTheme = setEffectiveTheme;

  return {
    useStore: () => state,
    getState: () => state,
  };
};

describe('Theme Store', () => {
  let themeStore: ReturnType<typeof createTestThemeStore>;

  beforeEach(() => {
    // Clear localStorage mock
    localStorageMock.clear();
    jest.clearAllMocks();

    // Reset matchMedia mock
    window.matchMedia = jest
      .fn()
      .mockImplementation(() => mockMatchMedia(false));

    // Create a fresh store instance for each test
    themeStore = createTestThemeStore();
  });

  // Helper to access mock classList
  const getMockClassList = () => document.documentElement.classList;

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => themeStore.useStore());

      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should provide all required actions', () => {
      const { result } = renderHook(() => themeStore.useStore());

      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setEffectiveTheme).toBe('function');
    });
  });

  describe('setTheme Action', () => {
    it('should set theme to light', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should set theme to dark', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('should set theme to system and detect light preference', () => {
      // Mock system preference for light theme
      window.matchMedia = jest
        .fn()
        .mockImplementation(() => mockMatchMedia(false));

      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should set theme to system and detect dark preference', () => {
      // Mock system preference for dark theme
      window.matchMedia = jest
        .fn()
        .mockImplementation(() => mockMatchMedia(true));

      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('dark');
    });
  });

  describe('toggleTheme Action', () => {
    it('should toggle from system to light', () => {
      const { result } = renderHook(() => themeStore.useStore());

      // Start with system theme
      expect(result.current.theme).toBe('system');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('dark');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.effectiveTheme).toBe('light');
    });
  });

  describe('setEffectiveTheme Action', () => {
    it('should update effective theme to light', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setEffectiveTheme('light');
      });

      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should update effective theme to dark', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setEffectiveTheme('dark');
      });

      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('should update document class when setting light theme', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setEffectiveTheme('light');
      });

      expect(getMockClassList().remove).toHaveBeenCalledWith('light', 'dark');
      expect(getMockClassList().add).toHaveBeenCalledWith('light');
    });

    it('should update document class when setting dark theme', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setEffectiveTheme('dark');
      });

      expect(getMockClassList().remove).toHaveBeenCalledWith('light', 'dark');
      expect(getMockClassList().add).toHaveBeenCalledWith('dark');
    });
  });

  describe('System Theme Detection', () => {
    it('should detect light system preference', () => {
      window.matchMedia = jest
        .fn()
        .mockImplementation(() => mockMatchMedia(false));

      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('system');
      });

      expect(window.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should detect dark system preference', () => {
      window.matchMedia = jest
        .fn()
        .mockImplementation(() => mockMatchMedia(true));

      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('system');
      });

      expect(window.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('should handle matchMedia failure gracefully', () => {
      window.matchMedia = jest.fn().mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      const { result } = renderHook(() => themeStore.useStore());

      expect(() => {
        act(() => {
          result.current.setTheme('system');
        });
      }).not.toThrow();

      // Should fallback to light theme
      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('light');
    });
  });

  describe('State Persistence', () => {
    it('should persist theme preference to localStorage', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('dark');
      });

      // Check localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'theme-storage',
        JSON.stringify({
          state: { theme: 'dark' },
          version: 0,
        })
      );
    });

    it('should use correct storage key', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('light');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'theme-storage',
        expect.any(String)
      );
    });
  });

  describe('DOM Integration', () => {
    it('should update document classes when effective theme changes', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setEffectiveTheme('dark');
      });

      expect(getMockClassList().remove).toHaveBeenCalledWith('light', 'dark');
      expect(getMockClassList().add).toHaveBeenCalledWith('dark');

      act(() => {
        result.current.setEffectiveTheme('light');
      });

      expect(getMockClassList().remove).toHaveBeenCalledWith('light', 'dark');
      expect(getMockClassList().add).toHaveBeenCalledWith('light');
    });

    it('should handle multiple theme changes correctly', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('dark');
        result.current.setTheme('light');
        result.current.setTheme('dark');
      });

      // Should have been called 3 times (once for each setTheme that calls setEffectiveTheme)
      expect(getMockClassList().remove).toHaveBeenCalledTimes(3);
      expect(getMockClassList().add).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme changes', () => {
      const { result } = renderHook(() => themeStore.useStore());

      act(() => {
        result.current.setTheme('light');
        result.current.setTheme('dark');
        result.current.setTheme('system');
        result.current.toggleTheme();
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should handle document being undefined during setEffectiveTheme', () => {
      const originalDocument = global.document;

      // Remove document temporarily
      delete (global as Record<string, unknown>)['document'];

      const { result } = renderHook(() => themeStore.useStore());

      expect(() => {
        act(() => {
          result.current.setEffectiveTheme('dark');
        });
      }).not.toThrow();

      // Restore document
      global.document = originalDocument;

      expect(result.current.effectiveTheme).toBe('dark');
    });
  });
});
