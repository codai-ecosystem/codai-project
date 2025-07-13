import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'

// Mock framer-motion for test compatibility
vi.mock('framer-motion', () => ({
    motion: {
        div: 'div',
        section: 'section',
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        p: 'p',
        span: 'span',
        button: 'button',
        nav: 'nav',
        header: 'header',
        footer: 'footer',
        ul: 'ul',
        li: 'li',
        a: 'a',
        form: 'form',
        input: 'input',
        textarea: 'textarea',
        img: 'img',
        svg: 'svg'
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn()
    }),
    useInView: () => true,
    useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
    useTransform: () => 0
}))

// Mock DOM APIs
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
        dispatchEvent: vi.fn()
    }))
})

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }))
})

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }))
})

// Global test setup
beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
})
