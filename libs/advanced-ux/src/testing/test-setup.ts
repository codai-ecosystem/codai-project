import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;
window.IntersectionObserverEntry = vi.fn() as any;

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.ResizeObserver = mockResizeObserver;
window.ResizeObserverEntry = vi.fn() as any;

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
mockPerformanceObserver.mockReturnValue({
  observe: vi.fn(),
  disconnect: vi.fn(),
});
window.PerformanceObserver = mockPerformanceObserver;

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  return setTimeout(cb, 16) as any;
});
global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    navigation: {
      type: 'navigate',
    },
    timing: {
      navigationStart: Date.now() - 1000,
      loadEventEnd: Date.now(),
    },
  },
  writable: true,
});

// Mock navigator APIs
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  writable: true,
});

Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  writable: true,
});

Object.defineProperty(navigator, 'languages', {
  value: ['en-US', 'en'],
  writable: true,
});

// Mock screen API
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
  },
  writable: true,
});

// Mock window.matchMedia
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
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock document.hidden for visibility API
Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true,
});

// Mock document.visibilityState
Object.defineProperty(document, 'visibilityState', {
  value: 'visible',
  writable: true,
});

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock HTMLElement.prototype.focus
HTMLElement.prototype.focus = vi.fn();

// Mock HTMLElement.prototype.blur
HTMLElement.prototype.blur = vi.fn();

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}));

// Mock getComputedStyle
window.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => 'rgba(0, 0, 0, 1)'),
  getPropertyPriority: vi.fn(() => ''),
  item: vi.fn(() => ''),
  length: 0,
  setProperty: vi.fn(),
  removeProperty: vi.fn(() => ''),
  cssFloat: '',
  cssText: '',
  parentRule: null,
  [Symbol.iterator]: vi.fn(),
})) as any;

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
) as any;

// Mock Web Audio API (if needed)
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
    type: 'sine',
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 },
  })),
  destination: {},
  close: vi.fn(),
  resume: vi.fn(() => Promise.resolve()),
};

window.AudioContext = vi.fn(() => mockAudioContext) as any;
window.webkitAudioContext = vi.fn(() => mockAudioContext) as any;

// Mock pointer events
if (!window.PointerEvent) {
  window.PointerEvent = class PointerEvent extends Event {
    pointerId: number;
    width: number;
    height: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, eventInitDict: any = {}) {
      super(type, eventInitDict);
      this.pointerId = eventInitDict.pointerId || 0;
      this.width = eventInitDict.width || 1;
      this.height = eventInitDict.height || 1;
      this.pressure = eventInitDict.pressure || 0;
      this.tangentialPressure = eventInitDict.tangentialPressure || 0;
      this.tiltX = eventInitDict.tiltX || 0;
      this.tiltY = eventInitDict.tiltY || 0;
      this.twist = eventInitDict.twist || 0;
      this.pointerType = eventInitDict.pointerType || 'mouse';
      this.isPrimary = eventInitDict.isPrimary || false;
    }
  } as any;
}

// Mock touch events
if (!window.TouchEvent) {
  window.TouchEvent = class TouchEvent extends Event {
    touches: TouchList;
    targetTouches: TouchList;
    changedTouches: TouchList;

    constructor(type: string, eventInitDict: any = {}) {
      super(type, eventInitDict);
      this.touches = eventInitDict.touches || ([] as any);
      this.targetTouches = eventInitDict.targetTouches || ([] as any);
      this.changedTouches = eventInitDict.changedTouches || ([] as any);
    }
  } as any;
}

// Mock crypto API
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: vi.fn(() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })),
  },
  writable: true,
});

// Setup cleanup after each test
beforeEach(() => {
  // Clear all mocks
  vi.clearAllMocks();

  // Reset localStorage
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockImplementation(() => { });
  localStorageMock.removeItem.mockImplementation(() => { });
  localStorageMock.clear.mockImplementation(() => { });

  // Reset sessionStorage
  sessionStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.setItem.mockImplementation(() => { });
  sessionStorageMock.removeItem.mockImplementation(() => { });
  sessionStorageMock.clear.mockImplementation(() => { });
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

// Increase timeout for async tests
vi.setConfig({
  testTimeout: 10000,
});

export { };
