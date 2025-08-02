import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Environment variables
vi.stubEnv('NEXT_PUBLIC_ROMAI_API_URL', 'http://localhost:3001');
vi.stubEnv('NEXT_PUBLIC_ROMAI_WS_URL', 'ws://localhost:3001');
vi.stubEnv('ROMAI_API_KEY', 'test-api-key');
vi.stubEnv('OPENAI_API_KEY', 'test-openai-key');
vi.stubEnv('NODE_ENV', 'test');

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
    root: null,
    rootMargin: '',
    thresholds: [],
}));

// Mock framer-motion with comprehensive motion component support
vi.mock('framer-motion', () => ({
    motion: {
        div: 'div',
        section: 'section',
        h1: 'h1',
        h2: 'h2',
        p: 'p',
        span: 'span',
        button: 'button',
        header: 'header',
        nav: 'nav',
        main: 'main',
        article: 'article',
        aside: 'aside',
        footer: 'footer',
        form: 'form',
        input: 'input',
        textarea: 'textarea',
        select: 'select',
        img: 'img',
        video: 'video',
        canvas: 'canvas',
        svg: 'svg',
        path: 'path',
        circle: 'circle',
        rect: 'rect',
        line: 'line',
        ul: 'ul',
        li: 'li',
        a: 'a'
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn()
    }),
    useMotionValue: (initial: any) => ({ get: () => initial, set: vi.fn() }),
    useTransform: () => vi.fn(),
    useSpring: (value: any) => value,
    useMotionTemplate: () => '',
    useDragControls: () => ({ start: vi.fn() }),
    useAnimationControls: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() })
}));

// Mock Next.js router
vi.mock('next/router', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        reload: vi.fn(),
        route: '/',
        pathname: '/',
        query: {},
        asPath: '/',
        isReady: true,
        events: {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
        },
    }),
}));

// Mock Next.js head
vi.mock('next/head', () => {
    return {
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => children,
    };
});

// Mock process
Object.defineProperty(process, 'env', {
    value: {
        ...process.env,
        NODE_ENV: 'test',
        NEXT_PUBLIC_ROMAI_API_URL: 'http://localhost:3001',
        NEXT_PUBLIC_ROMAI_WS_URL: 'ws://localhost:3001',
        ROMAI_API_KEY: 'test-api-key',
        OPENAI_API_KEY: 'test-openai-key',
    },
    writable: true,
});

// Mock window methods
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

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    },
    writable: true,
});

// Suppress console warnings in tests
console.warn = vi.fn();
console.error = vi.fn();
