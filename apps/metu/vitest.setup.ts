import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

// Mock framer-motion components
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, style, animate, initial, transition, ...props }: any) => (
            <div className= { className } style={ style } { ...props } >
            { children }
</div>
),
    button: ({ children, className, onClick, ...props }: any) => (
        <button className= { className } onClick = { onClick } {...props }>
            { children }
            </button>
    ),
  },
AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{ children } </>,
useInView: () => [null, true],
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
    }),
}));

// Mock lucide-react icons with comprehensive coverage
const MockIcon = ({ className = '', ...props }: { className?: string;[key: string]: any }) => (
    <svg className= { className } data-testid="mock-icon" {...props } />
);

vi.mock('lucide-react', () => ({
    // Voice & Audio Icons
    Mic: MockIcon,
    MicOff: MockIcon,
    Volume2: MockIcon,
    VolumeX: MockIcon,
    Headphones: MockIcon,
    Speaker: MockIcon,

    // AI & Brain Icons
    Brain: MockIcon,
    Cpu: MockIcon,
    Zap: MockIcon,
    Sparkles: MockIcon,
    Bot: MockIcon,

    // Interface Icons
    Settings: MockIcon,
    ChevronRight: MockIcon,
    ChevronDown: MockIcon,
    X: MockIcon,
    Plus: MockIcon,
    Minus: MockIcon,

    // Status Icons
    Activity: MockIcon,
    TrendingUp: MockIcon,
    AlertCircle: MockIcon,
    CheckCircle: MockIcon,
    Circle: MockIcon,

    // Communication Icons
    MessageCircle: MockIcon,
    Send: MockIcon,
    Download: MockIcon,
    Upload: MockIcon,

    // Navigation Icons
    ArrowRight: MockIcon,
    ArrowLeft: MockIcon,
    Home: MockIcon,
    Menu: MockIcon,

    // System Icons
    Power: MockIcon,
    Wifi: MockIcon,
    Monitor: MockIcon,
    Smartphone: MockIcon,
}));

// Mock Electron APIs
const mockIpcRenderer = {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
};

// Mock window.electron
Object.defineProperty(window, 'electron', {
    value: {
        ipcRenderer: mockIpcRenderer,
    },
    writable: true,
});

// Mock Speech Recognition APIs
const mockSpeechRecognition = vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onstart: null,
    onend: null,
    onresult: null,
    onerror: null,
    continuous: false,
    interimResults: false,
    lang: 'en-US',
}));

Object.defineProperty(window, 'SpeechRecognition', {
    value: mockSpeechRecognition,
    writable: true,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: mockSpeechRecognition,
    writable: true,
});

// Mock Speech Synthesis API
const mockSpeechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    speaking: false,
    pending: false,
    paused: false,
};

Object.defineProperty(window, 'speechSynthesis', {
    value: mockSpeechSynthesis,
    writable: true,
});

// Mock SpeechSynthesisUtterance
const mockSpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
    text,
    lang: 'en-US',
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1,
    onstart: null,
    onend: null,
    onerror: null,
    onpause: null,
    onresume: null,
    onmark: null,
    onboundary: null,
}));

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: mockSpeechSynthesisUtterance,
    writable: true,
});

// Mock Microsoft Cognitive Services Speech SDK
vi.mock('microsoft-cognitiveservices-speech-sdk', () => ({
    SpeechConfig: {
        fromSubscription: vi.fn(),
    },
    SpeechRecognizer: vi.fn(),
    AudioConfig: {
        fromDefaultMicrophone: vi.fn(),
    },
    SpeechSynthesizer: vi.fn(),
    ResultReason: {
        RecognizedSpeech: 'RecognizedSpeech',
        NoMatch: 'NoMatch',
        Canceled: 'Canceled',
    },
}));

// Mock OpenAI SDK
vi.mock('openai', () => ({
    default: vi.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content: 'Hello! I\'m doing great, thank you for asking. How can I assist you today?',
                            },
                        },
                    ],
                }),
            },
        },
    })),
}));

// Mock WebSocket
const mockWebSocket = vi.fn().mockImplementation(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
}));

Object.defineProperty(window, 'WebSocket', {
    value: mockWebSocket,
    writable: true,
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Setup fetch mock with default response
vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
        success: true,
        data: {
            voiceEnabled: true,
            volume: 0.8,
            language: 'en-US',
            theme: 'dark',
        },
        message: 'Test API response',
    }),
    text: () => Promise.resolve('Test response'),
} as Response);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.ELECTRON_IS_DEV = '1';

// Mock zustand stores
vi.mock('zustand', () => ({
    create: vi.fn((fn) => {
        const store = fn(() => ({}), () => ({}));
        return store;
    }),
}));

// Silence console warnings in tests
const originalWarn = console.warn;
beforeEach(() => {
    console.warn = vi.fn();
});

afterEach(() => {
    console.warn = originalWarn;
    vi.clearAllMocks();
});
