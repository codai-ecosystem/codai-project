import React from "react";
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Test timeout constant
export const TEST_TIMEOUT = 10000; // 10 seconds

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return React.createElement("img", { src, alt, ...props });
  },
}));

// Mock framer-motion for testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const mockIcon = ({ className, ...props }: any) =>
    React.createElement('svg', {
      ...props,
      className: `lucide-icon ${className || ''}`,
      'data-testid': 'mock-icon'
    });

  return new Proxy({}, {
    get: () => mockIcon
  });
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
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

// Mock window.IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance for testing
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  } as any;
}

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: React.createFactory') ||
      args[0].includes('componentWillReceiveProps'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Enhanced window object mocking for SSR compatibility
const mockWindow = {
  location: {
    href: 'http://localhost:3000',
    search: '',
    pathname: '/',
    hash: '',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    protocol: 'http:',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  navigator: {
    userAgent: 'test-agent',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true,
    platform: 'test',
    clipboard: {
      writeText: vi.fn(),
      readText: vi.fn(),
    },
  },
  document: global.document,
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    length: 1,
    state: null,
  },
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  getComputedStyle: vi.fn(() => ({})),
  requestAnimationFrame: vi.fn(cb => setTimeout(cb, 16)),
  cancelAnimationFrame: vi.fn(),
  scrollTo: vi.fn(),
  scroll: vi.fn(),
  scrollX: 0,
  scrollY: 0,
  innerWidth: 1024,
  innerHeight: 768,
  outerWidth: 1024,
  outerHeight: 768,
  screen: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
  },
};

// Ensure window object is properly mocked in test environment
if (typeof global.window === 'undefined') {
  global.window = mockWindow as any;
}

// Helper function for SSR testing
export const mockSSREnvironment = () => {
  const originalWindow = global.window;
  delete (global as any).window;
  return () => {
    global.window = originalWindow;
  };
};

// Helper to safely mock window deletion for testing
export const withoutWindow = (callback: () => void) => {
  const originalWindow = global.window;
  try {
    delete (global as any).window;
    callback();
  } finally {
    global.window = originalWindow;
  }
};

// Mock Radix UI components to avoid React hooks issues
vi.mock('@radix-ui/react-progress', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ children, className, value, max = 100, ...props }, ref) =>
    React.createElement('div', {
      ref,
      className,
      'data-value': value,
      'data-max': max,
      role: 'progressbar',
      'aria-valuenow': value,
      'aria-valuemax': max,
      'aria-valuemin': 0,
      ...props
    }, children)
  ),
  Indicator: React.forwardRef<HTMLDivElement, any>(({ className, style, ...props }, ref) =>
    React.createElement('div', { ref, className, style, ...props })
  ),
}));