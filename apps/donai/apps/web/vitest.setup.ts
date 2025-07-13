import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Framer Motion to avoid animation-related test issues
vi.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: () => 'div'
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn(),
    }),
    useMotionValue: () => ({
        set: vi.fn(),
        get: vi.fn(),
        onChange: vi.fn(),
    }),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
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

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock window.scrollTo
window.scrollTo = vi.fn();
