/**
 * 🧪 React 19 Compatibility Test
 * Simple test to verify React 19.1.1 works with our test environment
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test component that should work with React 19
function React19TestComponent({ title = "React 19 Test" }) {
    return (
        <div data-testid="react19-component">
            <h1>{title}</h1>
            <p>Testing React 19.1.1 compatibility</p>
        </div>
    )
}

describe('React 19 Compatibility', () => {
    it('should render React components without errors', () => {
        render(<React19TestComponent />)

        expect(screen.getByTestId('react19-component')).toBeInTheDocument()
        expect(screen.getByText('React 19 Test')).toBeInTheDocument()
        expect(screen.getByText('Testing React 19.1.1 compatibility')).toBeInTheDocument()
    })

    it('should handle props correctly', () => {
        render(<React19TestComponent title="Custom Title" />)

        expect(screen.getByText('Custom Title')).toBeInTheDocument()
        expect(screen.getByTestId('react19-component')).toBeInTheDocument()
    })

    it('should handle jsx elements without "Objects are not valid as a React child" error', () => {
        const CustomComponent = () => (
            <div data-testid="custom-component">
                <span>Custom content</span>
            </div>
        )

        render(<CustomComponent />)

        expect(screen.getByTestId('custom-component')).toBeInTheDocument()
        expect(screen.getByText('Custom content')).toBeInTheDocument()
    })

    it('should handle React.createElement without issues', () => {
        const element = React.createElement(
            'div',
            { 'data-testid': 'created-element' },
            'Created with React.createElement'
        )

        render(element)

        expect(screen.getByTestId('created-element')).toBeInTheDocument()
        expect(screen.getByText('Created with React.createElement')).toBeInTheDocument()
    })
})
