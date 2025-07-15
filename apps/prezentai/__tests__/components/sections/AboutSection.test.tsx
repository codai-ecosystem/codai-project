import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutSection } from '../../../components/sections/AboutSection'

describe('AboutSection', () => {
    it('renders about section with correct heading', () => {
        render(<AboutSection />)
        expect(screen.getByText(/Building the Future of/i)).toBeInTheDocument()
        expect(screen.getByText(/About Our Ecosystem/i)).toBeInTheDocument()
    })

    it('displays feature cards with real content', () => {
        render(<AboutSection />)
        
        // Check for key features - using more specific text
        expect(screen.getByText(/Precision Engineering/i)).toBeInTheDocument()
        expect(screen.getByText(/Innovation Focus/i)).toBeInTheDocument()
        expect(screen.getByText(/Enterprise Security/i)).toBeInTheDocument()
        expect(screen.getByText(/User-Centric Design/i)).toBeInTheDocument()
        expect(screen.getByText(/Creative Solutions/i)).toBeInTheDocument()
    })

    it('shows performance metrics with real data', () => {
        render(<AboutSection />)
        
        // Check for achievement metrics
        expect(screen.getByText(/99.9%/i)).toBeInTheDocument()
        expect(screen.getByText(/Uptime Guarantee/i)).toBeInTheDocument()
        expect(screen.getByText(/< 100ms/i)).toBeInTheDocument()
        expect(screen.getByText(/Response Time/i)).toBeInTheDocument()
        expect(screen.getByText(/256-bit/i)).toBeInTheDocument()
        expect(screen.getByText(/Encryption Standard/i)).toBeInTheDocument()
        expect(screen.getByText(/24\/7/i)).toBeInTheDocument()
        expect(screen.getByText(/Support Coverage/i)).toBeInTheDocument()
    })

    it('displays vision statement section', () => {
        render(<AboutSection />)
        
        expect(screen.getByText(/Our Vision/i)).toBeInTheDocument()
        expect(screen.getByText(/Innovation through Intelligence/i)).toBeInTheDocument()
        expect(screen.getByText(/30\+ applications/i)).toBeInTheDocument()
    })

    it('contains about section element', () => {
        render(<AboutSection />)
        
        // Look for the section with id="about"
        const aboutSection = document.getElementById('about')
        expect(aboutSection).toBeInTheDocument()
    })

    it('displays descriptive content about AI ecosystem', () => {
        render(<AboutSection />)
        
        expect(screen.getByText(/comprehensive AI ecosystem/i)).toBeInTheDocument()
        expect(screen.getByText(/intelligent banking solutions/i)).toBeInTheDocument()
        expect(screen.getByText(/advanced memory systems/i)).toBeInTheDocument()
    })
})
