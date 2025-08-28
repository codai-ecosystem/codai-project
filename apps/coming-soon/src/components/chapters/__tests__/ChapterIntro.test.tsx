import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChapterIntro } from '../ChapterIntro';
import { TestProviders, mockChapterProps } from '../../../__tests__/utils/test-providers';
import { axe } from 'jest-axe';

// Mock libraries and setup

// Mock GSAP
const mockTimeline = {
  to: vi.fn().mockReturnThis(),
  fromTo: vi.fn().mockReturnThis(),
  kill: vi.fn()
};

const mockScrollTrigger = {
  create: vi.fn().mockReturnValue({ kill: vi.fn() }),
  kill: vi.fn()
};

vi.mock('gsap', () => ({
  gsap: {
    context: vi.fn((fn) => {
      fn();
      return { revert: vi.fn() };
    }),
    timeline: vi.fn(() => mockTimeline),
    to: vi.fn().mockReturnThis(),
    registerPlugin: vi.fn()
  }
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: mockScrollTrigger
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  })
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback
  })
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    mark: vi.fn(),
    measure: vi.fn(),
    clearMeasures: vi.fn()
  },
  writable: true
});

describe('ChapterIntro', () => {
  const mockOnTransition = vi.fn();
  const user = userEvent.setup();

  const defaultProps = {
    ...mockChapterProps,
    onTransition: mockOnTransition,
    'data-testid': 'chapter-intro'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset document properties
    document.documentElement.style.removeProperty('--intro-progress');
    document.documentElement.style.removeProperty('--intro-scroll-progress');
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderComponent = (props = {}) => {
    return render(
      <TestProviders>
        <ChapterIntro {...defaultProps} {...props} />
      </TestProviders>
    );
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();
      expect(screen.getByTestId('chapter-intro')).toBeInTheDocument();
    });

    it('renders all text content', () => {
      renderComponent();
      
      expect(screen.getByText('In 2025, while others built features...')).toBeInTheDocument();
      expect(screen.getByText('we built the future.')).toBeInTheDocument();
      expect(screen.getByText('Welcome to CODAI - not just an AI company,')).toBeInTheDocument();
      expect(screen.getByText('but an entire ecosystem of intelligence.')).toBeInTheDocument();
    });

    it('renders statistics counter', () => {
      renderComponent();
      
      expect(screen.getByText('47')).toBeInTheDocument();
      expect(screen.getByText('applications')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('tiers')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('vision')).toBeInTheDocument();
    });

    it('renders CTA button', () => {
      renderComponent();
      
      const ctaButton = screen.getByRole('button', { name: /explore the ecosystem/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('data-testid', 'intro-cta-button');
    });

    it('renders logo elements', () => {
      renderComponent();
      
      expect(screen.getByLabelText('CODAI Logo')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet accessibility standards', async () => {
      const { container } = renderComponent();
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('has proper ARIA attributes', () => {
      renderComponent();
      
      const section = screen.getByTestId('chapter-intro');
      expect(section).toHaveAttribute('role', 'banner');
      expect(section).toHaveAttribute('aria-label', 'CODAI Introduction');
      expect(section).toHaveAttribute('aria-describedby', 'intro-description');
    });

    it('has screen reader description', () => {
      renderComponent();
      
      const description = document.getElementById('intro-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
    });

    it('has proper focus management', async () => {
      renderComponent();
      
      const section = screen.getByTestId('chapter-intro');
      expect(section).toHaveAttribute('tabIndex', '0');
      
      // Focus the section
      act(() => {
        section.focus();
      });
      
      expect(section).toHaveFocus();
    });

    it('supports keyboard navigation', async () => {
      renderComponent();
      
      const section = screen.getByTestId('chapter-intro');
      act(() => {
        section.focus();
      });
      
      // Tab navigation should work
      await user.keyboard('{Tab}');
      // Note: In a real environment, this would navigate to focusable elements
    });

    it('handles Escape key to transition', async () => {
      renderComponent();
      
      const section = screen.getByTestId('chapter-intro');
      act(() => {
        section.focus();
      });
      
      await user.keyboard('{Escape}');
      expect(mockOnTransition).toHaveBeenCalledWith('foundation');
    });
  });

  describe('Interactions', () => {
    it('calls onTransition when CTA button is clicked', async () => {
      renderComponent();
      
      const ctaButton = screen.getByTestId('intro-cta-button');
      await user.click(ctaButton);
      
      // Wait for animation delay
      act(() => {
        vi.advanceTimersByTime(700);
      });
      
      await waitFor(() => {
        expect(mockOnTransition).toHaveBeenCalledWith('foundation');
      });
    });

    it('handles Enter key on CTA button', async () => {
      renderComponent();
      
      const ctaButton = screen.getByTestId('intro-cta-button');
      act(() => {
        ctaButton.focus();
      });
      
      await user.keyboard('{Enter}');
      
      act(() => {
        vi.advanceTimersByTime(700);
      });
      
      await waitFor(() => {
        expect(mockOnTransition).toHaveBeenCalledWith('foundation');
      });
    });

    it('handles Space key on CTA button', async () => {
      renderComponent();
      
      const ctaButton = screen.getByTestId('intro-cta-button');
      act(() => {
        ctaButton.focus();
      });
      
      await user.keyboard(' ');
      
      act(() => {
        vi.advanceTimersByTime(700);
      });
      
      await waitFor(() => {
        expect(mockOnTransition).toHaveBeenCalledWith('foundation');
      });
    });
  });

  describe('Animations', () => {
    it('initializes GSAP timeline when not reduced motion', () => {
      renderComponent();
      
      expect(mockTimeline.to).toHaveBeenCalled();
      expect(mockTimeline.fromTo).toHaveBeenCalled();
    });

    it('creates ScrollTrigger when not reduced motion', () => {
      renderComponent();
      
      expect(mockScrollTrigger.create).toHaveBeenCalled();
    });

    it('sets CSS progress properties during animation', () => {
      renderComponent();
      
      // Simulate ScrollTrigger progress update
      const scrollTriggerCall = mockScrollTrigger.create.mock.calls[0][0];
      if (scrollTriggerCall.onUpdate) {
        scrollTriggerCall.onUpdate({ progress: 0.5 });
      }
      
      expect(document.documentElement.style.getPropertyValue('--intro-scroll-progress')).toBe('0.5');
    });

    it('cleans up animations on unmount', () => {
      const { unmount } = renderComponent();
      
      unmount();
      
      expect(mockTimeline.kill).toHaveBeenCalled();
    });
  });

  describe('Reduced Motion', () => {
    beforeEach(() => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    it('renders static logo when reduced motion is preferred', () => {
      // Need to render with reduced motion context
      render(
        <TestProviders motionPreference="disabled">
          <ChapterIntro {...defaultProps} />
        </TestProviders>
      );
      
      const staticLogo = screen.getByText('CODAI');
      expect(staticLogo.parentElement).toHaveClass('logo-static');
    });

    it('does not initialize animations when reduced motion', () => {
      render(
        <TestProviders motionPreference="disabled">
          <ChapterIntro {...defaultProps} />
        </TestProviders>
      );
      
      // Should not create complex animations
      expect(mockTimeline.to).not.toHaveBeenCalled();
    });

    it('shows all content immediately when reduced motion', () => {
      render(
        <TestProviders motionPreference="disabled">
          <ChapterIntro {...defaultProps} />
        </TestProviders>
      );
      
      const textElements = screen.getAllByText(/In 2025|we built|Welcome to|but an entire/);
      textElements.forEach(element => {
        expect(element).toHaveClass(/opacity-100/);
      });
    });
  });

  describe('Performance', () => {
    it('marks performance timing on initialization', () => {
      renderComponent();
      
      expect(window.performance.mark).toHaveBeenCalledWith('intro-chapter-start');
      expect(window.performance.mark).toHaveBeenCalledWith('intro-chapter-end');
      expect(window.performance.measure).toHaveBeenCalledWith(
        'intro-chapter-render',
        'intro-chapter-start',
        'intro-chapter-end'
      );
    });

    it('clears performance measures on cleanup', () => {
      const { unmount } = renderComponent();
      
      unmount();
      
      expect(window.performance.clearMeasures).toHaveBeenCalledWith('intro-chapter-render');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive text classes', () => {
      renderComponent();
      
      const text1 = screen.getByText('In 2025, while others built features...');
      expect(text1).toHaveClass('text-xl', 'md:text-2xl');
      
      const text2 = screen.getByText('we built the future.');
      expect(text2).toHaveClass('text-2xl', 'md:text-3xl');
    });

    it('has responsive logo sizing', () => {
      renderComponent();
      
      const logoText = screen.getByText('CODAI');
      expect(logoText).toHaveClass('text-6xl');
    });
  });

  describe('Theme Integration', () => {
    it('applies intro theme classes', () => {
      renderComponent();
      
      const section = screen.getByTestId('chapter-intro');
      expect(section).toHaveClass('bg-gradient-to-b', 'from-intro-900', 'via-intro-800', 'to-intro-700');
    });

    it('applies theme colors to text elements', () => {
      renderComponent();
      
      const primaryText = screen.getByText('we built the future.');
      expect(primaryText).toHaveClass('text-intro-100');
      
      const secondaryText = screen.getByText('In 2025, while others built features...');
      expect(secondaryText).toHaveClass('text-intro-200');
    });

    it('applies theme colors to CTA button', () => {
      renderComponent();
      
      const ctaButton = screen.getByTestId('intro-cta-button');
      expect(ctaButton).toHaveClass('bg-intro-500', 'hover:bg-intro-400');
    });
  });

  describe('Particle System', () => {
    it('renders background particles', () => {
      renderComponent();
      
      const particleSystem = screen.getByTestId('chapter-intro').querySelector('.particle-system');
      expect(particleSystem).toBeInTheDocument();
      expect(particleSystem).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders correct number of particles', () => {
      renderComponent();
      
      const particles = screen.getByTestId('chapter-intro').querySelectorAll('.particle');
      expect(particles).toHaveLength(50);
    });
  });

  describe('Error Boundaries', () => {
    it('handles animation errors gracefully', () => {
      // Mock GSAP error
      mockTimeline.to.mockImplementationOnce(() => {
        throw new Error('Animation error');
      });
      
      // Should not crash
      expect(() => renderComponent()).not.toThrow();
    });

    it('handles missing refs gracefully', () => {
      // Mock missing ref
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderComponent();
      
      // Should not crash the component
      expect(screen.getByTestId('chapter-intro')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});