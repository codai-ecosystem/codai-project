import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import StudiaiPage from '../app/page'

describe('STUDIAI Integration Tests - Real Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders AI Learning Platform dashboard successfully', async () => {
    render(<StudiaiPage />)

    // Check main branding and title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('StudiAI')
    expect(screen.getByText('AI Learning Platform')).toBeInTheDocument()

    // Check main description
    expect(screen.getByText('Educational platform with AI-powered learning and assessment tools')).toBeInTheDocument()

    // Check live status indicator
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('displays real education metrics correctly', async () => {
    render(<StudiaiPage />)

    // Wait for metrics to be displayed
    await waitFor(() => {
      // Check education metrics values
      expect(screen.getByText('12.4K')).toBeInTheDocument()
      expect(screen.getByText('98.5%')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('4.9/5')).toBeInTheDocument()

      // Check metric labels
      expect(screen.getAllByText('Active Users')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Performance')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Features')[1]).toBeInTheDocument() // Use index 1 to get the metric, not the tab
      expect(screen.getAllByText('Satisfaction')[0]).toBeInTheDocument()

      // Check trend indicators
      expect(screen.getByText('+8.2%')).toBeInTheDocument()
      expect(screen.getByText('+2.1%')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('+0.2')).toBeInTheDocument()
    })
  })

  it('handles tab navigation between sections', async () => {
    const user = userEvent.setup()
    render(<StudiaiPage />)

    // Start with overview tab (default)
    expect(screen.getByText('Educational platform with AI-powered learning and assessment tools')).toBeInTheDocument()

    // Navigate to Features tab
    const featuresTab = screen.getByRole('button', { name: 'Features' })
    await user.click(featuresTab)

    await waitFor(() => {
      expect(screen.getByText('AI Tutoring')).toBeInTheDocument()
      expect(screen.getByText('Learning Analytics')).toBeInTheDocument()
      expect(screen.getByText('Assessment')).toBeInTheDocument()
      expect(screen.getByText('Progress Tracking')).toBeInTheDocument()
    })

    // Navigate to Analytics tab
    const analyticsTab = screen.getByRole('button', { name: 'Analytics' })
    await user.click(analyticsTab)

    await waitFor(() => {
      expect(screen.getByText('Analytics Panel')).toBeInTheDocument()
      expect(screen.getByText(/Advanced analytics and insights/)).toBeInTheDocument()
    })

    // Navigate to Settings tab
    const settingsTab = screen.getByRole('button', { name: 'Settings' })
    await user.click(settingsTab)

    await waitFor(() => {
      expect(screen.getByText('Settings Panel')).toBeInTheDocument()
      expect(screen.getByText(/Configure your platform settings/)).toBeInTheDocument()
    })
  })

  it('displays feature cards with education capabilities', async () => {
    const user = userEvent.setup()
    render(<StudiaiPage />)

    // Navigate to features tab
    const featuresTab = screen.getByRole('button', { name: 'Features' })
    await user.click(featuresTab)

    await waitFor(() => {
      // Check AI education features
      expect(screen.getByText('AI Tutoring')).toBeInTheDocument()
      expect(screen.getByText('Advanced ai tutoring capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Learning Analytics')).toBeInTheDocument()
      expect(screen.getByText('Advanced learning analytics capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Assessment')).toBeInTheDocument()
      expect(screen.getByText('Advanced assessment capabilities with AI optimization')).toBeInTheDocument()

      expect(screen.getByText('Progress Tracking')).toBeInTheDocument()
      expect(screen.getByText('Advanced progress tracking capabilities with AI optimization')).toBeInTheDocument()

      // Check status indicators (all should be active)
      expect(screen.getAllByText('active')).toHaveLength(4)

      // Check learn more buttons
      const learnMoreButtons = screen.getAllByText('Learn More')
      expect(learnMoreButtons).toHaveLength(4)
    })
  })

  it('shows LogAI education integration demo', async () => {
    render(<StudiaiPage />)

    // Check LogAI integration demo section
    expect(screen.getByText('🎓 LogAI Education Integration Live Demo')).toBeInTheDocument()
    expect(screen.getByText('Experience comprehensive education activity logging with AI-powered insights')).toBeInTheDocument()

    // Check education activity buttons
    expect(screen.getByText('Start Lesson')).toBeInTheDocument()
    expect(screen.getByText('Complete Test')).toBeInTheDocument()
    expect(screen.getByText('Track Progress')).toBeInTheDocument()
    expect(screen.getByText('AI Tutoring')).toBeInTheDocument()
    expect(screen.getByText('Collaborate')).toBeInTheDocument()

    // Check button descriptions
    expect(screen.getByText('Log learning activity')).toBeInTheDocument()
    expect(screen.getByText('Log assessment results')).toBeInTheDocument()
    expect(screen.getByText('Log student advancement')).toBeInTheDocument()
    expect(screen.getByText('Log AI interactions')).toBeInTheDocument()
    expect(screen.getByText('Log peer interactions')).toBeInTheDocument()
  })

  it('handles education activity simulations', async () => {
    const consoleSpy = vi.spyOn(console, 'log')
    const user = userEvent.setup()
    render(<StudiaiPage />)

    // Test Start Lesson button
    const startLessonBtn = screen.getByText('Start Lesson')
    await user.click(startLessonBtn)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('StudiAI: Lesson start logged successfully', expect.objectContaining({
        studentId: 'demo_student_001',
        courseId: 'course_math_101'
      }))
    })

    // Test Complete Test button
    const completeTestBtn = screen.getByText('Complete Test')
    await user.click(completeTestBtn)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('StudiAI: Assessment completion logged successfully', expect.objectContaining({
        studentId: 'demo_student_001'
      }))
    })

    // Test AI Tutoring button
    const aiTutoringBtn = screen.getByText('AI Tutoring')
    await user.click(aiTutoringBtn)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('StudiAI: AI tutoring interaction logged successfully', expect.objectContaining({
        studentId: 'demo_student_001',
        tutorData: expect.objectContaining({
          query: 'Help me understand quadratic equations',
          response: 'A quadratic equation is a polynomial equation of degree 2...'
        })
      }))
    })

    consoleSpy.mockRestore()
  })

  it('shows real-time clock updates', async () => {
    render(<StudiaiPage />)

    // Check that time is displayed in header
    await waitFor(() => {
      const timeElement = screen.getByText(/\d{1,2}:\d{2}:\d{2}/)
      expect(timeElement).toBeInTheDocument()
    })
  })

  it('synchronizes state across navigation', async () => {
    const user = userEvent.setup()
    render(<StudiaiPage />)

    // Navigate through tabs sequentially and verify content
    const tabs = ['Features', 'Analytics', 'Settings', 'Overview']

    for (const tabName of tabs) {
      const tab = screen.getByRole('button', { name: tabName })
      await user.click(tab)

      // Wait for tab content to load and verify appropriate content
      await waitFor(() => {
        if (tabName === 'Features') {
          expect(screen.getByText('AI Tutoring')).toBeInTheDocument()
        } else if (tabName === 'Analytics') {
          expect(screen.getByText('Analytics Panel')).toBeInTheDocument()
        } else if (tabName === 'Settings') {
          expect(screen.getByText('Settings Panel')).toBeInTheDocument()
        } else if (tabName === 'Overview') {
          expect(screen.getByText('Educational platform with AI-powered learning and assessment tools')).toBeInTheDocument()
        }
      })
    }

    // Verify we're back to overview with LogAI demo
    expect(screen.getByText('🎓 LogAI Education Integration Live Demo')).toBeInTheDocument()
  })

  it('handles multiple rapid education interactions', async () => {
    const user = userEvent.setup()
    render(<StudiaiPage />)

    // Rapidly click multiple education activity buttons
    const buttons = [
      'Start Lesson',
      'Complete Test',
      'Track Progress',
      'AI Tutoring',
      'Collaborate'
    ]

    for (const buttonText of buttons) {
      const button = screen.getByText(buttonText)
      fireEvent.click(button) // Use fireEvent for rapid clicking
    }

    // Should still be functional
    await waitFor(() => {
      expect(screen.getByText('🎓 LogAI Education Integration Live Demo')).toBeInTheDocument()
    })
  })

  it('displays comprehensive education platform features', async () => {
    const user = userEvent.setup()
    render(<StudiaiPage />)

    // Navigate to features to see all education capabilities
    const featuresTab = screen.getByRole('button', { name: 'Features' })
    await user.click(featuresTab)

    await waitFor(() => {
      // Verify all education features are displayed
      const featureElements = [
        'AI Tutoring',
        'Learning Analytics',
        'Assessment',
        'Progress Tracking'
      ]

      featureElements.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
    })
  })

  it('measures component performance', async () => {
    const startTime = performance.now()

    render(<StudiaiPage />)

    // Wait for key elements to be rendered
    await waitFor(() => {
      expect(screen.getByText('StudiAI')).toBeInTheDocument()
      expect(screen.getByText('12.4K')).toBeInTheDocument()
    })

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Component should render within reasonable time
    expect(renderTime).toBeLessThan(200)
  })
})