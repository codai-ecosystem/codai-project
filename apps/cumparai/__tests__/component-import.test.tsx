import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Component Import Test', () => {
    it('should import React components successfully', () => {
        function TestComponent() {
            return <div>Test Component</div>
        }

        render(<TestComponent />)
        expect(screen.getByText('Test Component')).toBeInTheDocument()
    })

    it('should import Lucide icons', async () => {
        const { ShoppingBag } = await import('lucide-react')
        expect(ShoppingBag).toBeDefined()
    })
})
