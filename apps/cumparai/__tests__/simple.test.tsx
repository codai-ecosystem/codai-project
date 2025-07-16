import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple component test to verify imports work
describe('Simple Component Test', () => {
    it('should render a basic div', () => {
        render(<div>Test Component</div>)
        expect(screen.getByText('Test Component')).toBeInTheDocument()
    })
})
