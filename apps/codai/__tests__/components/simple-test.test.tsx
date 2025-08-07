/**
 * Phase 2 Component Testing - Testing Real Components
 * Testing actual components without React providers initially
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Import the existing TestComponent
import TestComponent from '../../src/components/TestComponent'

describe('Phase 2 Component Testing - Real Components', () => {
  it('renders TestComponent correctly', () => {
    const title = 'Test Title'
    const description = 'Test Description'

    render(<TestComponent title={title} description={description} />)

    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText(description)).toBeInTheDocument()

    // Check for proper HTML structure
    const titleElement = screen.getByText(title)
    expect(titleElement.tagName).toBe('H2')
    expect(titleElement).toHaveClass('text-xl', 'font-bold')
  })

  it('renders TestComponent without description', () => {
    const title = 'Only Title'

    render(<TestComponent title={title} />)

    expect(screen.getByText(title)).toBeInTheDocument()

    // Description should not be present
    const paragraphs = screen.queryAllByRole('paragraph')
    expect(paragraphs).toHaveLength(0)
  })

  it('applies correct CSS classes', () => {
    const title = 'Styled Title'
    const description = 'Styled Description'

    render(<TestComponent title={title} description={description} />)

    const container = screen.getByText(title).closest('div')
    expect(container).toHaveClass('p-4')

    const descriptionElement = screen.getByText(description)
    expect(descriptionElement).toHaveClass('text-gray-600')
  })

  it('verifies React Testing Library is working correctly', () => {
    render(
      <div>
        <h1>Test Title</h1>
        <p>Test content</p>
      </div>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})
