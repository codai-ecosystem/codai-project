/**
 * Global Test Setup for CODAI Ecosystem
 * Provides standardized testing utilities across all apps
 */

// Re-export testing utilities from vitest and testing-library
export { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest'
export { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Test configuration constants
export const TEST_TIMEOUT = 10000
export const LONG_TEST_TIMEOUT = 30000

// Mock Next.js Image component
import React from 'react'
import { vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Global setup
beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
})

afterEach(() => {
    // Cleanup after each test
    cleanup()
})

// Mock Next.js router
vi.mock('next/router', () => ({
    useRouter: () => ({
        route: '/',
        pathname: '/',
        query: {},
        asPath: '/',
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        reload: vi.fn(),
        events: {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
        },
    }),
}))

// Mock Next.js Image
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }) =>
        React.createElement('img', { src, alt, ...props })
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => React.createElement('div', props, children),
        header: ({ children, ...props }) => React.createElement('header', props, children),
        h1: ({ children, ...props }) => React.createElement('h1', props, children),
        h2: ({ children, ...props }) => React.createElement('h2', props, children),
        h3: ({ children, ...props }) => React.createElement('h3', props, children),
        p: ({ children, ...props }) => React.createElement('p', props, children),
        span: ({ children, ...props }) => React.createElement('span', props, children),
        button: ({ children, ...props }) => React.createElement('button', props, children),
        nav: ({ children, ...props }) => React.createElement('nav', props, children),
        section: ({ children, ...props }) => React.createElement('section', props, children),
        article: ({ children, ...props }) => React.createElement('article', props, children),
        aside: ({ children, ...props }) => React.createElement('aside', props, children),
        footer: ({ children, ...props }) => React.createElement('footer', props, children),
        main: ({ children, ...props }) => React.createElement('main', props, children),
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn(),
    }),
}))

// Global test utilities
export const testUtils = {
    // Wait for component to stabilize
    waitForStable: () => waitFor(() => expect(true).toBe(true), { timeout: 1000 }),

    // Mock window methods
    mockWindowMethods: () => {
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
    },

    // Setup intersection observer mock
    mockIntersectionObserver: () => {
        global.IntersectionObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        }))
    },
}

// Initialize global mocks
testUtils.mockWindowMethods()
testUtils.mockIntersectionObserver()

