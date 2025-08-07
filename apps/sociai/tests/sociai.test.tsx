import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TEST_TIMEOUT } from './setup'

describe('sociai', () => {
  it('should have basic test infrastructure working', () => {
    expect(true).toBe(true)
  }, TEST_TIMEOUT)

  it('should be able to render a simple component', () => {
    const TestComponent = () => <div data-testid="test">Hello sociai!</div>
    render(<TestComponent />)
    expect(screen.getByTestId('test')).toBeInTheDocument()
  }, TEST_TIMEOUT)
})
