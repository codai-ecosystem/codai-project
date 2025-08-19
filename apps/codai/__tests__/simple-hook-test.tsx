/**
 * Simple Hook Test - Testing React Hooks in CODAI
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Simple counter component with hooks
const SimpleCounter: React.FC = () => {
    const [count, setCount] = React.useState(0)

    return (
        <div>
            <span data-testid="count">Count: {count}</span>
            <button
                data-testid="increment"
                onClick={() => setCount(c => c + 1)}
            >
                Increment
            </button>
        </div>
    )
}

describe('🧪 Simple Hook Test', () => {
    it('should render counter with initial state', () => {
        render(<SimpleCounter />)
        expect(screen.getByTestId('count')).toHaveTextContent('Count: 0')
    })

    it('should increment count when button clicked', () => {
        render(<SimpleCounter />)

        const button = screen.getByTestId('increment')
        fireEvent.click(button)

        expect(screen.getByTestId('count')).toHaveTextContent('Count: 1')
    })
})
