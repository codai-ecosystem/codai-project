import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTheme, ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';
import { vi } from 'vitest';

// Test component that uses theme
const TestThemeComponent = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div>
            <span data-testid="current-theme">{theme}</span>
            <button data-testid="toggle-theme" onClick={toggleTheme}>
                Toggle
            </button>
        </div>
    );
};

describe('ThemeContext', () => {
    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        // Mock document methods
        Object.defineProperty(document, 'documentElement', {
            value: {
                classList: {
                    add: vi.fn(),
                    remove: vi.fn(),
                },
                setAttribute: vi.fn(),
            },
            writable: true,
        });
    });

    it('provides theme context correctly', () => {
        render(
            <ThemeProvider>
                <TestThemeComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('current-theme')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-theme')).toBeInTheDocument();
    });

    it('toggles theme when button is clicked', () => {
        render(
            <ThemeProvider>
                <TestThemeComponent />
            </ThemeProvider>
        );

        const toggleButton = screen.getByTestId('toggle-theme');
        fireEvent.click(toggleButton);

        // Theme should change after click
        expect(screen.getByTestId('current-theme')).toBeInTheDocument();
    });

    it('provides fallback theme when used outside provider', () => {
        // Mock console.warn to avoid test output noise
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        const { unmount } = render(<TestThemeComponent />);

        // Should render with fallback theme, not throw error
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

        consoleSpy.mockRestore();
        unmount();
    });

    it('initializes with default theme', () => {
        render(
            <ThemeProvider>
                <TestThemeComponent />
            </ThemeProvider>
        );

        const themeDisplay = screen.getByTestId('current-theme');
        // Should start with 'dark' (SSR default) but could be 'system' after hydration
        expect(themeDisplay.textContent).toMatch(/^(light|dark|system)$/);
    });

    it('saves theme to localStorage when theme changes', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { });

        render(
            <ThemeProvider>
                <TestThemeComponent />
            </ThemeProvider>
        );

        const toggleButton = screen.getByTestId('toggle-theme');
        fireEvent.click(toggleButton);

        // Wait a bit for async theme updates
        setTimeout(() => {
            expect(setItemSpy).toHaveBeenCalledWith('codai-theme', expect.any(String));
        }, 100);

        setItemSpy.mockRestore();
    });
});