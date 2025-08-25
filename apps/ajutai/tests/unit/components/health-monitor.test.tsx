/**
 * AjutAI Health Monitor Component Unit Tests
 * Testing health monitoring and system status functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { HealthMonitor } from '@/components/health/HealthMonitor'

// Mock the API calls
vi.mock('@/lib/api', () => ({
  getSystemHealth: vi.fn(),
  getServiceStatus: vi.fn(),
  runHealthCheck: vi.fn(),
}))

const mockHealthData = {
  status: 'healthy',
  services: [
    { name: 'cbd-database', status: 'healthy', uptime: 3600, responseTime: 150 },
    { name: 'memorai-app', status: 'healthy', uptime: 3500, responseTime: 200 },
    { name: 'gateway', status: 'warning', uptime: 3400, responseTime: 350 },
    { name: 'romai-agi', status: 'healthy', uptime: 3300, responseTime: 180 }
  ],
  systemMetrics: {
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 23,
    networkLatency: 120
  },
  timestamp: '2025-08-23T09:30:00Z'
}

describe('HealthMonitor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(require('@/lib/api').getSystemHealth).mockResolvedValue(mockHealthData)
  })

  it('renders health monitor with service statuses', async () => {
    render(<HealthMonitor />)
    
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument()
    })
    
    // Check service statuses
    expect(screen.getByText('cbd-database')).toBeInTheDocument()
    expect(screen.getByText('memorai-app')).toBeInTheDocument()
    expect(screen.getByText('gateway')).toBeInTheDocument()
    expect(screen.getByText('romai-agi')).toBeInTheDocument()
  })

  it('displays correct status indicators', async () => {
    render(<HealthMonitor />)
    
    await waitFor(() => {
      expect(screen.getAllByText('healthy')).toHaveLength(3)
      expect(screen.getByText('warning')).toBeInTheDocument()
    })
  })

  it('shows system metrics', async () => {
    render(<HealthMonitor />)
    
    await waitFor(() => {
      expect(screen.getByText('45%')).toBeInTheDocument() // CPU
      expect(screen.getByText('67%')).toBeInTheDocument() // Memory
      expect(screen.getByText('23%')).toBeInTheDocument() // Disk
      expect(screen.getByText('120ms')).toBeInTheDocument() // Network
    })
  })

  it('handles refresh button click', async () => {
    const mockGetHealth = vi.mocked(require('@/lib/api').getSystemHealth)
    render(<HealthMonitor />)
    
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument()
    })
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(mockGetHealth).toHaveBeenCalledTimes(2) // Initial load + refresh
    })
  })

  it('handles run health check', async () => {
    const mockRunCheck = vi.mocked(require('@/lib/api').runHealthCheck)
    mockRunCheck.mockResolvedValue({ success: true, message: 'Health check completed' })
    
    render(<HealthMonitor />)
    
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument()
    })
    
    const healthCheckButton = screen.getByRole('button', { name: /run health check/i })
    fireEvent.click(healthCheckButton)
    
    await waitFor(() => {
      expect(mockRunCheck).toHaveBeenCalledTimes(1)
    })
  })

  it('displays error state when API fails', async () => {
    vi.mocked(require('@/lib/api').getSystemHealth).mockRejectedValue(new Error('API Error'))
    
    render(<HealthMonitor />)
    
    await waitFor(() => {
      expect(screen.getByText(/error loading health data/i)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    render(<HealthMonitor />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('filters services by status', async () => {
    render(<HealthMonitor />)
    
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument()
    })
    
    // Click filter to show only healthy services
    const healthyFilter = screen.getByRole('button', { name: /healthy only/i })
    fireEvent.click(healthyFilter)
    
    await waitFor(() => {
      expect(screen.getAllByText('healthy')).toHaveLength(3)
      expect(screen.queryByText('warning')).not.toBeInTheDocument()
    })
  })

  it('displays service details on click', async () => {
    render(<HealthMonitor />)
    
    await waitFor(() => {
      expect(screen.getByText('cbd-database')).toBeInTheDocument()
    })
    
    const serviceItem = screen.getByText('cbd-database')
    fireEvent.click(serviceItem)
    
    // Should show detailed information
    await waitFor(() => {
      expect(screen.getByText('Response Time: 150ms')).toBeInTheDocument()
      expect(screen.getByText('Uptime: 1h')).toBeInTheDocument()
    })
  })
})