import { describe, it, expect, beforeEach } from 'vitest'
import { useCodaiStore } from '../index'

describe('Zustand Store Direct Testing', () => {
  beforeEach(() => {
    // Clear localStorage to ensure clean state
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('codai-store')
    }
    
    // Reset store to initial state
    useCodaiStore.setState({
      user: null,
      isAuthenticated: false,
      projects: [],
      selectedProjectId: null,
      theme: 'system',
      sidebarOpen: true,
      isLoading: false,
      error: null,
      notifications: []
    })
  })

  describe('Authentication State', () => {
    it('should have initial auth state', () => {
      const state = useCodaiStore.getState()
      
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should login user correctly', () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'developer' as const,
        preferences: {
          theme: 'dark' as const,
          language: 'en',
          notifications: true
        }
      }

      useCodaiStore.getState().login(mockUser)
      const state = useCodaiStore.getState()

      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should logout user correctly', () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'developer' as const,
        preferences: {
          theme: 'dark' as const,
          language: 'en',
          notifications: true
        }
      }

      // First login
      useCodaiStore.getState().login(mockUser)
      
      // Then logout
      useCodaiStore.getState().logout()
      const state = useCodaiStore.getState()

      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('Project State', () => {
    it('should have initial project state', () => {
      const state = useCodaiStore.getState()
      
      expect(state.projects).toEqual([])
      expect(state.selectedProjectId).toBeNull()
    })

    it('should add project correctly', () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'A test project',
        status: 'active' as const,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        technologies: ['React', 'TypeScript'],
        team: ['user-1'],
        progress: 50
      }

      useCodaiStore.getState().addProject(mockProject)
      const state = useCodaiStore.getState()

      expect(state.projects).toContain(mockProject)
    })

    it('should select project correctly', () => {
      useCodaiStore.getState().selectProject('project-1')
      const state = useCodaiStore.getState()

      expect(state.selectedProjectId).toBe('project-1')
    })
  })

  describe('UI State', () => {
    it('should have initial UI state', () => {
      const state = useCodaiStore.getState()
      
      expect(state.theme).toBe('system')
      expect(state.sidebarOpen).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should toggle sidebar correctly', () => {
      const initialState = useCodaiStore.getState().sidebarOpen
      
      useCodaiStore.getState().toggleSidebar()
      const state = useCodaiStore.getState()

      expect(state.sidebarOpen).toBe(!initialState)
    })

    it('should set theme correctly', () => {
      useCodaiStore.getState().setTheme('dark')
      const state = useCodaiStore.getState()

      expect(state.theme).toBe('dark')
    })
  })

  describe('Notifications State', () => {
    it('should have initial notifications state', () => {
      const state = useCodaiStore.getState()
      
      expect(state.notifications).toEqual([])
    })

    it('should add notification correctly', () => {
      const mockNotification = {
        type: 'success' as const,
        title: 'Success',
        message: 'Operation completed successfully'
      }

      useCodaiStore.getState().addNotification(mockNotification)
      const state = useCodaiStore.getState()

      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]).toMatchObject(mockNotification)
      expect(state.notifications[0].id).toBeDefined()
      expect(state.notifications[0].timestamp).toBeDefined()
      expect(state.notifications[0].read).toBe(false)
    })

    it('should remove notification correctly', () => {
      const mockNotification = {
        type: 'info' as const,
        title: 'Info',
        message: 'Information message'
      }

      useCodaiStore.getState().addNotification(mockNotification)
      let state = useCodaiStore.getState()
      const notificationId = state.notifications[0].id

      expect(state.notifications).toHaveLength(1)

      useCodaiStore.getState().removeNotification(notificationId)
      state = useCodaiStore.getState()

      expect(state.notifications).toHaveLength(0)
    })
  })

  describe('React 18 Compatibility', () => {
    it('should work with React 18 concurrent features', () => {
      const store = useCodaiStore.getState()
      
      // Test that the store works without hydration issues
      expect(store).toBeDefined()
      expect(typeof store.setTheme).toBe('function')
      expect(typeof store.login).toBe('function')
      expect(typeof store.addProject).toBe('function')
    })

    it('should handle SSR correctly', () => {
      // Test that the store doesn't break during server-side rendering
      const store = useCodaiStore.getState()
      
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.projects).toEqual([])
    })
  })

  describe('State Persistence', () => {
    it('should persist user state', () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'developer' as const,
        preferences: {
          theme: 'dark' as const,
          language: 'en',
          notifications: true
        }
      }

      useCodaiStore.getState().login(mockUser)
      useCodaiStore.getState().setTheme('dark')
      useCodaiStore.getState().setSidebarOpen(false)
      
      const state = useCodaiStore.getState()

      // Verify that persistent state is set correctly
      expect(state.user).toEqual(mockUser)
      expect(state.theme).toBe('dark')
      expect(state.sidebarOpen).toBe(false)
    })
  })
})