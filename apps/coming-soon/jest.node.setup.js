// Simple test-only setup file
import '@testing-library/jest-dom'

// Mock only essential browser APIs for node environment
const mockWindow = {
    matchMedia: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
    localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    sessionStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    scrollTo: jest.fn(),
    requestAnimationFrame: jest.fn().mockImplementation(cb => setTimeout(cb, 0)),
    cancelAnimationFrame: jest.fn().mockImplementation(id => clearTimeout(id)),
    getComputedStyle: jest.fn().mockImplementation(() => ({
        getPropertyValue: jest.fn().mockReturnValue(''),
        marginLeft: '0px',
        marginRight: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
    })),
};

// Assign to global for node environment
Object.assign(global, mockWindow);

// Mock essential observers
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

// Suppress console errors from problematic modules
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' && (
                args[0].includes('canvas.node') ||
                args[0].includes('WebGL') ||
                args[0].includes('Invalid hook call') ||
                args[0].includes('Warning: Invalid hook call') ||
                args[0].includes('Warning: ReactDOM.render')
            )
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});