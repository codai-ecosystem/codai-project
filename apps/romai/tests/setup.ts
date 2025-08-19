import '@testing-library/jest-dom';
import React from 'react';
import { beforeAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Test timeout for slower operations
export const TEST_TIMEOUT = 60000; // 60 seconds for real API calls

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Set up React testing environment
beforeAll(() => {
  // Ensure React is available globally for JSX
  global.React = React;

  // Keep only essential DOM API polyfills for testing
  global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
  };

  global.ResizeObserver = class ResizeObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
  };

  // Basic SVG support for testing
  Object.defineProperty(window, 'SVGElement', {
    writable: true,
    value: class SVGElement extends Element {
      getBBox() {
        return { x: 0, y: 0, width: 100, height: 100, top: 0, right: 100, bottom: 100, left: 0 };
      }
    }
  });

  // Enhanced SVG support for createElementNS
  const originalCreateElementNS = document.createElementNS;
  document.createElementNS = function (namespaceURI: string, qualifiedName: string) {
    const element = originalCreateElementNS.call(this, namespaceURI, qualifiedName);
    if (namespaceURI === 'http://www.w3.org/2000/svg' && element) {
      (element as any).getBBox = () => ({ x: 0, y: 0, width: 100, height: 100, top: 0, right: 100, bottom: 100, left: 0 });
    }
    return element;
  };

  // Essential window properties for testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: function (query: string) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function () { },
        removeListener: function () { },
        addEventListener: function () { },
        removeEventListener: function () { },
        dispatchEvent: function () { },
      };
    },
  });

  // Real localStorage implementation for testing
  Object.defineProperty(window, 'localStorage', {
    value: {
      store: {} as Record<string, string>,
      getItem: function (key: string) {
        return this.store[key] || null;
      },
      setItem: function (key: string, value: string) {
        this.store[key] = String(value);
      },
      removeItem: function (key: string) {
        delete this.store[key];
      },
      clear: function () {
        this.store = {};
      },
    },
    writable: true,
  });
});

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: React.createElement'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};