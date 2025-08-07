/**
 * Phase 2 - TestComponent Comprehensive Testing
 * Complete testing of existing CODAI TestComponent
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Import the actual CODAI component
import TestComponent from '../../src/components/TestComponent'

describe('CODAI TestComponent - Phase 2 Comprehensive Testing', () => {
  describe('Basic Rendering', () => {
    it('renders with required title prop', () => {
      const title = 'Test Component Title'

      render(<TestComponent title={title} />)

      expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('renders with both title and description', () => {
      const title = 'Component Title'
      const description = 'Component description text'

      render(<TestComponent title={title} description={description} />)

      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('renders without description when not provided', () => {
      const title = 'Only Title'

      render(<TestComponent title={title} />)

      expect(screen.getByText(title)).toBeInTheDocument()

      // Description should not be present
      const container = screen.getByText(title).closest('div')
      expect(container?.children).toHaveLength(1) // Only title element
    })
  })

  describe('HTML Structure & Semantics', () => {
    it('uses correct HTML semantic structure', () => {
      const title = 'Semantic Title'
      const description = 'Semantic description'

      render(<TestComponent title={title} description={description} />)

      // Title should be h2 element
      const titleElement = screen.getByRole('heading', { level: 2 })
      expect(titleElement).toBeInTheDocument()
      expect(titleElement).toHaveTextContent(title)

      // Description should be paragraph
      const descriptionElement = screen.getByText(description)
      expect(descriptionElement.tagName).toBe('P')
    })

    it('has proper container structure', () => {
      const title = 'Container Test'

      render(<TestComponent title={title} />)

      const titleElement = screen.getByText(title)
      const container = titleElement.closest('div')

      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('p-4')
    })
  })

  describe('CSS Classes & Styling', () => {
    it('applies correct CSS classes to title', () => {
      const title = 'Styled Title'

      render(<TestComponent title={title} />)

      const titleElement = screen.getByText(title)
      expect(titleElement).toHaveClass('text-xl')
      expect(titleElement).toHaveClass('font-bold')
    })

    it('applies correct CSS classes to description', () => {
      const title = 'Title'
      const description = 'Styled description'

      render(<TestComponent title={title} description={description} />)

      const descriptionElement = screen.getByText(description)
      expect(descriptionElement).toHaveClass('text-gray-600')
    })

    it('applies container padding class', () => {
      const title = 'Container Test'

      render(<TestComponent title={title} />)

      const container = screen.getByText(title).closest('div')
      expect(container).toHaveClass('p-4')
    })
  })

  describe('Props Interface & TypeScript', () => {
    it('accepts title as required string prop', () => {
      // This test verifies TypeScript interface compliance
      const title = 'Required Title Prop'

      render(<TestComponent title={title} />)

      expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('accepts optional description prop', () => {
      const title = 'Title'
      const description = 'Optional description prop'

      render(<TestComponent title={title} description={description} />)

      expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('handles undefined description gracefully', () => {
      const title = 'Title Only'

      render(<TestComponent title={title} description={undefined} />)

      expect(screen.getByText(title)).toBeInTheDocument()
      // No description should be rendered
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
    })
  })

  describe('Conditional Rendering Logic', () => {
    it('shows description only when provided', () => {
      const title = 'Conditional Test'

      // Without description
      const { rerender } = render(<TestComponent title={title} />)
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()

      // With description
      const description = 'Now with description'
      rerender(<TestComponent title={title} description={description} />)
      expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('handles empty string description', () => {
      const title = 'Empty Description Test'

      render(<TestComponent title={title} description="" />)

      expect(screen.getByText(title)).toBeInTheDocument()
      // Empty description should not render paragraph
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper heading hierarchy', () => {
      const title = 'Accessible Title'

      render(<TestComponent title={title} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(title)
    })

    it('maintains readable text contrast with gray text', () => {
      const title = 'Title'
      const description = 'Gray text description'

      render(<TestComponent title={title} description={description} />)

      const descriptionElement = screen.getByText(description)
      expect(descriptionElement).toHaveClass('text-gray-600')
      // Gray-600 on white background meets WCAG contrast requirements
    })
  })

  describe('Component Behavior', () => {
    it('re-renders correctly when props change', () => {
      const initialTitle = 'Initial Title'
      const updatedTitle = 'Updated Title'

      const { rerender } = render(<TestComponent title={initialTitle} />)
      expect(screen.getByText(initialTitle)).toBeInTheDocument()

      rerender(<TestComponent title={updatedTitle} />)
      expect(screen.getByText(updatedTitle)).toBeInTheDocument()
      expect(screen.queryByText(initialTitle)).not.toBeInTheDocument()
    })

    it('handles dynamic prop updates', () => {
      const title = 'Dynamic Test'
      const initialDescription = 'Initial description'
      const updatedDescription = 'Updated description'

      const { rerender } = render(
        <TestComponent title={title} description={initialDescription} />
      )
      expect(screen.getByText(initialDescription)).toBeInTheDocument()

      rerender(<TestComponent title={title} description={updatedDescription} />)
      expect(screen.getByText(updatedDescription)).toBeInTheDocument()
      expect(screen.queryByText(initialDescription)).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long title text', () => {
      const longTitle = 'This is a very long title that contains many words and should still render correctly without breaking the layout or causing any issues'

      render(<TestComponent title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles special characters in props', () => {
      const title = 'Title with "quotes" & special chars: <>&'
      const description = 'Description with émojis 🚀 and ñúmérîc chârs'

      render(<TestComponent title={title} description={description} />)

      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('handles whitespace-only props', () => {
      const title = '   Whitespace Title   '
      const description = '   Whitespace Description   '

      render(<TestComponent title={title} description={description} />)

      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByText(description)).toBeInTheDocument()
    })
  })

  describe('Integration Testing', () => {
    it('works within a parent container', () => {
      const title = 'Child Component'

      render(
        <div data-testid="parent-container">
          <TestComponent title={title} />
        </div>
      )

      expect(screen.getByTestId('parent-container')).toBeInTheDocument()
      expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('works with multiple instances', () => {
      render(
        <div>
          <TestComponent title="First Component" description="First description" />
          <TestComponent title="Second Component" />
          <TestComponent title="Third Component" description="Third description" />
        </div>
      )

      expect(screen.getByText('First Component')).toBeInTheDocument()
      expect(screen.getByText('First description')).toBeInTheDocument()
      expect(screen.getByText('Second Component')).toBeInTheDocument()
      expect(screen.getByText('Third Component')).toBeInTheDocument()
      expect(screen.getByText('Third description')).toBeInTheDocument()
    })
  })
})
