import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import ExplorerPage from '../app/page'

describe('Explorer Integration Tests', () => {
  test('renders Explorer application with correct branding', async () => {
    render(<ExplorerPage />)

    await waitFor(() => {
      expect(screen.getByText('Explorer')).toBeInTheDocument()
      expect(screen.getByText('Data Explorer')).toBeInTheDocument()
    })
  })

  test('displays main platform description', async () => {
    render(<ExplorerPage />)

    await waitFor(() => {
      expect(screen.getByText('Advanced data exploration and discovery platform with AI-powered insights')).toBeInTheDocument()
      expect(screen.getByText(/Experience the power of AI-driven technology/)).toBeInTheDocument()
    })
  })

  test('validates comprehensive metrics dashboard', async () => {
    render(<ExplorerPage />)

    await waitFor(() => {
      // Verify all 4 key metrics are displayed
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('12.4K')).toBeInTheDocument()
      expect(screen.getByText('+8.2%')).toBeInTheDocument()

      expect(screen.getByText('Performance')).toBeInTheDocument()
      expect(screen.getByText('98.5%')).toBeInTheDocument()
      expect(screen.getByText('+2.1%')).toBeInTheDocument()

      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()

      expect(screen.getByText('Satisfaction')).toBeInTheDocument()
      expect(screen.getByText('4.9/5')).toBeInTheDocument()
      expect(screen.getByText('+0.2')).toBeInTheDocument()
    })
  })

  test('verifies feature cards with detailed content', async () => {
    render(<ExplorerPage />)

    // Start on overview tab to see feature descriptions
    await waitFor(() => {
      // Check that we can navigate to features
      const featuresTab = screen.getByText('Features')
      fireEvent.click(featuresTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Data Discovery')).toBeInTheDocument()
      expect(screen.getByText('Advanced data discovery capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Exploration Tools')).toBeInTheDocument()
      expect(screen.getByText('Advanced exploration tools capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('AI Insights')).toBeInTheDocument()
      expect(screen.getByText('Advanced ai insights capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Visualization')).toBeInTheDocument()
      expect(screen.getByText('Advanced visualization capabilities with AI optimization')).toBeInTheDocument()
    })
  })

  test('validates comprehensive tab navigation system', async () => {
    render(<ExplorerPage />)

    await waitFor(() => {
      // Test all 4 tabs are present
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    // Test analytics tab navigation
    const analyticsTab = screen.getByText('Analytics')
    fireEvent.click(analyticsTab)

    await waitFor(() => {
      expect(screen.getByText('Analytics Panel')).toBeInTheDocument()
      expect(screen.getByText('Advanced analytics and insights for your platform usage and performance metrics.')).toBeInTheDocument()
    })

    // Test settings tab navigation
    const settingsTab = screen.getByText('Settings')
    fireEvent.click(settingsTab)

    await waitFor(() => {
      expect(screen.getByText('Settings Panel')).toBeInTheDocument()
      expect(screen.getByText('Configure your platform settings and preferences for optimal performance.')).toBeInTheDocument()
    })
  })

  test('confirms real-time clock and live status', async () => {
    render(<ExplorerPage />)

    await waitFor(() => {
      // Look for time display pattern (HH:MM:SS format)
      const timeElement = screen.getByText(/\d{1,2}:\d{2}:\d{2}/)
      expect(timeElement).toBeInTheDocument()

      // Verify live status indicator
      expect(screen.getByText('Live')).toBeInTheDocument()
    })
  })

  test('validates feature status indicators', async () => {
    render(<ExplorerPage />)

    // Navigate to features tab
    const featuresTab = screen.getByText('Features')
    fireEvent.click(featuresTab)

    await waitFor(() => {
      // All features should show 'active' status
      const activeStatuses = screen.getAllByText('active')
      expect(activeStatuses).toHaveLength(4) // All 4 features are active

      // Verify Learn More buttons
      const learnMoreButtons = screen.getAllByText('Learn More')
      expect(learnMoreButtons.length).toBeGreaterThan(0)
    })
  })

  test('verifies coming soon functionality for advanced panels', async () => {
    render(<ExplorerPage />)

    // Test analytics panel
    const analyticsTab = screen.getByText('Analytics')
    fireEvent.click(analyticsTab)

    await waitFor(() => {
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })

    // Test settings panel
    const settingsTab = screen.getByText('Settings')
    fireEvent.click(settingsTab)

    await waitFor(() => {
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })
  })
})