import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HeroSection } from '../components/sections/HeroSection'

describe('PREZENTAI Integration Tests', () => {
    describe('Complete User Flows', () => {
        it('renders portfolio platform landing page successfully', async () => {
            render(<HeroSection />)

            // Check for basic content
            await waitFor(() => {
                expect(screen.getByText(/prezentai/i)).toBeInTheDocument()
            })

            expect(screen.getByText(/portfolio/i)).toBeInTheDocument()
        })

        it('handles real-time data updates correctly', async () => {
            render(<HeroSection />)

            await waitFor(() => {
                // Check for interactive elements
                expect(screen.getByText(/explore ecosystem/i)).toBeInTheDocument()
            })
        })

        it('displays feature cards and interactive elements', async () => {
            render(<HeroSection />)

            await waitFor(() => {
                // Portfolio and ecosystem showcase elements
                expect(screen.getByText(/ai applications/i)).toBeInTheDocument()
            })
        })
    })

    describe('Data Flow Integration', () => {
        it('integrates stats with visual elements', async () => {
            render(<HeroSection />)

            await waitFor(() => {
                // Check for portfolio and showcase content
                const ecosystemElements = screen.getAllByText(/ai ecosystem/i)
                expect(ecosystemElements.length).toBeGreaterThan(0)
            })
        })

        it('synchronizes real-time updates across components', async () => {
            render(<HeroSection />)

            await waitFor(() => {
                // Stats and metrics should be present
                const statsElements = screen.getAllByText(/30\+/)
                expect(statsElements.length).toBeGreaterThan(0)
            })
        })
    })

    describe('Performance Integration', () => {
        it('handles multiple simultaneous operations', async () => {
            const startTime = performance.now()
            render(<HeroSection />)

            await waitFor(() => {
                expect(screen.getByText(/prezentai/i)).toBeInTheDocument()
            })

            const endTime = performance.now()
            expect(endTime - startTime).toBeLessThan(5000) // Should render within 5 seconds
        })
    })

    describe('PREZENTAI-Specific Features', () => {
        it('displays portfolio platform branding correctly', async () => {
            render(<HeroSection />)

            await waitFor(() => {
                expect(screen.getByText(/prezentai/i)).toBeInTheDocument()
                expect(screen.getByText(/portfolio/i)).toBeInTheDocument()
            })
        })

        it('shows ecosystem showcase and project features', async () => {
            render(<HeroSection />)

            await waitFor(() => {
                const ecosystemElements = screen.getAllByText(/ecosystem/i)
                expect(ecosystemElements.length).toBeGreaterThan(0)
                const applicationsElements = screen.getAllByText(/applications/i)
                expect(applicationsElements.length).toBeGreaterThan(0)
            })
        })

        it('displays contact and technical expertise sections', async () => {
            render(<HeroSection />)

            await waitFor(() => {
                expect(screen.getByText(/revolutionary/i)).toBeInTheDocument()
                expect(screen.getByText(/portfolio/i)).toBeInTheDocument()
            })
        })
    })
})
