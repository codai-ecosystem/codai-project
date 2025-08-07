import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AdminHeader from '../components/AdminHeader'

describe('AdminHeader Component', () => {
  it('renders admin header with navigation', () => {
    render(<AdminHeader />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
  
  it('displays user menu when user is logged in', () => {
    render(<AdminHeader user={{ name: 'Admin User' }} />)
    expect(screen.getByText('Admin User')).toBeInTheDocument()
  })
  
  it('shows login button when user is not logged in', () => {
    render(<AdminHeader />)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })
})

