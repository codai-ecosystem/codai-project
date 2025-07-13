import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import StocaiPage from '../app/page'

describe('STOCAI Integration Tests - Real Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders AI-Native Storage Service dashboard successfully', async () => {
    render(<StocaiPage />)

    // Check main branding and title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('StocAI')
    expect(screen.getByText('AI-Native Storage Service')).toBeInTheDocument()

    // Check main description
    expect(screen.getByText('The memory backbone of the CODAI ecosystem')).toBeInTheDocument()
    expect(screen.getByText(/Enterprise-grade file, dataset, and vector storage/)).toBeInTheDocument()

    // Check live status indicator
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('displays real storage metrics correctly', async () => {
    render(<StocaiPage />)

    // Wait for metrics to be displayed
    await waitFor(() => {
      // Check storage metrics values
      expect(screen.getByText('2.4TB')).toBeInTheDocument()
      expect(screen.getByText('847K')).toBeInTheDocument()
      expect(screen.getByText('1.2M')).toBeInTheDocument()
      expect(screen.getByText('95K/day')).toBeInTheDocument()

      // Check metric labels
      expect(screen.getByText('Storage Used')).toBeInTheDocument()
      expect(screen.getByText('Files Stored')).toBeInTheDocument()
      expect(screen.getByText('Vector Embeddings')).toBeInTheDocument()
      expect(screen.getByText('Search Queries')).toBeInTheDocument()

      // Check trend indicators
      expect(screen.getByText('+12.3%')).toBeInTheDocument()
      expect(screen.getByText('+18.7%')).toBeInTheDocument()
      expect(screen.getByText('+25.4%')).toBeInTheDocument()
      expect(screen.getByText('+8.9%')).toBeInTheDocument()
    })
  })

  it('handles tab navigation between sections', async () => {
    const user = userEvent.setup()
    render(<StocaiPage />)

    // Start with overview tab (default)
    expect(screen.getByText('The memory backbone of the CODAI ecosystem')).toBeInTheDocument()

    // Navigate to Features tab
    const featuresTab = screen.getByRole('button', { name: 'Features' })
    await user.click(featuresTab)

    await waitFor(() => {
      expect(screen.getByText('File Storage')).toBeInTheDocument()
      expect(screen.getByText('Vector Database')).toBeInTheDocument()
      expect(screen.getByText('Smart Search')).toBeInTheDocument()
    })

    // Navigate to Storage tab
    const storageTab = screen.getByRole('button', { name: 'Storage' })
    await user.click(storageTab)

    await waitFor(() => {
      expect(screen.getByText('Storage Management')).toBeInTheDocument()
      expect(screen.getByText(/Advanced storage analytics/)).toBeInTheDocument()
    })

    // Navigate to Settings tab
    const settingsTab = screen.getByRole('button', { name: 'Settings' })
    await user.click(settingsTab)

    await waitFor(() => {
      expect(screen.getByText('Settings Management')).toBeInTheDocument()
      expect(screen.getByText(/Configure your storage settings/)).toBeInTheDocument()
    })
  })

  it('displays feature cards with status indicators', async () => {
    const user = userEvent.setup()
    render(<StocaiPage />)

    // Navigate to features tab
    const featuresTab = screen.getByRole('button', { name: 'Features' })
    await user.click(featuresTab)

    await waitFor(() => {
      // Check core storage features
      expect(screen.getByText('File Storage')).toBeInTheDocument()
      expect(screen.getByText('Secure file storage with intelligent organization and tagging capabilities')).toBeInTheDocument()

      expect(screen.getByText('Vector Database')).toBeInTheDocument()
      expect(screen.getByText('Advanced vector storage for AI embeddings and semantic search')).toBeInTheDocument()

      expect(screen.getByText('Smart Search')).toBeInTheDocument()
      expect(screen.getByText('AI-powered content discovery with natural language queries')).toBeInTheDocument()

      expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
      expect(screen.getByText('RAG-ready knowledge management for AI agents and applications')).toBeInTheDocument()

      // Check status indicators
      expect(screen.getAllByText('active')).toHaveLength(4)
      expect(screen.getByText('beta')).toBeInTheDocument()
      expect(screen.getByText('coming soon')).toBeInTheDocument()

      // Check explore buttons
      const exploreButtons = screen.getAllByText('Explore')
      expect(exploreButtons).toHaveLength(6)
    })
  })

  it('shows real-time clock updates', async () => {
    render(<StocaiPage />)

    // Check that time is displayed in header
    await waitFor(() => {
      const timeElement = screen.getByText(/\d{1,2}:\d{2}:\d{2}/)
      expect(timeElement).toBeInTheDocument()
    })
  })

  it('synchronizes state across navigation', async () => {
    const user = userEvent.setup()
    render(<StocaiPage />)

    // Navigate through tabs sequentially and verify each one
    const tabs = ['Features', 'Storage', 'Settings', 'Overview']

    for (const tabName of tabs) {
      const tab = screen.getByRole('button', { name: tabName })
      await user.click(tab)

      // Wait for tab to become active and verify content
      await waitFor(() => {
        if (tabName === 'Features') {
          expect(screen.getByText('File Storage')).toBeInTheDocument()
        } else if (tabName === 'Storage') {
          expect(screen.getByText('Storage Management')).toBeInTheDocument()
        } else if (tabName === 'Settings') {
          expect(screen.getByText('Settings Management')).toBeInTheDocument()
        } else if (tabName === 'Overview') {
          expect(screen.getByText('The memory backbone of the CODAI ecosystem')).toBeInTheDocument()
        }
      })
    }

    // Verify we're back to overview with correct content
    expect(screen.getByText('The memory backbone of the CODAI ecosystem')).toBeInTheDocument()
  })

  it('handles multiple rapid operations', async () => {
    const user = userEvent.setup()
    render(<StocaiPage />)

    // Rapidly switch between tabs multiple times
    const tabs = ['Features', 'Storage', 'Settings', 'Overview']

    for (let i = 0; i < 3; i++) {
      for (const tabName of tabs) {
        const tab = screen.getByRole('button', { name: tabName })
        fireEvent.click(tab) // Use fireEvent for rapid clicking without waiting
      }
    }

    // Should still be functional
    await waitFor(() => {
      expect(screen.getByText('The memory backbone of the CODAI ecosystem')).toBeInTheDocument()
    })
  })

  it('displays enterprise storage capabilities', async () => {
    const user = userEvent.setup()
    render(<StocaiPage />)

    // Navigate to features to see enterprise capabilities
    const featuresTab = screen.getByRole('button', { name: 'Features' })
    await user.click(featuresTab)

    await waitFor(() => {
      // Check enterprise features
      expect(screen.getByText('Secure Vault')).toBeInTheDocument()
      expect(screen.getByText('Encrypted document storage with enterprise-grade security')).toBeInTheDocument()

      expect(screen.getByText('Auto Processing')).toBeInTheDocument()
      expect(screen.getByText('Automatic content summarization and metadata extraction')).toBeInTheDocument()
    })
  })

  it('measures component performance', async () => {
    const startTime = performance.now()

    render(<StocaiPage />)

    // Wait for key elements to be rendered
    await waitFor(() => {
      expect(screen.getByText('StocAI')).toBeInTheDocument()
      expect(screen.getByText('2.4TB')).toBeInTheDocument()
    })

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Component should render within reasonable time
    expect(renderTime).toBeLessThan(200)
  })
})