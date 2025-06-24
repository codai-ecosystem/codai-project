import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Mock component for testing
const TestComponent = () => {
  return (
    <div>
      <h1>Welcome to codai</h1>
      <p>This is a test component</p>
    </div>
  )
}

describe('codai Components', () => {
  it('renders test component', () => {
    render(<TestComponent />)
    expect(screen.getByText('Welcome to codai')).toBeInTheDocument()
  })

  it('renders test description', () => {
    render(<TestComponent />)
    expect(screen.getByText('This is a test component')).toBeInTheDocument()
  })
})