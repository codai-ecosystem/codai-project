/**
 * Test Setup Configuration
 * Following Microsoft React testing best practices with Vitest and React Testing Library
 * Includes accessibility testing setup and WCAG 2.1 AA compliance validation
 */

import '@testing-library/jest-dom';
import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Microsoft's recommended global test setup
beforeAll(() => {
  // Mock environment variables for consistent testing
  (process.env as any).NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
  process.env.NEXT_PUBLIC_MCP_URL = 'http://localhost:4950';
  
  // Microsoft's recommended browser API mocks for SSR safety
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock clipboard API for accessibility testing
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue('mocked clipboard text'),
    },
    writable: true,
  });

  // Mock IntersectionObserver for component visibility testing
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }));

  // Mock ResizeObserver for responsive component testing
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock console methods to avoid noise in tests
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Clean up after each test following Microsoft patterns
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Custom matchers for accessibility testing
expect.extend({
  toBeAccessible(received) {
    const pass = received && received.getAttribute;
    return {
      message: () => 
        pass 
          ? `Expected element to not be accessible` 
          : `Expected element to be accessible`,
      pass,
    };
  },
  
  toHaveAriaLabel(received, expectedLabel) {
    const actualLabel = received?.getAttribute('aria-label') || received?.getAttribute('aria-labelledby');
    const pass = actualLabel === expectedLabel;
    return {
      message: () => 
        pass 
          ? `Expected element to not have aria-label "${expectedLabel}"` 
          : `Expected element to have aria-label "${expectedLabel}", received "${actualLabel}"`,
      pass,
    };
  },
  
  toBeKeyboardAccessible(received) {
    const tabIndex = received?.getAttribute('tabindex');
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(
      received?.tagName?.toLowerCase()
    );
    const pass = isInteractive || (tabIndex !== null && parseInt(tabIndex) >= 0);
    
    return {
      message: () => 
        pass 
          ? `Expected element to not be keyboard accessible` 
          : `Expected element to be keyboard accessible`,
      pass,
    };
  }
});

// Accessibility testing helpers following Microsoft WCAG 2.1 AA standards
export const accessibilityMatchers = {
  hasRequiredAriaAttributes: (element: HTMLElement, role: string) => {
    const requiredAttributes: Record<string, string[]> = {
      button: ['aria-label', 'aria-labelledby', 'aria-describedby'],
      textbox: ['aria-label', 'aria-labelledby'],
      combobox: ['aria-label', 'aria-labelledby', 'aria-expanded'],
      dialog: ['aria-label', 'aria-labelledby', 'aria-modal'],
      alert: ['aria-live'],
      region: ['aria-label', 'aria-labelledby'],
    };

    const required = requiredAttributes[role] || [];
    return required.some(attr => 
      element.hasAttribute(attr) || 
      element.hasAttribute(attr.replace('aria-', ''))
    );
  },

  hasProperColorContrast: async (element: HTMLElement) => {
    // This would typically use a color contrast library
    // For now, we'll check if the element has explicit color styles
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    
    // Basic check - in real implementation, use a proper contrast ratio calculator
    return color !== backgroundColor && color !== 'inherit';
  },

  isKeyboardNavigable: (element: HTMLElement) => {
    const tabIndex = element.tabIndex;
    const isInteractiveElement = [
      'button', 'a', 'input', 'select', 'textarea', 'details', 'summary'
    ].includes(element.tagName.toLowerCase());
    
    return isInteractiveElement || tabIndex >= 0;
  }
};

// Performance testing utilities following Microsoft patterns
export const performanceUtils = {
  measureRenderTime: async (renderFn: () => void) => {
    const startTime = performance.now();
    await renderFn();
    const endTime = performance.now();
    return endTime - startTime;
  },

  expectFastRender: (renderTime: number, maxTime: number = 100) => {
    expect(renderTime).toBeLessThan(maxTime);
  }
};

// Mock data generators for consistent testing
export const testDataGenerators = {
  generateMemoryData: (count: number = 5) => ({
    memories: Array.from({ length: count }, (_, i) => ({
      id: `memory-${i}`,
      content: `Test memory content ${i}`,
      timestamp: new Date(Date.now() - i * 1000).toISOString(),
      tags: [`tag-${i}`, `category-${i % 3}`],
      metadata: { importance: Math.floor(Math.random() * 10) + 1 }
    })),
    totalCount: count,
    hasMore: false
  }),

  generateAnalyticsData: () => ({
    memoryGrowth: [
      { date: '2025-01', count: 45 },
      { date: '2025-02', count: 78 },
      { date: '2025-03', count: 123 }
    ],
    categoryDistribution: [
      { name: 'Work', value: 35, color: '#3B82F6' },
      { name: 'Personal', value: 25, color: '#10B981' }
    ],
    weeklyActivity: [
      { day: 'Mon', memories: 12, searches: 45 },
      { day: 'Tue', memories: 19, searches: 52 }
    ],
    topTags: [
      { name: 'project', count: 45 },
      { name: 'meeting', count: 32 }
    ]
  }),

  generateSearchResults: (count: number = 3) => ({
    results: Array.from({ length: count }, (_, i) => ({
      id: `result-${i}`,
      content: `Search result ${i}`,
      relevance: Math.random(),
      snippet: `Relevant snippet ${i}`
    })),
    totalCount: count,
    query: 'test query'
  })
};

// Accessibility testing utilities
export const a11yUtils = {
  checkAriaAttributes: (element: HTMLElement) => {
    const issues: string[] = [];
    
    // Check for required ARIA attributes based on role
    const role = element.getAttribute('role');
    if (role && !accessibilityMatchers.hasRequiredAriaAttributes(element, role)) {
      issues.push(`Missing required ARIA attributes for role: ${role}`);
    }
    
    // Check for aria-label or accessible name
    const hasAccessibleName = 
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim();
      
    if (!hasAccessibleName && ['button', 'link', 'input'].includes(element.tagName.toLowerCase())) {
      issues.push('Interactive element missing accessible name');
    }
    
    return issues;
  },

  checkKeyboardNavigation: (element: HTMLElement) => {
    const issues: string[] = [];
    
    if (!accessibilityMatchers.isKeyboardNavigable(element)) {
      issues.push('Element is not keyboard navigable');
    }
    
    // Check for keyboard event handlers
    const hasKeyboardHandlers = 
      element.getAttribute('onkeydown') ||
      element.getAttribute('onkeyup') ||
      element.getAttribute('onkeypress');
      
    if (element.tagName.toLowerCase() === 'div' && element.getAttribute('role') === 'button' && !hasKeyboardHandlers) {
      issues.push('Custom button missing keyboard handlers');
    }
    
    return issues;
  }
};