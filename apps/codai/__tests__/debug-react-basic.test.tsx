/**
 * 🧪 Debug React Basic Test
 * Minimal test to isolate React children error
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render as testingLibraryRender, screen } from '@testing-library/react'

// Import render directly without our custom wrapper to isolate the issue

// Create absolute minimal components to test
const MinimalDiv = () => <div data-testid="minimal">Hello</div>

const MinimalWithChildren = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="with-children">{children}</div>
)

describe('🔧 Debug React Basics', () => {
    it('renders minimal div without errors', () => {
        testingLibraryRender(<MinimalDiv />)
        expect(screen.getByTestId('minimal')).toBeInTheDocument()
    })

    it('renders minimal component with children', () => {
        testingLibraryRender(
            <MinimalWithChildren>
                <span>Child content</span>
            </MinimalWithChildren>
        )
        expect(screen.getByTestId('with-children')).toBeInTheDocument()
        expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('renders jsx without issues', () => {
        const element = <div>JSX Test</div>
        testingLibraryRender(element)
        expect(screen.getByText('JSX Test')).toBeInTheDocument()
    })
})
