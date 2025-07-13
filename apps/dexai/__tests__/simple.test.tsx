import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Simple Test', () => {
    it('should render a simple div', () => {
        render(<div>Hello DEXAI</div>)
        expect(screen.getByText('Hello DEXAI')).toBeInTheDocument()
    })
})
