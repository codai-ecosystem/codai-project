import '@testing-library/jest-dom';

// Early mock for canvas to prevent jsdom from loading it
jest.mock('canvas', () => ({
    createCanvas: jest.fn(() => ({
        getContext: jest.fn(() => ({
            fillRect: jest.fn(),
            drawImage: jest.fn(),
            getImageData: jest.fn(() => ({ data: new Array(4) })),
        })),
        toBuffer: jest.fn(),
        toDataURL: jest.fn(),
    })),
}), { virtual: true });

// Global mock for Canvas API
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(() => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        drawImage: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Array(4) })),
        putImageData: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        arc: jest.fn(),
        rect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
    })),
});

// Mock Electron APIs
Object.defineProperty(window, 'electron', {
    value: {
        ipcRenderer: {
            send: jest.fn(),
            on: jest.fn(),
            removeListener: jest.fn(),
        },
    },
});

// Mock Web Speech API
Object.defineProperty(window, 'SpeechRecognition', {
    value: jest.fn().mockImplementation(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        abort: jest.fn(),
        continuous: true,
        interimResults: true,
        lang: 'en-US',
        onstart: null,
        onend: null,
        onresult: null,
        onerror: null,
    })),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: window.SpeechRecognition,
});

// Mock AudioContext
Object.defineProperty(window, 'AudioContext', {
    value: jest.fn().mockImplementation(() => ({
        createAnalyser: jest.fn(),
        createMediaStreamSource: jest.fn(),
        suspend: jest.fn(),
        resume: jest.fn(),
        close: jest.fn(),
    })),
});

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
    value: {
        getUserMedia: jest.fn().mockResolvedValue({
            getTracks: () => [{ stop: jest.fn() }],
        }),
        enumerateDevices: jest.fn().mockResolvedValue([]),
    },
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
    })
) as jest.Mock;

// Suppress console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
    console.warn = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('React')
        ) {
            return;
        }
        originalWarn.call(console, ...args);
    };
});

afterAll(() => {
    console.warn = originalWarn;
});
