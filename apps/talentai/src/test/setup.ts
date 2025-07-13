import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
}

vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
    Send: vi.fn(() => 'Send Icon'),
    Bot: vi.fn(() => 'Bot Icon'),
    User: vi.fn(() => 'User Icon'),
    Briefcase: vi.fn(() => 'Briefcase Icon'),
    Users: vi.fn(() => 'Users Icon'),
    Star: vi.fn(() => 'Star Icon'),
    TrendingUp: vi.fn(() => 'TrendingUp Icon'),
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

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
})
