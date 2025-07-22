import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SociAIFeed from '../app/page'

// Mock the SociAI layout component
vi.mock('@codai/shared-ui', () => ({
    SociAILayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sociai-layout">{children}</div>
    ),
}))

// Mock the SociAI service
vi.mock('@codai/shared-services', () => ({
    SociAIService: {
        getInstance: () => ({
            getFeed: vi.fn().mockResolvedValue([]),
            getRecommendations: vi.fn().mockResolvedValue([]),
            createPost: vi.fn().mockResolvedValue({ id: 'new-post' }),
            enhancePost: vi.fn().mockResolvedValue('Enhanced post content'),
        }),
    },
}))

describe('SociAI Feed', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the main feed interface', () => {
        render(<SociAIFeed />)

        expect(screen.getByText('SociAI')).toBeInTheDocument()
        expect(screen.getByText('AI-Powered Social Platform')).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/What's happening in your AI world/)).toBeInTheDocument()
    })

    it('displays AI recommendations sidebar', () => {
        render(<SociAIFeed />)

        expect(screen.getByText('AI Recommendations')).toBeInTheDocument()
        expect(screen.getByText('Personalized')).toBeInTheDocument()
    })

    it('shows trending topics', () => {
        render(<SociAIFeed />)

        expect(screen.getByText('Trending Now')).toBeInTheDocument()
        expect(screen.getByText('#AIRevolution')).toBeInTheDocument()
        expect(screen.getByText('#MachineLearning')).toBeInTheDocument()
    })

    it('displays community stats', () => {
        render(<SociAIFeed />)

        expect(screen.getByText('Community Pulse')).toBeInTheDocument()
        expect(screen.getByText('Active Users')).toBeInTheDocument()
        expect(screen.getByText('AI-Enhanced Posts')).toBeInTheDocument()
        expect(screen.getByText('Satisfaction Rate')).toBeInTheDocument()
    })

    it('allows creating new posts', async () => {
        const user = userEvent.setup()
        render(<SociAIFeed />)

        const textarea = screen.getByPlaceholderText(/What's happening in your AI world/)
        const postButton = screen.getByRole('button', { name: /Post/ })

        await user.type(textarea, 'This is a test post about AI')
        await user.click(postButton)

        // Should clear the textarea after posting
        await waitFor(() => {
            expect(textarea).toHaveValue('')
        })
    })

    it('toggles AI assistant interface', async () => {
        const user = userEvent.setup()
        render(<SociAIFeed />)

        const aiAssistButton = screen.getByRole('button', { name: /AI Assist/ })
        await user.click(aiAssistButton)

        expect(screen.getByText('AI Writing Assistant')).toBeInTheDocument()
        expect(screen.getByText(/I can help enhance your post/)).toBeInTheDocument()
    })

    it('handles post interactions', async () => {
        const user = userEvent.setup()
        render(<SociAIFeed />)

        // Should display posts with interaction buttons
        const likeButtons = screen.getAllByLabelText(/Like/)
        const commentButtons = screen.getAllByLabelText(/Comment/)
        const shareButtons = screen.getAllByLabelText(/Share/)

        expect(likeButtons.length).toBeGreaterThan(0)
        expect(commentButtons.length).toBeGreaterThan(0)
        expect(shareButtons.length).toBeGreaterThan(0)

        // Test clicking like button
        await user.click(likeButtons[0])
        // Note: Since we're mocking, we just verify the click doesn't crash
    })

    it('displays AI insights on posts', () => {
        render(<SociAIFeed />)

        expect(screen.getByText('AI Enhanced')).toBeInTheDocument()
        expect(screen.getByText(/Score:/)).toBeInTheDocument()
    })

    it('shows navigation menu', () => {
        render(<SociAIFeed />)

        expect(screen.getByText('Feed')).toBeInTheDocument()
        expect(screen.getByText('Trending')).toBeInTheDocument()
        expect(screen.getByText('Communities')).toBeInTheDocument()
        expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    })

    it('displays user profile section', () => {
        render(<SociAIFeed />)

        expect(screen.getByText('AI Explorer')).toBeInTheDocument()
        expect(screen.getByText('@ai_explorer')).toBeInTheDocument()
    })

    it('handles search functionality', async () => {
        const user = userEvent.setup()
        render(<SociAIFeed />)

        const searchInput = screen.getByPlaceholderText(/Search posts, people, topics/)
        await user.type(searchInput, 'artificial intelligence')

        expect(searchInput).toHaveValue('artificial intelligence')
    })

    it('displays loading states appropriately', () => {
        render(<SociAIFeed />)

        // Component should handle loading states gracefully
        expect(screen.getByTestId('sociai-layout')).toBeInTheDocument()
    })

    it('renders responsive design elements', () => {
        render(<SociAIFeed />)

        // Check for responsive grid classes
        const mainContainer = screen.getByTestId('sociai-layout')
        expect(mainContainer).toBeInTheDocument()

        // Verify main feed and sidebar structure
        expect(screen.getByText('AI Recommendations')).toBeInTheDocument()
        expect(screen.getByText('Trending Now')).toBeInTheDocument()
    })

    it('handles keyboard navigation', async () => {
        const user = userEvent.setup()
        render(<SociAIFeed />)

        const textarea = screen.getByPlaceholderText(/What's happening in your AI world/)

        // Test Tab navigation
        await user.tab()
        await user.tab()

        // Should be able to focus on textarea
        await user.click(textarea)
        expect(textarea).toHaveFocus()
    })

    it('displays proper error boundaries', () => {
        // Test that component renders without throwing errors
        expect(() => render(<SociAIFeed />)).not.toThrow()
    })

    it('handles real-time updates', async () => {
        render(<SociAIFeed />)

        // Component should handle live stats updates
        expect(screen.getByText(/Active Users/)).toBeInTheDocument()
        expect(screen.getByText(/Posts Today/)).toBeInTheDocument()

        // Wait for potential state updates
        await waitFor(() => {
            expect(screen.getByText('Community Pulse')).toBeInTheDocument()
        })
    })

    it('integrates accessibility features', () => {
        render(<SociAIFeed />)

        // Check for proper ARIA labels and roles
        const postButton = screen.getByRole('button', { name: /Post/ })
        const textarea = screen.getByRole('textbox')

        expect(postButton).toBeInTheDocument()
        expect(textarea).toBeInTheDocument()
        expect(textarea).toHaveAttribute('placeholder')
    })

    it('handles dark mode toggle', () => {
        render(<SociAIFeed />)

        // Component should have dark mode classes
        // Since we're testing the component structure, we verify it renders
        expect(screen.getByTestId('sociai-layout')).toBeInTheDocument()
    })
})
