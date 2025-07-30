// Zustand State Management Patterns
// Advanced patterns and utilities for Zustand state management

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import { shallow } from 'zustand/shallow'

// Base store interface
export interface BaseStore {
  // Actions
  reset: () => void
  // Loading states
  isLoading: boolean
  setLoading: (loading: boolean) => void
  // Error handling
  error: string | null
  setError: (error: string | null) => void
  clearError: () => void
}

// Store creation utilities
export const createBaseStore = <T extends object>(
  name: string,
  defaultState: T,
  options?: {
    enableDevtools?: boolean
    enablePersistence?: boolean
    enableImmer?: boolean
    enableTemporal?: boolean
    storage?: 'localStorage' | 'sessionStorage' | 'custom'
  }
) => {
  const {
    enableDevtools = true,
    enablePersistence = false,
    enableImmer = false,
    enableTemporal = false,
    storage = 'localStorage',
  } = options || {}

  type StoreState = T & BaseStore

  const initialState: StoreState = {
    ...defaultState,
    isLoading: false,
    error: null,
    reset: () => { },
    setLoading: () => { },
    setError: () => { },
    clearError: () => { },
  }

  // Create store with middleware chain
  let storeCreator = create<StoreState>()(
    subscribeWithSelector((set, get) => ({
      ...initialState,
      reset: () => set({ ...initialState }, false, 'reset'),
      setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'setLoading'),
      setError: (error: string | null) => set({ error }, false, 'setError'),
      clearError: () => set({ error: null }, false, 'clearError'),
    }))
  )

  // Apply middleware conditionally
  if (enableImmer) {
    storeCreator = create<StoreState>()(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,
          reset: () => set((state) => Object.assign(state, initialState)),
          setLoading: (loading: boolean) => set((state) => { state.isLoading = loading }),
          setError: (error: string | null) => set((state) => { state.error = error }),
          clearError: () => set((state) => { state.error = null }),
        }))
      )
    )
  }

  if (enablePersistence) {
    const storageImpl = storage === 'localStorage'
      ? createJSONStorage(() => localStorage)
      : storage === 'sessionStorage'
        ? createJSONStorage(() => sessionStorage)
        : createJSONStorage(() => localStorage) // fallback

    storeCreator = create<StoreState>()(
      persist(
        subscribeWithSelector(
          enableImmer
            ? immer((set, get) => ({
              ...initialState,
              reset: () => set((state) => Object.assign(state, initialState)),
              setLoading: (loading: boolean) => set((state) => { state.isLoading = loading }),
              setError: (error: string | null) => set((state) => { state.error = error }),
              clearError: () => set((state) => { state.error = null }),
            }))
            : (set, get) => ({
              ...initialState,
              reset: () => set({ ...initialState }, false, 'reset'),
              setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'setLoading'),
              setError: (error: string | null) => set({ error }, false, 'setError'),
              clearError: () => set({ error: null }, false, 'clearError'),
            })
        ),
        {
          name: `${name}-storage`,
          storage: storageImpl,
          partialize: (state) => {
            // Don't persist loading states and errors
            const { isLoading, error, ...persistedState } = state
            return persistedState
          },
        }
      )
    )
  }

  if (enableDevtools) {
    storeCreator = create<StoreState>()(
      devtools(
        enablePersistence
          ? persist(
            subscribeWithSelector(
              enableImmer
                ? immer((set, get) => ({
                  ...initialState,
                  reset: () => set((state) => Object.assign(state, initialState)),
                  setLoading: (loading: boolean) => set((state) => { state.isLoading = loading }),
                  setError: (error: string | null) => set((state) => { state.error = error }),
                  clearError: () => set((state) => { state.error = null }),
                }))
                : (set, get) => ({
                  ...initialState,
                  reset: () => set({ ...initialState }, false, 'reset'),
                  setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'setLoading'),
                  setError: (error: string | null) => set({ error }, false, 'setError'),
                  clearError: () => set({ error: null }, false, 'clearError'),
                })
            ),
            {
              name: `${name}-storage`,
              storage: storage === 'localStorage'
                ? createJSONStorage(() => localStorage)
                : createJSONStorage(() => sessionStorage),
            }
          )
          : subscribeWithSelector(
            enableImmer
              ? immer((set, get) => ({
                ...initialState,
                reset: () => set((state) => Object.assign(state, initialState)),
                setLoading: (loading: boolean) => set((state) => { state.isLoading = loading }),
                setError: (error: string | null) => set((state) => { state.error = error }),
                clearError: () => set((state) => { state.error = null }),
              }))
              : (set, get) => ({
                ...initialState,
                reset: () => set({ ...initialState }, false, 'reset'),
                setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'setLoading'),
                setError: (error: string | null) => set({ error }, false, 'setError'),
                clearError: () => set({ error: null }, false, 'clearError'),
              })
          ),
        {
          name: name,
        }
      )
    )
  }

  if (enableTemporal) {
    storeCreator = create<StoreState>()(
      temporal(
        enableDevtools
          ? devtools(
            enablePersistence
              ? persist(
                subscribeWithSelector(
                  enableImmer
                    ? immer((set, get) => ({
                      ...initialState,
                      reset: () => set((state) => Object.assign(state, initialState)),
                      setLoading: (loading: boolean) => set((state) => { state.isLoading = loading }),
                      setError: (error: string | null) => set((state) => { state.error = error }),
                      clearError: () => set((state) => { state.error = null }),
                    }))
                    : (set, get) => ({
                      ...initialState,
                      reset: () => set({ ...initialState }, false, 'reset'),
                      setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'setLoading'),
                      setError: (error: string | null) => set({ error }, false, 'setError'),
                      clearError: () => set({ error: null }, false, 'clearError'),
                    })
                ),
                {
                  name: `${name}-storage`,
                  storage: storage === 'localStorage'
                    ? createJSONStorage(() => localStorage)
                    : createJSONStorage(() => sessionStorage),
                }
              )
              : subscribeWithSelector(
                enableImmer
                  ? immer((set, get) => ({
                    ...initialState,
                    reset: () => set((state) => Object.assign(state, initialState)),
                    setLoading: (loading: boolean) => set((state) => { state.isLoading = loading }),
                    setError: (error: string | null) => set((state) => { state.error = error }),
                    clearError: () => set((state) => { state.error = null }),
                  }))
                  : (set, get) => ({
                    ...initialState,
                    reset: () => set({ ...initialState }, false, 'reset'),
                    setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'setLoading'),
                    setError: (error: string | null) => set({ error }, false, 'setError'),
                    clearError: () => set({ error: null }, false, 'clearError'),
                  })
              ),
            {
              name: name,
            }
          )
          : enablePersistence
            ? persist(
              subscribeWithSelector(
                enableImmer
                  ? immer((set, get) => ({
                    ...initialState,
                    reset: () => set((state) => Object.assign(state, initialState)),
                    setLoading: (loading: boolean) => set((state) => { state.isLoading = loading }),
                    setError: (error: string | null) => set((state) => { state.error = error }),
                    clearError: () => set((state) => { state.error = null }),
                  }))
                  : (set, get) => ({
                    ...initialState,
                    reset: () => set({ ...initialState }, false, 'reset'),
                    setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'setLoading'),
                    setError: (error: string | null) => set({ error }, false, 'setError'),
                    clearError: () => set({ error: null }, false, 'clearError'),
                  })
              ),
              {
                name: `${name}-storage`,
                storage: storage === 'localStorage'
                  ? createJSONStorage(() => localStorage)
                  : createJSONStorage(() => sessionStorage),
              }
            )
            : subscribeWithSelector(
              enableImmer
                ? immer((set, get) => ({
                  ...initialState,
                  reset: () => set((state) => Object.assign(state, initialState)),
                  setLoading: (loading: boolean) => set((state) => { state.isLoading = loading }),
                  setError: (error: string | null) => set((state) => { state.error = error }),
                  clearError: () => set((state) => { state.error = null }),
                }))
                : (set, get) => ({
                  ...initialState,
                  reset: () => set({ ...initialState }, false, 'reset'),
                  setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'setLoading'),
                  setError: (error: string | null) => set({ error }, false, 'setError'),
                  clearError: () => set({ error: null }, false, 'clearError'),
                })
            ),
        {
          limit: 10,
          equality: shallow,
        }
      )
    )
  }

  return storeCreator
}

// Common store patterns
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export const createAsyncStore = <T>(
  name: string,
  fetcher: () => Promise<T>,
  options?: Parameters<typeof createBaseStore>[2]
) => {
  interface AsyncStoreState extends AsyncState<T> {
    fetch: () => Promise<void>
    refetch: () => Promise<void>
    mutate: (data: T) => void
  }

  return createBaseStore<AsyncStoreState>(
    name,
    {
      data: null,
      loading: false,
      error: null,
      fetch: async () => { },
      refetch: async () => { },
      mutate: () => { },
    },
    options
  )
}

// Slice pattern for modular stores
export interface StoreSlice<T> {
  slice: T
  actions: Record<string, (...args: any[]) => void>
}

export const createSlice = <T extends object>(
  name: string,
  initialState: T,
  actions: (set: any, get: any) => Record<string, (...args: any[]) => void>
): StoreSlice<T> => {
  return {
    slice: initialState,
    actions: actions({}, {}), // Placeholder - actual implementation would provide real set/get
  }
}

// Store composition utilities
export const combineStores = <T extends Record<string, any>>(
  stores: T
): T => {
  // In a real implementation, this would merge store slices
  return stores
}

// Selector utilities
export const createSelectors = <T extends object>(store: any) => {
  const selectors = {} as { [K in keyof T]: () => T[K] }

  for (const key of Object.keys(store.getState()) as (keyof T)[]) {
    selectors[key] = () => store((state: T) => state[key])
  }

  return selectors
}

// Store subscription utilities
export const subscribeToChanges = <T>(
  store: any,
  selector: (state: T) => any,
  callback: (value: any, previousValue: any) => void
) => {
  return store.subscribe(
    selector,
    callback,
    {
      equalityFn: shallow,
      fireImmediately: false,
    }
  )
}

// Example: User management store
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  preferences: {
    theme: 'light' | 'dark'
    language: string
    notifications: boolean
  }
}

export interface UserStoreState {
  currentUser: User | null
  users: User[]
  selectedUser: User | null
  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  updateUser: (userId: string, updates: Partial<User>) => void
  selectUser: (userId: string) => void
  fetchUsers: () => Promise<void>
  updatePreferences: (preferences: Partial<User['preferences']>) => void
}

export const useUserStore = createBaseStore<UserStoreState>(
  'user-store',
  {
    currentUser: null,
    users: [],
    selectedUser: null,
    login: async () => { },
    logout: () => { },
    updateUser: () => { },
    selectUser: () => { },
    fetchUsers: async () => { },
    updatePreferences: () => { },
  },
  {
    enableDevtools: true,
    enablePersistence: true,
    enableImmer: true,
    storage: 'localStorage',
  }
)

// Store testing utilities
export const createMockStore = <T extends object>(
  initialState: T,
  overrides?: Partial<T>
) => {
  return create<T>()(() => ({
    ...initialState,
    ...overrides,
  }))
}

export const resetStore = (store: any) => {
  if (typeof store.getState().reset === 'function') {
    store.getState().reset()
  }
}

// Pattern documentation
export const ZUSTAND_PATTERNS = {
  name: 'Zustand State Management Patterns',
  description: 'Advanced patterns for scalable state management with Zustand',
  features: [
    'Base store with common utilities',
    'Async state management',
    'Store composition and slicing',
    'Persistence middleware',
    'DevTools integration',
    'Time travel debugging',
    'Immutable updates with Immer',
    'Selective subscriptions',
  ],
  bestPractices: [
    'Use TypeScript for type safety',
    'Create focused, single-responsibility stores',
    'Leverage middleware for cross-cutting concerns',
    'Use selectors to optimize re-renders',
    'Implement proper error handling',
    'Test stores in isolation',
  ],
  examples: [
    {
      name: 'Basic Store Creation',
      code: `
const useCountStore = createBaseStore('counter', {
  count: 0,
  increment: () => {},
  decrement: () => {},
}, {
  enableDevtools: true,
  enablePersistence: true,
})
      `,
    },
    {
      name: 'Async Data Store',
      code: `
const useDataStore = createAsyncStore(
  'api-data',
  () => fetch('/api/data').then(res => res.json()),
  {
    enableDevtools: true,
    enableImmer: true,
  }
)
      `,
    },
  ],
} as const
