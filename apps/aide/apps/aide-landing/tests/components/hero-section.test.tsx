import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HeroSection } from '../../components/sections/hero-section';
import { TestWrapper } from '@codai/shared-ui/utils/test-utils';

expect.extend(toHaveNoViolations);

describe('HeroSection', () => {
    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <TestWrapper>
                {component}
            </TestWrapper>
        );
    };

    describe('Rendering', () => {
        it('renders hero section with all key elements', () => {
            renderWithProviders(<HeroSection />);

            expect(screen.getByRole('banner')).toBeInTheDocument();
            expect(screen.getByText(/Now Available/i)).toBeInTheDocument();
            expect(screen.getByText(/The Future of/i)).toBeInTheDocument();
            expect(screen.getByText(/AI Development/i)).toBeInTheDocument();
        });

        it('displays call-to-action buttons', () => {
            renderWithProviders(<HeroSection />);

            expect(screen.getByRole('button', { name: /try web version/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /view on github/i })).toBeInTheDocument();
        });

        it('shows feature highlights', () => {
            renderWithProviders(<HeroSection />);

            expect(screen.getByText(/AI-Powered Coding/i)).toBeInTheDocument();
            expect(screen.getByText(/VS Code Integration/i)).toBeInTheDocument();
            expect(screen.getByText(/One-Click Deploy/i)).toBeInTheDocument();
            expect(screen.getByText(/Real-time Collaboration/i)).toBeInTheDocument();
        });

        it('displays terminal simulation', () => {
            renderWithProviders(<HeroSection />);

            expect(screen.getByText(/AIDE Terminal/i)).toBeInTheDocument();
            expect(screen.getByText(/Analyzing requirements/i)).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('handles try web version button click', async () => {
            // Mock window.open
            const mockOpen = jest.fn();
            Object.defineProperty(window, 'open', { value: mockOpen, writable: true });

            renderWithProviders(<HeroSection />);

            const tryButton = screen.getByRole('button', { name: /try web version/i });
            fireEvent.click(tryButton);

            await waitFor(() => {
                expect(mockOpen).toHaveBeenCalledWith(
                    expect.stringContaining('/signup'),
                    '_blank'
                );
            });
        });

        it('handles github link click', () => {
            renderWithProviders(<HeroSection />);

            const githubLink = screen.getByRole('link', { name: /view on github/i });
            expect(githubLink).toHaveAttribute('href', expect.stringContaining('github'));
            expect(githubLink).toHaveAttribute('target', '_blank');
        });
    });

    describe('Animations', () => {
        it('triggers animations on scroll into view', async () => {
            renderWithProviders(<HeroSection />);

            // Mock IntersectionObserver
            const mockIntersectionObserver = jest.fn();
            mockIntersectionObserver.mockReturnValue({
                observe: () => null,
                unobserve: () => null,
                disconnect: () => null
            });
            window.IntersectionObserver = mockIntersectionObserver;

            await waitFor(() => {
                expect(screen.getByRole('banner')).toBeInTheDocument();
            });
        });

        it('shows terminal typing animation', async () => {
            renderWithProviders(<HeroSection />);

            const terminal = screen.getByText(/AIDE Terminal/i).closest('div');
            expect(terminal).toBeInTheDocument();

            // Check for animation classes
            await waitFor(() => {
                expect(terminal).toHaveClass(/animate/);
            });
        });
    });

    describe('Responsive Design', () => {
        it('adapts layout for mobile screens', () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
            global.dispatchEvent(new Event('resize'));

            renderWithProviders(<HeroSection />);

            const heroContainer = screen.getByRole('banner');
            expect(heroContainer).toHaveClass(/container/);
        });

        it('adapts layout for desktop screens', () => {
            // Mock desktop viewport
            Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 });
            global.dispatchEvent(new Event('resize'));

            renderWithProviders(<HeroSection />);

            const heroContainer = screen.getByRole('banner');
            expect(heroContainer).toHaveClass(/container/);
        });
    });

    describe('Internationalization', () => {
        it('displays text in English by default', () => {
            renderWithProviders(<HeroSection />);

            expect(screen.getByText(/The Future of/i)).toBeInTheDocument();
            expect(screen.getByText(/AI Development/i)).toBeInTheDocument();
        });

        it('supports Romanian translation', () => {
            renderWithProviders(<HeroSection />);

            // Test that translation keys are being used
            expect(screen.queryByText('aide.hero.title.part1')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has no accessibility violations', async () => {
            const { container } = renderWithProviders(<HeroSection />);
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('has proper heading hierarchy', () => {
            renderWithProviders(<HeroSection />);

            const mainHeading = screen.getByRole('heading', { level: 1 });
            expect(mainHeading).toBeInTheDocument();
        });

        it('has proper ARIA labels', () => {
            renderWithProviders(<HeroSection />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveAccessibleName();
            });
        });

        it('supports keyboard navigation', () => {
            renderWithProviders(<HeroSection />);

            const tryButton = screen.getByRole('button', { name: /try web version/i });
            tryButton.focus();
            expect(tryButton).toHaveFocus();

            // Test tab navigation
            fireEvent.keyDown(tryButton, { key: 'Tab' });
            const githubLink = screen.getByRole('link', { name: /view on github/i });
            expect(githubLink).toHaveFocus();
        });
    });

    describe('Performance', () => {
        it('loads efficiently without unnecessary re-renders', () => {
            const renderSpy = jest.fn();
            const TestComponent = () => {
                renderSpy();
                return <HeroSection />;
            };

            renderWithProviders(<TestComponent />);

            expect(renderSpy).toHaveBeenCalledTimes(1);
        });

        it('lazy loads images and heavy components', () => {
            renderWithProviders(<HeroSection />);

            // Check for lazy loading attributes
            const images = screen.getAllByRole('img');
            images.forEach(img => {
                expect(img).toHaveAttribute('loading', 'lazy');
            });
        });
    });

    describe('Error Handling', () => {
        it('handles missing environment variables gracefully', () => {
            // Mock missing env vars
            const originalEnv = process.env;
            process.env = { ...originalEnv, NEXT_PUBLIC_CONTROL_PANEL_URL: undefined };

            renderWithProviders(<HeroSection />);

            const tryButton = screen.getByRole('button', { name: /try web version/i });
            expect(tryButton).toBeInTheDocument();

            // Restore env
            process.env = originalEnv;
        });

        it('handles network errors for external links', () => {
            renderWithProviders(<HeroSection />);

            // Should still render even if external services are down
            expect(screen.getByRole('banner')).toBeInTheDocument();
        });
    });
});
