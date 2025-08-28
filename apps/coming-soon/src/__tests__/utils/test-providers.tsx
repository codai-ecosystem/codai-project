import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { MotionProvider } from '../../contexts/MotionContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import type { MotionPreference } from '../../components/types';

// Test providers wrapper
interface TestProvidersProps {
  children: ReactNode;
  theme?: 'light' | 'dark' | 'system';
  chapterTheme?: 'intro' | 'foundation' | 'revolution' | 'infrastructure' | 'developers' | 'finance' | 'blockchain' | 'society' | 'creativity' | 'lifestyle' | 'constellation' | 'future';
  motionPreference?: MotionPreference;
  language?: 'en' | 'ro';
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  theme = 'dark',
  chapterTheme = 'intro',
  motionPreference = 'enabled',
  language = 'en'
}) => {
  return (
    <ThemeProvider defaultTheme={theme} defaultChapterTheme={chapterTheme}>
      <MotionProvider defaultMotionPreference={motionPreference}>
        <LanguageProvider defaultLanguage={language}>
          {children}
        </LanguageProvider>
      </MotionProvider>
    </ThemeProvider>
  );
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: TestProvidersProps & { renderOptions?: Parameters<typeof render>[1] }
) => {
  const { renderOptions, ...providerOptions } = options || {};
  
  return render(
    <TestProviders {...providerOptions}>
      {ui}
    </TestProviders>,
    renderOptions
  );
};

// Mock data for testing
export const mockProjectData = [
  {
    id: 'test-project-1',
    name: 'Test Project 1',
    description: 'A test project for unit testing',
    category: 'testing',
    tier: 'core' as const,
    status: 'active' as const,
    features: ['feature1', 'feature2'],
    tags: ['test', 'mock']
  },
  {
    id: 'test-project-2',
    name: 'Test Project 2',
    description: 'Another test project',
    category: 'testing',
    tier: 'premium' as const,
    status: 'development' as const,
    features: ['feature3', 'feature4'],
    tags: ['test', 'development']
  }
];

export const mockChapterProps = {
  theme: 'intro' as const,
  title: 'Test Chapter',
  subtitle: 'Test Subtitle',
  description: 'Test chapter description',
  projects: mockProjectData,
  chapterNumber: 1,
  totalChapters: 12,
  isActive: true,
  className: 'test-chapter'
};

// Helper function to wait for animations
export const waitForAnimation = (duration = 100) => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Mock resize observer
export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Mock window matchMedia for responsive tests
export const mockMatchMedia = (query: string) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((q: string) => ({
      matches: q === query,
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Accessibility test helpers
export const getAccessibilityTree = (container: HTMLElement) => {
  return Array.from(container.querySelectorAll('*')).map(element => ({
    tagName: element.tagName.toLowerCase(),
    role: element.getAttribute('role'),
    ariaLabel: element.getAttribute('aria-label'),
    ariaDescribedBy: element.getAttribute('aria-describedby'),
    tabIndex: element.getAttribute('tabindex'),
    textContent: element.textContent?.trim()
  }));
};

export const checkFocusTrapping = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  return Array.from(focusableElements).map(el => ({
    element: el,
    tabIndex: el.getAttribute('tabindex'),
    disabled: (el as HTMLInputElement).disabled
  }));
};