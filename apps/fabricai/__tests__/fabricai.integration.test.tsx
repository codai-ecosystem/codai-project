import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import FabricAIPage from '../app/page'

describe('FabricAI Integration Tests', () => {
  test('renders FabricAI application with correct branding', async () => {
    render(<FabricAIPage />)

    await waitFor(() => {
      expect(screen.getByText('FabricAI')).toBeInTheDocument()
      expect(screen.getByText('AI Development Platform')).toBeInTheDocument()
    })
  })

  test('displays main platform description', async () => {
    render(<FabricAIPage />)

    await waitFor(() => {
      expect(screen.getByText('Advanced AI development platform for building and deploying AI models')).toBeInTheDocument()
      expect(screen.getByText(/Experience the power of AI-driven technology/)).toBeInTheDocument()
    })
  })

  test('validates comprehensive metrics dashboard', async () => {
    render(<FabricAIPage />)

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

  test('verifies AI development feature cards', async () => {
    render(<FabricAIPage />)

    // Navigate to features tab using getAllByText to avoid conflicts
    await waitFor(() => {
      const featureButtons = screen.getAllByText('Features')
      const featuresTab = featureButtons.find(button =>
        button.tagName === 'BUTTON' && button.className.includes('px-6 py-3')
      )
      if (featuresTab) {
        fireEvent.click(featuresTab)
      }
    })

    await waitFor(() => {
      expect(screen.getByText('Model Training')).toBeInTheDocument()
      expect(screen.getByText('Advanced model training capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Code Generation')).toBeInTheDocument()
      expect(screen.getByText('Advanced code generation capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Templates')).toBeInTheDocument()
      expect(screen.getByText('Advanced templates capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Advanced analytics capabilities with AI optimization')).toBeInTheDocument()
    })
  })

  test('validates comprehensive tab navigation system', async () => {
    render(<FabricAIPage />)

    await waitFor(() => {
      // Test all 4 tabs are present
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getAllByText('Features')[0]).toBeInTheDocument() // Use first occurrence
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
    render(<FabricAIPage />)

    await waitFor(() => {
      // Look for time display pattern (HH:MM:SS format)
      const timeElement = screen.getByText(/\d{1,2}:\d{2}:\d{2}/)
      expect(timeElement).toBeInTheDocument()

      // Verify live status indicator
      expect(screen.getByText('Live')).toBeInTheDocument()
    })
  })

  test('validates AI development feature status indicators', async () => {
    render(<FabricAIPage />)

    // Navigate to features tab using more specific selector
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const featuresTab = buttons.find(button =>
        button.textContent === 'Features' && button.className.includes('px-6 py-3')
      )
      if (featuresTab) {
        fireEvent.click(featuresTab)
      }
    })

    await waitFor(() => {
      // All features should show 'active' status
      const activeStatuses = screen.getAllByText('active')
      expect(activeStatuses).toHaveLength(4) // All 4 AI development features are active

      // Verify Learn More buttons for AI features
      const learnMoreButtons = screen.getAllByText('Learn More')
      expect(learnMoreButtons.length).toBeGreaterThan(0)
    })
  })

  test('verifies coming soon functionality for advanced panels', async () => {
    render(<FabricAIPage />)

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

  test('validates AI development platform branding and theme', async () => {
    render(<FabricAIPage />)

    await waitFor(() => {
      // Verify purple-themed branding for AI development
      expect(screen.getByText('FabricAI')).toBeInTheDocument()
      expect(screen.getByText('AI Development Platform')).toBeInTheDocument()

      // Verify specific AI development features are mentioned
      expect(screen.getByText('Advanced AI development platform for building and deploying AI models')).toBeInTheDocument()
    })
  })
})