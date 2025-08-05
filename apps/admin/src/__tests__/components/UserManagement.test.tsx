import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UserManagement from '../components/UserManagement'

describe('UserManagement Component', () => {
  it('renders user management table', () => {
    render(<UserManagement />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
  
  it('allows creating new users', async () => {
    const mockCreateUser = vi.fn()
    render(<UserManagement onCreateUser={mockCreateUser} />)
    
    fireEvent.click(screen.getByText('Add User'))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      })
    })
  })
  
  it('validates user input', async () => {
    render(<UserManagement />)
    
    fireEvent.click(screen.getByText('Add User'))
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })
})
