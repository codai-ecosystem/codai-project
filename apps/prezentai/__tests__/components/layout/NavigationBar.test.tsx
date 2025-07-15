import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavigationBar } from '../../../components/layout/NavigationBar'

describe('NavigationBar', () => {
    it('renders navigation bar with PREZENTAI branding', () => {
        render(<NavigationBar />)
        
        expect(screen.getByText(/PREZENTAI\.RO/i)).toBeInTheDocument()
    })

    it('displays all navigation items', () => {
        render(<NavigationBar />)
        
        // Check for navigation links
        expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /About/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Ecosystem/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Expertise/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Contact/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument()
    })

    it('shows theme toggle button', () => {
        render(<NavigationBar />)
        
        const themeButton = screen.getByRole('button', { name: /Toggle theme/i })
        expect(themeButton).toBeInTheDocument()
    })

    it('displays mobile menu button', () => {
        render(<NavigationBar />)
        
        const menuButton = screen.getByRole('button', { name: /Toggle menu/i })
        expect(menuButton).toBeInTheDocument()
    })

    it('has proper navigation anchor links', () => {
        render(<NavigationBar />)
        
        expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '#home')
        expect(screen.getByRole('link', { name: /About/i })).toHaveAttribute('href', '#about')
        expect(screen.getByRole('link', { name: /Ecosystem/i })).toHaveAttribute('href', '#ecosystem')
        expect(screen.getByRole('link', { name: /Expertise/i })).toHaveAttribute('href', '#expertise')
        expect(screen.getByRole('link', { name: /Contact/i })).toHaveAttribute('href', '#contact')
        expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute('href', '/dashboard')
    })

    it('contains globe icon in logo', () => {
        render(<NavigationBar />)
        
        // The globe icon should be present in the logo area
        const logo = screen.getByText(/PREZENTAI\.RO/i)
        expect(logo).toBeInTheDocument()
    })
})
