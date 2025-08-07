/**
 * Phase 2 - Basic DOM Testing - Success Path
 * Starting with the simplest possible tests to verify setup
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Phase 2 - Basic DOM Testing Success', () => {
  it('renders a simple div element', () => {
    render(<div data-testid="simple-div">Hello World</div>)

    expect(screen.getByTestId('simple-div')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders JSX with multiple elements', () => {
    render(
      <div>
        <h1 data-testid="title">Main Title</h1>
        <p data-testid="content">Content paragraph</p>
        <button data-testid="button">Click me</button>
      </div>
    )

    expect(screen.getByTestId('title')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByTestId('button')).toBeInTheDocument()

    expect(screen.getByText('Main Title')).toBeInTheDocument()
    expect(screen.getByText('Content paragraph')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders function component correctly', () => {
    const SimpleComponent = ({ text }: { text: string }) => (
      <div data-testid="simple-component">{text}</div>
    )

    render(<SimpleComponent text="Test Text" />)

    expect(screen.getByTestId('simple-component')).toBeInTheDocument()
    expect(screen.getByText('Test Text')).toBeInTheDocument()
  })

  it('renders component with props', () => {
    interface CardProps {
      title: string
      children: React.ReactNode
    }

    const Card: React.FC<CardProps> = ({ title, children }) => (
      <div className="card" data-testid="card">
        <h3 data-testid="card-title">{title}</h3>
        <div data-testid="card-content">{children}</div>
      </div>
    )

    render(
      <Card title="Test Card">
        <p>Card content</p>
      </Card>
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('verifies CSS classes work', () => {
    render(
      <div className="bg-blue-500 text-white p-4" data-testid="styled-div">
        Styled content
      </div>
    )

    const element = screen.getByTestId('styled-div')
    expect(element).toHaveClass('bg-blue-500')
    expect(element).toHaveClass('text-white')
    expect(element).toHaveClass('p-4')
  })
})
