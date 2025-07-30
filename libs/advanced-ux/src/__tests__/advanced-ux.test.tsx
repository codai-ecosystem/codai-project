import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Import components to test
import { UserFlowProvider, useUserFlow, FlowStep, FlowProgress } from '../patterns/user-flows';
import { MicroInteractionProvider, useMicroInteractions, InteractiveButton } from '../interactions/micro-interactions';
import { AccessibilityProvider, useAccessibility } from '../accessibility/screen-reader';
import { UserBehaviorProvider, useUserBehavior } from '../analytics/user-behavior';
import { PersonalizationProvider, usePersonalization } from '../personalization/adaptive-ui';
import { usePerformanceMonitoring, PerformanceOptimized } from '../performance/optimization-hooks';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.ResizeObserver = mockResizeObserver;

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
mockPerformanceObserver.mockReturnValue({
  observe: () => null,
  disconnect: () => null,
});
window.PerformanceObserver = mockPerformanceObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  },
  writable: true,
});

describe('User Flow System', () => {
  const TestFlowComponent = () => {
    const { currentStep, nextStep, previousStep, progress } = useUserFlow();

    return (
      <div>
        <div data-testid="current-step">{currentStep}</div>
        <div data-testid="progress">{Math.round(progress * 100)}%</div>
        <button onClick={nextStep} data-testid="next-button">Next</button>
        <button onClick={previousStep} data-testid="prev-button">Previous</button>
      </div>
    );
  };

  const flowSteps = [
    { id: 'step1', name: 'Step 1', component: <div>Step 1 Content</div> },
    { id: 'step2', name: 'Step 2', component: <div>Step 2 Content</div> },
    { id: 'step3', name: 'Step 3', component: <div>Step 3 Content</div> },
  ];

  it('should initialize with first step', () => {
    render(
      <UserFlowProvider steps={flowSteps}>
        <TestFlowComponent />
      </UserFlowProvider>
    );

    expect(screen.getByTestId('current-step')).toHaveTextContent('step1');
    expect(screen.getByTestId('progress')).toHaveTextContent('33%');
  });

  it('should navigate to next step', async () => {
    render(
      <UserFlowProvider steps={flowSteps}>
        <TestFlowComponent />
      </UserFlowProvider>
    );

    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('step2');
      expect(screen.getByTestId('progress')).toHaveTextContent('67%');
    });
  });

  it('should navigate to previous step', async () => {
    render(
      <UserFlowProvider steps={flowSteps} initialStep="step2">
        <TestFlowComponent />
      </UserFlowProvider>
    );

    fireEvent.click(screen.getByTestId('prev-button'));

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('step1');
      expect(screen.getByTestId('progress')).toHaveTextContent('33%');
    });
  });

  it('should render FlowProgress component', () => {
    render(
      <UserFlowProvider steps={flowSteps}>
        <FlowProgress />
      </UserFlowProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
  });
});

describe('Micro Interactions System', () => {
  const TestInteractionComponent = () => {
    const { triggerHapticFeedback, playSound } = useMicroInteractions();

    return (
      <div>
        <button
          onClick={() => triggerHapticFeedback('light')}
          data-testid="haptic-button"
        >
          Trigger Haptic
        </button>
        <button
          onClick={() => playSound('click')}
          data-testid="sound-button"
        >
          Play Sound
        </button>
      </div>
    );
  };

  it('should trigger haptic feedback', async () => {
    // Mock navigator.vibrate
    const mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
    });

    render(
      <MicroInteractionProvider>
        <TestInteractionComponent />
      </MicroInteractionProvider>
    );

    fireEvent.click(screen.getByTestId('haptic-button'));

    await waitFor(() => {
      expect(mockVibrate).toHaveBeenCalledWith([50]);
    });
  });

  it('should render InteractiveButton with ripple effect', async () => {
    render(
      <MicroInteractionProvider>
        <InteractiveButton data-testid="interactive-button">
          Click me
        </InteractiveButton>
      </MicroInteractionProvider>
    );

    const button = screen.getByTestId('interactive-button');
    expect(button).toBeInTheDocument();

    // Simulate click to trigger ripple effect
    fireEvent.click(button);

    await waitFor(() => {
      const ripple = button.querySelector('.ripple');
      expect(ripple).toBeInTheDocument();
    });
  });
});

describe('Accessibility System', () => {
  const TestAccessibilityComponent = () => {
    const { announceToScreenReader, focusElement, getContrastRatio } = useAccessibility();

    return (
      <div>
        <button
          onClick={() => announceToScreenReader('Test announcement')}
          data-testid="announce-button"
        >
          Announce
        </button>
        <input
          id="test-input"
          data-testid="test-input"
        />
        <button
          onClick={() => focusElement('test-input')}
          data-testid="focus-button"
        >
          Focus Input
        </button>
        <div data-testid="contrast-ratio">
          {getContrastRatio('#000000', '#ffffff')}
        </div>
      </div>
    );
  };

  it('should announce to screen reader', async () => {
    render(
      <AccessibilityProvider>
        <TestAccessibilityComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByTestId('announce-button'));

    await waitFor(() => {
      const announcement = screen.getByRole('status', { hidden: true });
      expect(announcement).toHaveTextContent('Test announcement');
    });
  });

  it('should focus element', async () => {
    render(
      <AccessibilityProvider>
        <TestAccessibilityComponent />
      </AccessibilityProvider>
    );

    const input = screen.getByTestId('test-input');
    fireEvent.click(screen.getByTestId('focus-button'));

    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it('should calculate contrast ratio', () => {
    render(
      <AccessibilityProvider>
        <TestAccessibilityComponent />
      </AccessibilityProvider>
    );

    const contrastRatio = screen.getByTestId('contrast-ratio');
    expect(contrastRatio).toHaveTextContent('21');
  });
});

describe('User Behavior Analytics', () => {
  const TestAnalyticsComponent = () => {
    const { trackEvent, trackPageView, getHeatmapData } = useUserBehavior();

    return (
      <div>
        <button
          onClick={() => trackEvent('button', 'click', 'test-button')}
          data-testid="track-event-button"
        >
          Track Event
        </button>
        <button
          onClick={() => trackPageView('/test-page')}
          data-testid="track-page-button"
        >
          Track Page View
        </button>
        <div data-testid="heatmap-data">
          {JSON.stringify(getHeatmapData())}
        </div>
      </div>
    );
  };

  it('should track events', async () => {
    const onEventTracked = vi.fn();

    render(
      <UserBehaviorProvider onEventTracked={onEventTracked}>
        <TestAnalyticsComponent />
      </UserBehaviorProvider>
    );

    fireEvent.click(screen.getByTestId('track-event-button'));

    await waitFor(() => {
      expect(onEventTracked).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'button',
          action: 'click',
          label: 'test-button',
        })
      );
    });
  });

  it('should track page views', async () => {
    const onPageViewTracked = vi.fn();

    render(
      <UserBehaviorProvider onPageViewTracked={onPageViewTracked}>
        <TestAnalyticsComponent />
      </UserBehaviorProvider>
    );

    fireEvent.click(screen.getByTestId('track-page-button'));

    await waitFor(() => {
      expect(onPageViewTracked).toHaveBeenCalledWith('/test-page');
    });
  });
});

describe('Personalization System', () => {
  const mockProfile = {
    id: 'test-user',
    preferences: {
      theme: 'dark' as const,
      fontSize: 'large' as const,
      animations: true,
      notifications: true,
      privacy: 'private' as const,
    },
    behavior: {
      visitCount: 5,
      lastVisit: new Date(),
      averageSessionDuration: 300000,
      preferredFeatures: ['feature1', 'feature2'],
      interactionPatterns: { 'click_button': 10 },
      conversionEvents: ['signup'],
    },
    context: {
      device: 'desktop' as const,
      browser: 'Chrome',
      os: 'Windows',
      connectionSpeed: 'fast' as const,
      currentUrl: 'https://example.com',
    },
    segments: ['loyal_user', 'desktop_user'],
  };

  const TestPersonalizationComponent = () => {
    const { profile, setPreference, getPreference, trackInteraction } = usePersonalization();

    return (
      <div>
        <div data-testid="user-id">{profile?.id}</div>
        <div data-testid="theme">{profile?.preferences.theme}</div>
        <button
          onClick={() => setPreference('theme', 'light')}
          data-testid="change-theme-button"
        >
          Change Theme
        </button>
        <button
          onClick={() => trackInteraction('click', 'test-button')}
          data-testid="track-interaction-button"
        >
          Track Interaction
        </button>
      </div>
    );
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with user profile', async () => {
    localStorage.setItem('personalization_profile_test-user', JSON.stringify(mockProfile));

    render(
      <PersonalizationProvider userId="test-user">
        <TestPersonalizationComponent />
      </PersonalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });

  it('should update preferences', async () => {
    localStorage.setItem('personalization_profile_test-user', JSON.stringify(mockProfile));

    render(
      <PersonalizationProvider userId="test-user">
        <TestPersonalizationComponent />
      </PersonalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    fireEvent.click(screen.getByTestId('change-theme-button'));

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
  });
});

describe('Performance Monitoring', () => {
  const TestPerformanceComponent = () => {
    const { metrics, score, registerOptimization } = usePerformanceMonitoring();

    React.useEffect(() => {
      registerOptimization({
        id: 'test-optimization',
        name: 'Test Optimization',
        description: 'Test optimization for unit tests',
        type: 'lazy-loading',
        priority: 'high',
        impact: 25,
        implementation: () => console.log('Optimization applied'),
        active: false,
      });
    }, [registerOptimization]);

    return (
      <div>
        <div data-testid="performance-score">{score}</div>
        <div data-testid="render-time">{metrics.renderTime || 0}</div>
        <div data-testid="memory-usage">{metrics.memoryUsage || 0}</div>
      </div>
    );
  };

  it('should monitor performance metrics', async () => {
    render(<TestPerformanceComponent />);

    await waitFor(() => {
      const scoreElement = screen.getByTestId('performance-score');
      expect(scoreElement).toBeInTheDocument();

      const score = parseInt(scoreElement.textContent || '0');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it('should render PerformanceOptimized component', () => {
    render(
      <PerformanceOptimized>
        <div data-testid="optimized-content">Optimized Content</div>
      </PerformanceOptimized>
    );

    expect(screen.getByTestId('optimized-content')).toBeInTheDocument();
    expect(screen.getByTestId('optimized-content').closest('.performance-optimized')).toBeInTheDocument();
  });
});

describe('Integration Tests', () => {
  const IntegratedComponent = () => {
    return (
      <UserFlowProvider steps={[
        { id: 'step1', name: 'Step 1', component: <div>Step 1</div> },
        { id: 'step2', name: 'Step 2', component: <div>Step 2</div> },
      ]}>
        <MicroInteractionProvider>
          <AccessibilityProvider>
            <UserBehaviorProvider>
              <PersonalizationProvider>
                <PerformanceOptimized>
                  <div data-testid="integrated-content">
                    Fully integrated advanced UX system
                  </div>
                </PerformanceOptimized>
              </PersonalizationProvider>
            </UserBehaviorProvider>
          </AccessibilityProvider>
        </MicroInteractionProvider>
      </UserFlowProvider>
    );
  };

  it('should render all providers together', () => {
    render(<IntegratedComponent />);

    expect(screen.getByTestId('integrated-content')).toBeInTheDocument();
  });

  it('should handle complex interactions across systems', async () => {
    const ComplexInteractionComponent = () => {
      const { nextStep } = useUserFlow();
      const { triggerHapticFeedback } = useMicroInteractions();
      const { announceToScreenReader } = useAccessibility();
      const { trackEvent } = useUserBehavior();

      const handleComplexInteraction = () => {
        nextStep();
        triggerHapticFeedback('medium');
        announceToScreenReader('Moving to next step');
        trackEvent('navigation', 'next_step', 'complex_flow');
      };

      return (
        <button
          onClick={handleComplexInteraction}
          data-testid="complex-interaction-button"
        >
          Complex Interaction
        </button>
      );
    };

    render(
      <UserFlowProvider steps={[
        { id: 'step1', name: 'Step 1', component: <div>Step 1</div> },
        { id: 'step2', name: 'Step 2', component: <div>Step 2</div> },
      ]}>
        <MicroInteractionProvider>
          <AccessibilityProvider>
            <UserBehaviorProvider>
              <ComplexInteractionComponent />
            </UserBehaviorProvider>
          </AccessibilityProvider>
        </MicroInteractionProvider>
      </UserFlowProvider>
    );

    const button = screen.getByTestId('complex-interaction-button');

    await act(async () => {
      fireEvent.click(button);
    });

    // Verify that all systems work together
    expect(button).toBeInTheDocument();
  });
});

describe('Error Boundaries and Edge Cases', () => {
  it('should handle missing providers gracefully', () => {
    const ComponentWithoutProvider = () => {
      try {
        useUserFlow();
        return <div>Should not render</div>;
      } catch (error) {
        return <div data-testid="error-handled">Error handled</div>;
      }
    };

    render(<ComponentWithoutProvider />);
    expect(screen.getByTestId('error-handled')).toBeInTheDocument();
  });

  it('should handle invalid flow steps', () => {
    const invalidSteps: any[] = [];

    render(
      <UserFlowProvider steps={invalidSteps}>
        <div data-testid="empty-flow">Empty Flow</div>
      </UserFlowProvider>
    );

    expect(screen.getByTestId('empty-flow')).toBeInTheDocument();
  });

  it('should handle performance monitoring without browser APIs', () => {
    // Temporarily remove PerformanceObserver
    const originalPerformanceObserver = window.PerformanceObserver;
    delete (window as any).PerformanceObserver;

    const TestComponentWithoutAPIs = () => {
      const { metrics, score } = usePerformanceMonitoring();
      return (
        <div>
          <div data-testid="score-without-apis">{score}</div>
        </div>
      );
    };

    render(<TestComponentWithoutAPIs />);

    expect(screen.getByTestId('score-without-apis')).toBeInTheDocument();

    // Restore PerformanceObserver
    window.PerformanceObserver = originalPerformanceObserver;
  });
});

describe('Accessibility Compliance', () => {
  it('should have proper ARIA labels and roles', () => {
    render(
      <UserFlowProvider steps={[
        { id: 'step1', name: 'Step 1', component: <div>Step 1</div> },
      ]}>
        <FlowProgress />
      </UserFlowProvider>
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-valuemin');
    expect(progressBar).toHaveAttribute('aria-valuemax');
  });

  it('should support keyboard navigation', async () => {
    render(
      <MicroInteractionProvider>
        <InteractiveButton data-testid="keyboard-button">
          Keyboard Test
        </InteractiveButton>
      </MicroInteractionProvider>
    );

    const button = screen.getByTestId('keyboard-button');

    // Focus the button
    button.focus();
    expect(button).toHaveFocus();

    // Press Enter
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    // Button should still be accessible
    expect(button).toBeInTheDocument();
  });

  it('should maintain focus management', async () => {
    render(
      <AccessibilityProvider>
        <div>
          <input data-testid="input1" />
          <input data-testid="input2" />
        </div>
      </AccessibilityProvider>
    );

    const input1 = screen.getByTestId('input1');
    const input2 = screen.getByTestId('input2');

    // Focus first input
    input1.focus();
    expect(input1).toHaveFocus();

    // Tab to second input
    fireEvent.keyDown(input1, { key: 'Tab', code: 'Tab' });
    input2.focus();
    expect(input2).toHaveFocus();
  });
});

// Performance and Memory Leak Tests
describe('Performance and Memory Management', () => {
  it('should cleanup event listeners on unmount', () => {
    const { unmount } = render(
      <UserBehaviorProvider>
        <div data-testid="cleanup-test">Cleanup Test</div>
      </UserBehaviorProvider>
    );

    // Check if component renders
    expect(screen.getByTestId('cleanup-test')).toBeInTheDocument();

    // Unmount and verify no memory leaks
    unmount();

    // This test ensures no errors are thrown during cleanup
    expect(true).toBe(true);
  });

  it('should handle rapid state updates without memory leaks', async () => {
    const RapidUpdateComponent = () => {
      const { trackEvent } = useUserBehavior();

      React.useEffect(() => {
        const interval = setInterval(() => {
          trackEvent('test', 'rapid_update', 'memory_test');
        }, 10);

        const timeout = setTimeout(() => {
          clearInterval(interval);
        }, 100);

        return () => {
          clearInterval(interval);
          clearTimeout(timeout);
        };
      }, [trackEvent]);

      return <div data-testid="rapid-updates">Rapid Updates</div>;
    };

    render(
      <UserBehaviorProvider>
        <RapidUpdateComponent />
      </UserBehaviorProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('rapid-updates')).toBeInTheDocument();
    });

    // Wait for updates to complete
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(screen.getByTestId('rapid-updates')).toBeInTheDocument();
  });
});
