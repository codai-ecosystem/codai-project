// RomAI Test Setup - 2025 Modern Testing Configuration
// Complete setup for AGI component testing

// Import vitest globals first
import { expect, vi, beforeEach, afterEach } from 'vitest'

// Make globals available BEFORE importing jest-dom
global.expect = expect
global.vi = vi

// Import testing library jest-dom matchers AFTER globals are set
import '@testing-library/jest-dom'

// Mock window.matchMedia which is not implemented in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver  
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.fetch for AGI API calls
global.fetch = vi.fn()

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

// App-specific customizations for AGI testing
export const TEST_TIMEOUT = 60000 // 60 seconds for real AGI API calls

// Mock AGI-specific services
vi.mock('@/lib/agi-client', () => ({
  agiClient: {
    getHealth: vi.fn(),
    getCapabilities: vi.fn(),
    getTrainingStatus: vi.fn(),
    getPerformanceMetrics: vi.fn(),
  },
}))

// Mock framer-motion components for test environment
vi.mock('framer-motion', () => {
  const React = require('react');

  const createMotionComponent = (element: string) => {
    return React.forwardRef(({ children, className, style, onClick, ...otherProps }: any, ref: any) => {
      // Filter out framer-motion specific props
      const {
        whileHover, whileTap, whileFocus, whileInView, whileDrag,
        initial, animate, exit, variants, transition,
        drag, dragConstraints, dragElastic, dragMomentum,
        layout, layoutId, layoutRoot, layoutScroll,
        onAnimationComplete, onAnimationStart, onAnimationUpdate,
        onViewportEnter, onViewportLeave,
        ...htmlProps
      } = otherProps;

      return React.createElement(element, {
        ...htmlProps,
        className,
        style,
        onClick,
        ref
      }, children);
    });
  };

  return {
    motion: {
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
      button: createMotionComponent('button'),
      section: createMotionComponent('section'),
      article: createMotionComponent('article'),
      header: createMotionComponent('header'),
      main: createMotionComponent('main'),
      nav: createMotionComponent('nav'),
      aside: createMotionComponent('aside'),
      footer: createMotionComponent('footer'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      p: createMotionComponent('p'),
      a: createMotionComponent('a'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      img: createMotionComponent('img'),
    },
    AnimatePresence: ({ children }: any) => children,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
  };
})

// Mock complex AGI computations
vi.mock('@/utils/agi-calculations', () => ({
  calculateAGIScore: vi.fn(() => 89.6),
  formatCapabilityScore: vi.fn((score: number) => `${score.toFixed(1)}%`),
  calculateConfidenceInterval: vi.fn(() => 95.2),
}))

// Global test utilities for AGI testing
global.createMockAGIData = () => ({
  server_status: 'healthy',
  server_uptime: 86400,
  models_loaded: 3,
  total_inferences: 15420,
  server_version: '2.1.0',
})

global.createMockCapabilities = () => ({
  romanian_language_processing: 94.7,
  cultural_understanding: 91.2,
  advanced_reasoning: 88.9,
  multi_dimensional_intelligence: 87.5,
  meta_learning: 85.3,
  autonomous_problem_solving: 90.1,
  overall_agi_score: 89.6,
  confidence_interval: 95.2,
})

// Test cleanup
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})
