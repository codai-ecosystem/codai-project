import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StateManagementDemo } from '../StateManagementDemo'
import { useCodaiStore } from '../../store'

// Mock localStorage for testing
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  },
  writable: true
})

describe('StateManagementDemo Component', () => {
  beforeEach(() => {
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

  it('renders the component correctly', () => {
    render(<StateManagementDemo />)
    
    expect(screen.getByText('State Management Demo')).toBeInTheDocument()
    expect(screen.getByText('Authentication State')).toBeInTheDocument()
    expect(screen.getByText('Projects (0)')).toBeInTheDocument()
    expect(screen.getByText('UI State')).toBeInTheDocument()
    expect(screen.getByText('Notifications (0)')).toBeInTheDocument()
  })

  it('handles user login correctly', () => {
    render(<StateManagementDemo />)
    
    // Initially not authenticated
    expect(screen.getByText('Status: ❌ Not Authenticated')).toBeInTheDocument()
    
    // Click login button
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    // Should be authenticated now
    expect(screen.getByText(/Status: ✅ Authenticated/)).toBeInTheDocument()
    expect(screen.getByText(/User: John Doe/)).toBeInTheDocument()
  })

  it('adds projects correctly', () => {
    render(<StateManagementDemo />)
    
    // Initially no projects
    expect(screen.getByText('Projects (0)')).toBeInTheDocument()
    
    // Add a project
    const addProjectButton = screen.getByText('Add Project')
    fireEvent.click(addProjectButton)
    
    // Should have one project now
    expect(screen.getByText('Projects (1)')).toBeInTheDocument()
    expect(screen.getByText('Project 1')).toBeInTheDocument()
  })

  it('toggles theme correctly', () => {
    render(<StateManagementDemo />)
    
    // Initially system theme
    expect(screen.getByText('Theme: system')).toBeInTheDocument()
    
    // Toggle theme
    const toggleThemeButton = screen.getByText('Toggle Theme')
    fireEvent.click(toggleThemeButton)
    
    // Should be light theme now
    expect(screen.getByText('Theme: light')).toBeInTheDocument()
  })

  it('toggles sidebar correctly', () => {
    render(<StateManagementDemo />)
    
    // Initially sidebar open
    expect(screen.getByText('Sidebar: Open')).toBeInTheDocument()
    
    // Toggle sidebar
    const toggleSidebarButton = screen.getByText('Toggle Sidebar')
    fireEvent.click(toggleSidebarButton)
    
    // Should be closed now
    expect(screen.getByText('Sidebar: Closed')).toBeInTheDocument()
  })

  it('shows notifications after login', () => {
    render(<StateManagementDemo />)
    
    // Initially no notifications
    expect(screen.getByText('Notifications (0)')).toBeInTheDocument()
    
    // Login to trigger notification
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    // Should have one notification
    expect(screen.getByText('Notifications (1)')).toBeInTheDocument()
    expect(screen.getByText('Login Successful')).toBeInTheDocument()
    expect(screen.getByText('Welcome back to CODAI!')).toBeInTheDocument()
  })

  it('removes notifications correctly', () => {
    render(<StateManagementDemo />)
    
    // Login to create a notification
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    // Should have one notification
    expect(screen.getByText('Notifications (1)')).toBeInTheDocument()
    
    // Remove notification
    const removeButton = screen.getByText('✕')
    fireEvent.click(removeButton)
    
    // Should have no notifications
    expect(screen.getByText('Notifications (0)')).toBeInTheDocument()
  })

  it('displays store debug information', () => {
    render(<StateManagementDemo />)
    
    // Login first to have some data
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    // Find and click the debug details
    const debugDetails = screen.getByText('Store Debug Information')
    fireEvent.click(debugDetails)
    
    // Should show debug information
    expect(screen.getByText(/"theme": "system"/)).toBeInTheDocument()
    expect(screen.getByText(/"sidebarOpen": true/)).toBeInTheDocument()
  })

  it('integrates with Zustand store correctly', () => {
    render(<StateManagementDemo />)
    
    // Test that component state matches store state
    const initialStore = useCodaiStore.getState()
    expect(initialStore.isAuthenticated).toBe(false)
    expect(initialStore.projects).toHaveLength(0)
    expect(initialStore.theme).toBe('system')
    
    // Perform actions
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    const addProjectButton = screen.getByText('Add Project')
    fireEvent.click(addProjectButton)
    
    // Verify store state changed
    const updatedStore = useCodaiStore.getState()
    expect(updatedStore.isAuthenticated).toBe(true)
    expect(updatedStore.projects).toHaveLength(1)
    expect(updatedStore.notifications).toHaveLength(2) // Login + Project created
  })
})