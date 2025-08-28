import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComingSoonPage } from '../ComingSoonPage';
import { TestProviders } from '../../__tests__/utils/test-providers';
import { axe } from 'jest-axe';

// Mock Lenis
const mockLenis = {
  raf: vi.fn(),
  scrollTo: vi.fn(),
  on: vi.fn(),
  destroy: vi.fn(),
  resize: vi.fn()
};

vi.mock('lenis', () => ({
  default: vi.fn(() => mockLenis)
}));

// Mock GSAP
const mockTimeline = {
  to: vi.fn().mockReturnThis(),
  fromTo: vi.fn().mockReturnThis(),
  kill: vi.fn()
};

const mockScrollTrigger = {
  create: vi.fn().mockReturnValue({ kill: vi.fn() }),
  kill: vi.fn(),
  update: vi.fn(),
  refresh: vi.fn(),
  getAll: vi.fn().mockReturnValue([])
};

vi.mock('gsap', () => ({
  gsap: {
    context: vi.fn((fn) => {
      fn();
      return { revert: vi.fn() };
    }),
    timeline: vi.fn(() => mockTimeline),
    to: vi.fn().mockReturnThis(),
    registerPlugin: vi.fn(),
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
      lagSmoothing: vi.fn()
    }
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
    t: (key: string, fallback?: string) => fallback || key
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

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));

describe('ComingSoonPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock document methods
    Object.defineProperty(document.documentElement, 'style', {
      value: {
        setProperty: vi.fn(),
        removeProperty: vi.fn()
      },
      writable: true
    });
    
    Object.defineProperty(document.documentElement, 'setAttribute', {
      value: vi.fn(),
      writable: true
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderComponent = (props = {}) => {
    return render(
      <TestProviders>
        <ComingSoonPage {...props} />
      </TestProviders>
    );
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('shows loading screen initially', () => {
      renderComponent();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders scroll progress indicator', async () => {
      renderComponent();
      
      // Wait for loading to complete
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Check for scroll progress component
      expect(document.querySelector('.fixed.top-0')).toBeInTheDocument();
    });

    it('renders chapter navigation', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('navigation', { name: /chapter navigation/i })).toBeInTheDocument();
    });

    it('renders intro chapter', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('The AI Renaissance')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet accessibility standards', async () => {
      const { container } = renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('has proper ARIA attributes', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'CODAI Ecosystem Experience');
      expect(main).toHaveAttribute('tabIndex', '0');
    });

    it('has screen reader navigation', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading..')).not.toBeInTheDocument();
      });

      const nav = screen.getByRole('navigation', { name: /chapter navigation/i });
      expect(nav).toHaveClass('sr-only');
    });

    it('supports keyboard navigation', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const main = screen.getByRole('main');
      act(() => {
        main.focus();
      });

      // Test arrow key navigation
      await user.keyboard('{ArrowDown}');
      // Since we only have one chapter, this shouldn't change anything
      expect(main).toHaveFocus();

      // Test Home key
      await user.keyboard('{Home}');
      expect(main).toHaveFocus();

      // Test End key
      await user.keyboard('{End}');
      expect(main).toHaveFocus();
    });
  });

  describe('Smooth Scrolling Integration', () => {
    it('initializes Lenis when motion is enabled', async () => {
      const LenisConstructor = await import('lenis');
      
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(LenisConstructor.default).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 1.2,
          easing: expect.any(Function),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          mouseMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false
        })
      );
    });

    it('does not initialize Lenis when reduced motion is preferred', () => {
      render(
        <TestProviders motionPreference="disabled">
          <ComingSoonPage />
        </TestProviders>
      );

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(vi.mocked(require('lenis').default)).not.toHaveBeenCalled();
    });

    it('sets up scroll event listeners', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(mockLenis.on).toHaveBeenCalledWith('scroll', mockScrollTrigger.update);
    });

    it('cleans up Lenis on unmount', async () => {
      const { unmount } = renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      unmount();

      expect(mockLenis.destroy).toHaveBeenCalled();
    });
  });

  describe('Chapter Management', () => {
    it('initializes with first chapter', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Check that intro chapter is visible
      expect(screen.getByText('The AI Renaissance')).toBeInTheDocument();
    });

    it('creates scroll triggers for chapter detection', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(mockScrollTrigger.create).toHaveBeenCalled();
    });

    it('updates progress on scroll', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Simulate scroll trigger update
      const scrollTriggerCalls = mockScrollTrigger.create.mock.calls;
      const progressTrigger = scrollTriggerCalls.find(call => 
        call[0].onUpdate && call[0].trigger
      );

      if (progressTrigger && progressTrigger[0].onUpdate) {
        progressTrigger[0].onUpdate({ progress: 0.5 });
      }

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--scroll-progress',
        '0.5'
      );
    });
  });

  describe('Chapter Transitions', () => {
    it('handles chapter transitions via scroll', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Simulate chapter transition
      const handleChapterTransition = vi.fn();
      
      // Since we only have one chapter, we can't test actual transitions
      // But we can verify the structure is there for future chapters
      expect(screen.getByText('The AI Renaissance')).toBeInTheDocument();
    });

    it('handles smooth scrolling to chapters', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Test would scroll to chapter elements when multiple chapters exist
      expect(mockLenis.scrollTo).not.toHaveBeenCalled(); // No transitions yet with single chapter
    });
  });

  describe('Performance Monitoring', () => {
    it('marks performance timing on initialization', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(window.performance.mark).toHaveBeenCalledWith('coming-soon-init-start');
      expect(window.performance.mark).toHaveBeenCalledWith('coming-soon-init-end');
      expect(window.performance.measure).toHaveBeenCalledWith(
        'coming-soon-init',
        'coming-soon-init-start',
        'coming-soon-init-end'
      );
    });

    it('shows development debug info in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Check for debug info
      expect(screen.getByText(/Chapter: 1\/1/)).toBeInTheDocument();
      expect(screen.getByText(/Progress: 0%/)).toBeInTheDocument();
      expect(screen.getByText(/Theme: intro/)).toBeInTheDocument();
      expect(screen.getByText(/Reduced Motion: OFF/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('hides debug info in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Debug info should not be present
      expect(screen.queryByText(/Chapter: 1\/1/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Responsive Design', () => {
    it('hides visual navigation on small screens', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const visualNav = screen.getByRole('navigation', { name: /visual chapter navigation/i });
      expect(visualNav).toHaveClass('hidden', 'lg:block');
    });

    it('shows visual navigation on large screens', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const visualNav = screen.getByRole('navigation', { name: /visual chapter navigation/i });
      expect(visualNav).toHaveClass('lg:block');
    });
  });

  describe('Reduced Motion Support', () => {
    it('applies reduced motion styles when preferred', () => {
      render(
        <TestProviders motionPreference="disabled">
          <ComingSoonPage />
        </TestProviders>
      );

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Check that auto scroll-behavior is applied
      const main = screen.getByRole('main');
      expect(main).toHaveStyle('scroll-behavior: auto');
    });

    it('enables smooth scrolling when motion is enabled', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const main = screen.getByRole('main');
      expect(main).toHaveStyle('scroll-behavior: smooth');
    });
  });

  describe('Error Handling', () => {
    it('handles Lenis initialization errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock Lenis to throw error
      vi.mocked(require('lenis').default).mockImplementationOnce(() => {
        throw new Error('Lenis initialization failed');
      });

      expect(() => renderComponent()).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('handles missing chapter elements gracefully', async () => {
      renderComponent();
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should not crash when chapter elements are missing
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});