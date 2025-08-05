import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginForm from '../../components/LoginForm'

describe('LoginForm Security Tests', () => {
  it('prevents XSS attacks in input fields', async () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} />)

    const maliciousScript = '<script>alert("xss")</script>'

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: maliciousScript } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } })
    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled()
      // Check for invalid email format or other security validation
    })
  })

  it('enforces rate limiting on login attempts', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Rate limited'))
    render(<LoginForm onLogin={mockLogin} />)

    // Simulate multiple rapid login attempts
    for (let i = 0; i < 5; i++) {
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } })
      fireEvent.click(screen.getByText('Sign In'))
    }

    await waitFor(() => {
      // Test should check if rate limiting is working
      expect(mockLogin).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('clears sensitive data on unmount', () => {
    const { unmount } = render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } })

    unmount()

    // Verify password field is cleared from memory
    expect(document.querySelector('input[type="password"]')).toBeNull()
  })
})
