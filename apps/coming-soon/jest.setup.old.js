import '@testing-library/jest-dom'

// Mock problematic canvas dependency early and comprehensive
jest.mock('canvas', () => require('./__mocks__/canvas.js'), { virtual: true });

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

// Mock scrollTo
global.scrollTo = jest.fn()

// Mock getComputedStyle
global.getComputedStyle = jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn().mockReturnValue(''),
}))

// Setup localStorage mock
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    writable: true,
})

// Setup sessionStorage mock
Object.defineProperty(window, 'sessionStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    writable: true,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation(cb => setTimeout(cb, 0))
global.cancelAnimationFrame = jest.fn().mockImplementation(id => clearTimeout(id))

// Mock problematic canvas dependency early and comprehensive
jest.mock('canvas', () => ({
    Canvas: jest.fn(),
    createCanvas: jest.fn(() => ({
        getContext: jest.fn(() => ({
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            getImageData: jest.fn(() => ({ data: [] })),
            putImageData: jest.fn(),
            createImageData: jest.fn(() => []),
            setTransform: jest.fn(),
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
        })),
        width: 150,
        height: 150,
        toDataURL: jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    })),
}), { virtual: true });

// Mock Node.js canvas module specifically
jest.doMock('canvas', () => ({}));

// Suppress JSDOM canvas errors
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('canvas.node')) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});