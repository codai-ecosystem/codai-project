import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EcosystemShowcase } from '../../../components/sections/EcosystemShowcase'

describe('EcosystemShowcase', () => {
    it('renders ecosystem showcase with correct heading', () => {
        render(<EcosystemShowcase />)
        expect(screen.getByText(/30\+ Cutting-Edge/i)).toBeInTheDocument()
        expect(screen.getByText(/AI Ecosystem Portfolio/i)).toBeInTheDocument()
    })

    it('displays category filter buttons', () => {
        render(<EcosystemShowcase />)
        
        // Check for category buttons
        expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Development/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Finance/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Trading/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Education/i })).toBeInTheDocument()
    })

    it('shows ecosystem applications with real data', () => {
        render(<EcosystemShowcase />)
        
        // Check for key applications
        expect(screen.getByText(/CODAI/i)).toBeInTheDocument()
        expect(screen.getByText(/MEMORAI/i)).toBeInTheDocument()
        expect(screen.getByText(/BANCAI/i)).toBeInTheDocument()
        expect(screen.getByText(/STOCAI/i)).toBeInTheDocument()
        expect(screen.getByText(/STUDIAI/i)).toBeInTheDocument()
    })

    it('displays application details with ports and descriptions', () => {
        render(<EcosystemShowcase />)
        
        // Check for port information
        expect(screen.getByText(/Port 4030/i)).toBeInTheDocument() // CODAI
        expect(screen.getByText(/Port 4031/i)).toBeInTheDocument() // MEMORAI
        expect(screen.getByText(/Port 4033/i)).toBeInTheDocument() // BANCAI
        
        // Check for descriptions
        expect(screen.getByText(/Advanced AI-powered code generation/i)).toBeInTheDocument()
        expect(screen.getByText(/Hyper-fast memory management system/i)).toBeInTheDocument()
        expect(screen.getByText(/Intelligent banking and financial management/i)).toBeInTheDocument()
    })

    it('shows live status badges for active applications', () => {
        render(<EcosystemShowcase />)
        
        const liveStatusBadges = screen.getAllByText(/LIVE/i)
        expect(liveStatusBadges.length).toBeGreaterThan(0)
    })

    it('displays application features', () => {
        render(<EcosystemShowcase />)
        
        // Check for MEMORAI features (more specific)
        expect(screen.getByText(/Context Storage/i)).toBeInTheDocument()
        expect(screen.getByText(/Fast Retrieval/i)).toBeInTheDocument()
        
        // Check for BANCAI features
        expect(screen.getByText(/Smart Banking/i)).toBeInTheDocument()
        expect(screen.getByText(/Financial Analytics/i)).toBeInTheDocument()
    })

    it('filters applications by category', () => {
        render(<EcosystemShowcase />)
        
        // Click on Finance category
        const financeButton = screen.getByRole('button', { name: /Finance/i })
        fireEvent.click(financeButton)
        
        // Should show BANCAI but not CODAI
        expect(screen.getByText(/BANCAI/i)).toBeInTheDocument()
        expect(screen.queryByText(/CODAI/i)).not.toBeInTheDocument()
    })

    it('shows launch app links for live applications', () => {
        render(<EcosystemShowcase />)
        
        const launchButtons = screen.getAllByText(/Launch App/i)
        expect(launchButtons.length).toBeGreaterThan(0)
        
        // Check that links point to correct ports - get first one
        const firstLaunchLink = screen.getAllByRole('link')[0]
        expect(firstLaunchLink).toHaveAttribute('href', expect.stringContaining('localhost:'))
    })

    it('displays ecosystem description', () => {
        render(<EcosystemShowcase />)
        
        expect(screen.getByText(/comprehensive ecosystem of AI-powered applications/i)).toBeInTheDocument()
        expect(screen.getByText(/different industries and domains/i)).toBeInTheDocument()
    })

    it('shows development status information', () => {
        render(<EcosystemShowcase />)
        
        expect(screen.getByText(/More applications in development/i)).toBeInTheDocument()
        expect(screen.getByText(/constantly evolving/i)).toBeInTheDocument()
    })
})
