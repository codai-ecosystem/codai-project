import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HubDashboard from '../components/HubDashboard'

describe('Hub Integration Tests', () => {
  it('displays service status cards', () => {
    const services = [
      { name: 'Admin', status: 'healthy', port: 4007 },
      { name: 'ID Service', status: 'healthy', port: 4004 }
    ]
    
    render(<HubDashboard services={services} />)
    
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('ID Service')).toBeInTheDocument()
    expect(screen.getAllByText('healthy')).toHaveLength(2)
  })
  
  it('handles service configuration', async () => {
    const mockUpdateConfig = vi.fn()
    render(<HubDashboard onUpdateConfig={mockUpdateConfig} />)
    
    fireEvent.click(screen.getByText('Configure Services'))
    fireEvent.change(screen.getByLabelText('Admin Port'), { target: { value: '4007' } })
    fireEvent.click(screen.getByText('Save Configuration'))
    
    await waitFor(() => {
      expect(mockUpdateConfig).toHaveBeenCalledWith({
        admin: { port: '4007' }
      })
    })
  })
  
  it('monitors real-time service health', async () => {
    const mockHealthCheck = vi.fn().mockResolvedValue({ status: 'healthy' })
    render(<HubDashboard onHealthCheck={mockHealthCheck} />)
    
    await waitFor(() => {
      expect(mockHealthCheck).toHaveBeenCalled()
    }, { timeout: 5000 })
  })
})

