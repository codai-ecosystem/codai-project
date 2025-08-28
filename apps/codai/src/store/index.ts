import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

// Types for application state
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'developer'
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
  }
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'archived'
  createdAt: string
  updatedAt: string
  technologies: string[]
  team: string[]
  progress: number
}

export interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Project state
  projects: Project[]
  selectedProjectId: string | null
  
  // UI state
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  isLoading: boolean
  error: string | null
  
  // Notifications
  notifications: Notification[]
}

export interface AppActions {
  // User actions
  setUser: (user: User | null) => void
  login: (user: User) => void
  logout: () => void
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void
  
  // Project actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  selectProject: (id: string | null) => void
  
  // UI actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Combined store type
export type CodaiStore = AppState & AppActions

// Default initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  projects: [],
  selectedProjectId: null,
  theme: 'system',
  sidebarOpen: true,
  isLoading: false,
  error: null,
  notifications: []
}

// Main Zustand store with persistence and dev tools
export const useCodaiStore = create<CodaiStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          ...initialState,

          // User actions
          setUser: (user) => 
            set({ user, isAuthenticated: !!user }, false, 'setUser'),
          
          login: (user) => 
            set({ user, isAuthenticated: true, error: null }, false, 'login'),
          
          logout: () => 
            set({ 
              user: null, 
              isAuthenticated: false, 
              selectedProjectId: null 
            }, false, 'logout'),
          
          updateUserPreferences: (preferences) => 
            set((state) => ({
              user: state.user ? {
                ...state.user,
                preferences: { ...state.user.preferences, ...preferences }
              } : null
            }), false, 'updateUserPreferences'),

          // Project actions
          setProjects: (projects) => 
            set({ projects }, false, 'setProjects'),
          
          addProject: (project) => 
            set((state) => ({
              projects: [...state.projects, project]
            }), false, 'addProject'),
          
          updateProject: (id, updates) =>
            set((state) => ({
              projects: state.projects.map(project => 
                project.id === id ? { ...project, ...updates } : project
              )
            }), false, 'updateProject'),
          
          deleteProject: (id) =>
            set((state) => ({
              projects: state.projects.filter(project => project.id !== id),
              selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId
            }), false, 'deleteProject'),
          
          selectProject: (id) =>
            set({ selectedProjectId: id }, false, 'selectProject'),

          // UI actions
          setTheme: (theme) => {
            set({ theme }, false, 'setTheme')
            // Update user preferences if user is logged in
            const { user } = get()
            if (user) {
              get().updateUserPreferences({ theme })
            }
          },
          
          toggleSidebar: () =>
            set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
          
          setSidebarOpen: (open) =>
            set({ sidebarOpen: open }, false, 'setSidebarOpen'),
          
          setLoading: (loading) =>
            set({ isLoading: loading }, false, 'setLoading'),
          
          setError: (error) =>
            set({ error }, false, 'setError'),

          // Notification actions
          addNotification: (notification) => {
            const id = Date.now().toString()
            set((state) => ({
              notifications: [...state.notifications, {
                ...notification,
                id,
                timestamp: new Date().toISOString(),
                read: false
              }]
            }), false, 'addNotification')
          },
          
          removeNotification: (id) =>
            set((state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }), false, 'removeNotification'),
          
          clearNotifications: () =>
            set({ notifications: [] }, false, 'clearNotifications')
        }),
        {
          name: 'codai-store',
          storage: createJSONStorage(() => {
            // Check if we're in browser environment
            if (typeof window !== 'undefined') {
              return localStorage
            }
            // Fallback for SSR
            return {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {}
            }
          }),
          partialize: (state) => ({
            // Persist only specific parts of the state
            user: state.user,
            theme: state.theme,
            sidebarOpen: state.sidebarOpen,
            selectedProjectId: state.selectedProjectId,
            // Don't persist loading states, errors, or notifications
          }),
          version: 1,
          migrate: (persistedState: any, version: number) => {
            // Handle state migrations if needed in the future
            if (version === 0) {
              // Migration logic for version 0 -> 1
              return {
                ...persistedState,
                notifications: []
              }
            }
            return persistedState
          }
        }
      )
    ),
    {
      name: 'codai-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// Selector hooks for better performance
export const useAuth = () => useCodaiStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  login: state.login,
  logout: state.logout
}))

export const useProjects = () => useCodaiStore((state) => ({
  projects: state.projects,
  selectedProjectId: state.selectedProjectId,
  setProjects: state.setProjects,
  addProject: state.addProject,
  updateProject: state.updateProject,
  deleteProject: state.deleteProject,
  selectProject: state.selectProject
}))

export const useUI = () => useCodaiStore((state) => ({
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  isLoading: state.isLoading,
  error: state.error,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setLoading: state.setLoading,
  setError: state.setError
}))

export const useNotifications = () => useCodaiStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications
}))

// React 18 Concurrent Features compatibility
export const useConcurrentStore = () => {
  // Use React 18's useSyncExternalStore for concurrent rendering compatibility
  return useCodaiStore()
}

export default useCodaiStore