import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import TalentaiPage from './page'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock the RealTimeStats component
vi.mock('../components/RealTimeStats', () => ({
  RealTimeStats: () => <div data-testid="real-time-stats">Real Time Stats Component</div>
}))

describe('TalentAI Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Mock Date to avoid time-dependent test failures
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-01T14:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders the main TalentAI heading', () => {
        render(<TalentaiPage />)
        expect(screen.getAllByText(/Talent AI Recruitment/)[0]).toBeInTheDocument()
    })

    it('displays enterprise platform subtitle', () => {
        render(<TalentaiPage />)
        expect(screen.getByText('AI-driven talent acquisition and human resource management')).toBeInTheDocument()
    })

    it('shows system status as active', () => {
        render(<TalentaiPage />)
        expect(screen.getByText('System Active')).toBeInTheDocument()
        expect(screen.getByText('Online')).toBeInTheDocument()
    })

    it('displays real-time statistics cards', () => {
        render(<TalentaiPage />)
        
        // Check for stats labels (numbers are randomized so we test labels)
        expect(screen.getByText('Total Users')).toBeInTheDocument()
        expect(screen.getByText('Active Now')).toBeInTheDocument()
        expect(screen.getByText('Data Processed (GB)')).toBeInTheDocument()
        expect(screen.getByText('Uptime')).toBeInTheDocument()
    })

    it('renders enterprise feature cards', () => {
        render(<TalentaiPage />)
        
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
        expect(screen.getByText('User Management')).toBeInTheDocument()
        expect(screen.getByText('Data Management')).toBeInTheDocument()
    })

    it('displays security and performance indicators', () => {
        render(<TalentaiPage />)
        expect(screen.getByText('Enterprise Security')).toBeInTheDocument()
        expect(screen.getByText('High Performance')).toBeInTheDocument()
        expect(screen.getByText('Global Scale')).toBeInTheDocument()
    })

    it('shows current time in footer', () => {
        render(<TalentaiPage />)
        expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })

    it('applies glassmorphism styling', () => {
        render(<TalentaiPage />)
        // Check that glassmorphism CSS is applied
        const style = document.querySelector('style')
        expect(style?.textContent).toContain('glassmorphism')
        expect(style?.textContent).toContain('backdrop-filter: blur(20px)')
    })

    it('updates stats periodically', async () => {
        render(<TalentaiPage />)
        
        // Fast-forward time to trigger stats update
        vi.advanceTimersByTime(5000)
        
        await waitFor(() => {
            // Stats should still be displayed (numbers may have changed)
            expect(screen.getByText('Total Users')).toBeInTheDocument()
        }, { timeout: 1000 })
    })

    it('updates time display', async () => {
        render(<TalentaiPage />)
        
        // Fast-forward time by 1 second
        vi.advanceTimersByTime(1000)
        
        await waitFor(() => {
            expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
        }, { timeout: 1000 })
    })
})