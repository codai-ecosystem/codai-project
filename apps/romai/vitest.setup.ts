import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Clean up after each test
afterEach(() => {
    cleanup();
});

// Mock IntersectionObserver for components that use it
beforeAll(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));

    // Mock scrollTo for components that use it
    global.scrollTo = vi.fn();

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

    // Mock fetch for API calls
    global.fetch = vi.fn();
});

// Mock Next.js router
vi.mock('next/router', () => ({
    useRouter: () => ({
        route: '/',
        pathname: '/',
        query: {},
        asPath: '/',
        push: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
        back: vi.fn(),
        prefetch: vi.fn(),
        beforePopState: vi.fn(),
        events: {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
        },
    }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={ src } alt = { alt } {...props
} />;
  },
}));

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
