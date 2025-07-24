/**
 * UI Testing Setup Configuration
 * Provides comprehensive setup for component and UI testing
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

console.log('🔧 Setting up UI Test Environment...');

// Mock browser APIs
beforeAll(() => {
  // Mock window.matchMedia for responsive testing
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

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock getComputedStyle
  window.getComputedStyle = vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn().mockReturnValue(''),
  }));

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
  });

  // Mock performance API
  if (!global.performance) {
    global.performance = {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
    } as any;
  }

  console.log('✅ Browser APIs mocked successfully');
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Global test utilities
export const testUtils = {
  // Mock event handlers
  createMockHandler: () => vi.fn(),
  
  // Simulate user interactions
  simulateKeyPress: (element: HTMLElement, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key }));
  },
  
  // Wait for async operations
  waitFor: (callback: () => void, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        try {
          callback();
          resolve(true);
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error);
          } else {
            setTimeout(check, 10);
          }
        }
      };
      check();
    });
  },
  
  // Accessibility testing helpers
  checkAccessibility: (element: HTMLElement) => {
    const issues = [];
    
    // Check for ARIA labels
    if (element.tagName === 'BUTTON' && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
      issues.push('Button missing accessible label');
    }
    
    // Check for focus indicators
    if (element.tabIndex >= 0 && !element.style.outline && !element.style.boxShadow) {
      // Note: This is a basic check, real focus indicators might be in CSS
    }
    
    return issues;
  },
  
  // Performance testing helpers
  measureRenderTime: (renderFunction: () => void) => {
    const start = performance.now();
    renderFunction();
    return performance.now() - start;
  },
  
  // Responsive testing helpers
  setViewport: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  },
  
  // Theme testing helpers
  mockTheme: (theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme;
  },
};

// Export for use in tests
export default testUtils;

console.log('🎯 UI Test Setup Complete');
