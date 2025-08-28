import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { axe } from 'jest-axe'
import ProjectModal from '@/components/modals/ProjectModal'
import { ThemeProvider } from '@/contexts/ThemeContext'
import type { Project } from '@/data/projects'
import { Brain } from 'lucide-react'

// Mock project data
const mockProject: Project = {
    id: 'test-project',
    name: 'Test Project',
    description: 'A comprehensive test project for modal functionality',
    fullDescription: 'A comprehensive test project designed to validate modal functionality with full accessibility support and comprehensive feature testing.',
    tagline: 'Testing excellence through innovation',
    domain: 'test.codai.ro',
    category: 'Testing',
    tier: 1,
    status: 'production',
    launchDate: '2025',
    gradient: 'from-blue-500 to-purple-600',
    priority: 'high',
    accentColor: 'blue',
    icon: Brain,
    features: [
        'Advanced Testing: Comprehensive test coverage',
        'Modal System: Accessibility-first design',
        'Keyboard Navigation: Full keyboard support',
        'Screen Reader: ARIA compliance'
    ]
}

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    )
}

describe('ProjectModal', () => {
    const mockOnClose = vi.fn()

    beforeEach(() => {
        mockOnClose.mockClear()
    })

    it('should not render when closed', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={false} onClose={mockOnClose} />
        )

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when open', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    it('should display project information correctly', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getByText('Test Project')).toBeInTheDocument()
        expect(screen.getByText('test.codai.ro')).toBeInTheDocument()
        expect(screen.getByText('A comprehensive test project for modal functionality')).toBeInTheDocument()
        expect(screen.getByText('"Testing excellence through innovation"')).toBeInTheDocument()
    })

    it('should close when escape key is pressed', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        fireEvent.keyDown(document, { key: 'Escape' })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should close when close button is clicked', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        const closeButton = screen.getByLabelText('Close modal')
        fireEvent.click(closeButton)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should close when backdrop is clicked', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        const backdrop = screen.getByRole('dialog')
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not close when modal content is clicked', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        const modalTitle = screen.getByText('Test Project')
        fireEvent.click(modalTitle)
        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should display status badge correctly', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getByText('Production')).toBeInTheDocument()
    })

    it('should display tier information correctly', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getAllByText('Tier 1 - Foundation Services')).toHaveLength(2)
    })

    it('should display all project features', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getByText('Advanced Testing')).toBeInTheDocument()
        expect(screen.getByText('Modal System')).toBeInTheDocument()
        expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument()
        expect(screen.getByText('Screen Reader')).toBeInTheDocument()
    })

    it('should show production-specific buttons', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getByText('Learn More')).toBeInTheDocument()
        expect(screen.getByText('Try Now')).toBeInTheDocument()
    })

    it('should not show "Try Now" button for non-production projects', () => {
        const devProject = { ...mockProject, status: 'development' as const }

        renderWithTheme(
            <ProjectModal project={devProject} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getByText('Learn More')).toBeInTheDocument()
        expect(screen.queryByText('Try Now')).not.toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
        expect(dialog).toHaveAttribute('aria-describedby', 'modal-description')
    })

    it('should prevent body scroll when open', () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body scroll when closed', () => {
        const { rerender } = renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        rerender(
            <ThemeProvider>
                <ProjectModal project={mockProject} isOpen={false} onClose={mockOnClose} />
            </ThemeProvider>
        )

        expect(document.body.style.overflow).toBe('unset')
    })

    it('should focus close button when opened', async () => {
        renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        await waitFor(() => {
            const closeButton = screen.getByLabelText('Close modal')
            expect(closeButton).toHaveFocus()
        })
    })

    it.skip('should be accessible', async () => {
        const { container } = renderWithTheme(
            <ProjectModal project={mockProject} isOpen={true} onClose={mockOnClose} />
        )

        const results = await axe(container, {
            rules: {
                'color-contrast': { enabled: false } // Disable color contrast rule for this test
            }
        })
        expect(results.violations).toHaveLength(0)
    })

    it('should handle null project gracefully', () => {
        renderWithTheme(
            <ProjectModal project={null} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should display different tier information correctly', () => {
        const tier2Project: Project = { ...mockProject, tier: 2 }

        renderWithTheme(
            <ProjectModal project={tier2Project} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getAllByText('Tier 2 - New Generation')).toHaveLength(2)
    })

    it('should handle projects without tagline', () => {
        const projectWithoutTagline = { ...mockProject, tagline: undefined }

        renderWithTheme(
            <ProjectModal project={projectWithoutTagline} isOpen={true} onClose={mockOnClose} />
        )

        expect(screen.getByText('Test Project')).toBeInTheDocument()
        expect(screen.queryByText('"Testing excellence through innovation"')).not.toBeInTheDocument()
    })
})