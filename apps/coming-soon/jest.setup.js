import '@testing-library/jest-dom'

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
Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
});

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
    value: jest.fn().mockImplementation(cb => setTimeout(cb, 0)),
    writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
    value: jest.fn().mockImplementation(id => clearTimeout(id)),
    writable: true,
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
    value: jest.fn().mockImplementation(() => ({
        getPropertyValue: jest.fn().mockReturnValue(''),
        marginLeft: '0px',
        marginRight: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
    })),
    writable: true,
});

// Mock canvas for jsdom
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Array(4) })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
});

HTMLCanvasElement.prototype.toDataURL = jest.fn(() => '');
HTMLCanvasElement.prototype.getImageData = jest.fn(() => ({ data: [] }));

// Mock WebGL context
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation((contextId) => {
    if (contextId === 'webgl' || contextId === 'webgl2') {
        return {
            canvas: document.createElement('canvas'),
            drawingBufferWidth: 800,
            drawingBufferHeight: 600,
            getContextAttributes: () => ({}),
            isContextLost: () => false,
        };
    }
    // Default 2D context
    return {
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Array(4) })),
        putImageData: jest.fn(),
        createImageData: jest.fn(() => ({ data: new Array(4) })),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
    };
});

// Suppress console errors from canvas/three.js
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' && (
                args[0].includes('canvas.node') ||
                args[0].includes('WebGL') ||
                args[0].includes('Invalid hook call') ||
                args[0].includes('Warning: Invalid hook call')
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