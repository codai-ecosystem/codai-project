import { vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Test timeout constant
export const TEST_TIMEOUT = 10000

// Setup DOM environment properly
import { cleanup } from '@testing-library/react'

beforeEach(() => {
  cleanup()
})

// Create comprehensive mock data that matches the real hook structure
const mockDashboardData = {
  metrics: {
    totalProjects: 12,
    totalAgents: 8,
    activeTasks: 24,
    completedTasks: 156,
    agentUtilization: 78,
    systemHealth: 95
  },
  projects: [
    {
      id: 'proj-1',
      name: 'CODAI Ecosystem Enhancement',
      description: 'Comprehensive testing and quality improvements',
      status: 'active' as const,
      progress: 85,
      teamSize: 6,
      tasks: [],
      createdAt: '2025-07-01T00:00:00Z'
    },
    {
      id: 'proj-2',
      name: 'Authentication Security Audit',
      description: 'Complete security overhaul of authentication systems',
      status: 'completed' as const,
      progress: 100,
      teamSize: 4,
      tasks: [],
      createdAt: '2025-06-01T00:00:00Z'
    },
    {
      id: 'proj-3',
      name: 'Frontend Testing Initiative',
      description: 'Comprehensive testing for all frontend applications',
      status: 'planning' as const,
      progress: 15,
      teamSize: 3,
      tasks: [],
      createdAt: '2025-08-01T00:00:00Z'
    }
  ],
  agents: [
    {
      id: 'agent-1',
      name: 'Testing Specialist',
      type: 'QA Engineer',
      status: 'online' as const,
      currentTask: 'Frontend Testing Phase 2C',
      capabilities: ['Testing', 'Quality Assurance'],
      performance: 95
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Hub Frontend Testing',
      status: 'completed' as const,
      assignedAgent: 'agent-1',
      priority: 'high' as const,
      estimatedHours: 8,
      actualHours: 6,
      createdAt: '2025-07-30T00:00:00Z'
    },
    {
      id: 'task-2',
      title: 'Admin Dashboard Testing',
      status: 'in_progress' as const,
      assignedAgent: 'agent-1',
      priority: 'medium' as const,
      estimatedHours: 12,
      actualHours: 4,
      createdAt: '2025-07-31T00:00:00Z'
    }
  ]
}

// Mock the useControlAIApi hook
vi.mock('../src/hooks/useControlAIApi', () => ({
  useControlAIApi: vi.fn(() => ({
    dashboardData: mockDashboardData,
    loading: false,
    error: null,
    refetch: vi.fn()
  })),
  // Export types and data for tests to use
  mockDashboardData
}))

// Mock recharts without JSX syntax
vi.mock('recharts', () => ({
  ResponsiveContainer: vi.fn((props) => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'responsive-container',
      style: {
        width: props.width || '100%',
        height: props.height || 300
      }
    }, props.children)
  }),
  LineChart: vi.fn((props) => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'line-chart'
    }, props.children)
  }),
  BarChart: vi.fn((props) => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'bar-chart'
    }, props.children)
  }),
  PieChart: vi.fn((props) => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'pie-chart'
    })
  }),
  Line: vi.fn(() => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'line'
    })
  }),
  Bar: vi.fn(() => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'bar'
    })
  }),
  Pie: vi.fn(() => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'pie'
    })
  }),
  XAxis: vi.fn(() => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'x-axis'
    })
  }),
  YAxis: vi.fn(() => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'y-axis'
    })
  }),
  CartesianGrid: vi.fn(() => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'cartesian-grid'
    })
  }),
  Tooltip: vi.fn(() => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'tooltip'
    })
  }),
  Cell: vi.fn(() => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'cell'
    })
  })
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Monitor: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'monitor-icon'
    }, '📺')
  }),
  Users: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'users-icon'
    }, '👥')
  }),
  FolderKanban: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'folder-kanban-icon'
    }, '📁')
  }),
  Activity: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'activity-icon'
    }, '📈')
  }),
  Clock: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'clock-icon'
    }, '🕐')
  }),
  CheckCircle: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'check-circle-icon'
    }, '✅')
  }),
  User: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'user-icon'
    }, '👤')
  }),
  Flag: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'flag-icon'
    }, '🚩')
  }),
  BarChart: vi.fn(() => {
    const React = require('react')
    return React.createElement('span', {
      'data-testid': 'bar-chart-icon'
    }, '📊')
  })
}))

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()

  // Clean up DOM
  cleanup()
})

// Mock global objects
Object.defineProperty(global, 'fetch', {
  value: vi.fn(),
  writable: true
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

export { mockDashboardData }
