import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendingUp, ShoppingBag } from 'lucide-react'

describe('Simple Mocking Test', () => {
    it('should render simple text', () => {
        const TestComponent = () => <div>Hello World</div>
        const { container } = render(<TestComponent />)
        expect(container).toBeTruthy()
    })

    it('should handle icon components', () => {
        const IconTest = () => (
            <div>
                <TrendingUp className="w-4 h-4" />
                <ShoppingBag />
            </div>
        )
        const { container } = render(<IconTest />)
        expect(container).toBeTruthy()
        expect(container.textContent).not.toContain('mocked-jsx-element')
    })

    it('should render basic JSX without errors', () => {
        const SimpleComponent = () => (
            <div>
                <h1>Test Title</h1>
                <p>Test content</p>
            </div>
        )
        const { container } = render(<SimpleComponent />)
        expect(container.textContent).toContain('Test Title')
        expect(container.textContent).toContain('Test content')
    })
})
