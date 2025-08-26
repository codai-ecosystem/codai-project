/**
 * 🧪 React 19 Compatible Test Environment
 * Specialized environment configuration for React 19.1.1 compatibility with Vitest
 */

import { beforeAll, afterAll, vi } from 'vitest'
import { configure } from '@testing-library/react'

// React 19 specific global configuration
beforeAll(() => {
    // Silence React 19 specific warnings in test environment
    const originalError = console.error
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOMTestUtils.act is deprecated') ||
                args[0].includes('Warning: React.createRef is deprecated') ||
                args[0].includes('Warning: validateDOMNesting') ||
                args[0].includes('Warning: Each child in a list should have') ||
                args[0].includes('Objects are not valid as a React child'))
        ) {
            return
        }
        originalError.call(console, ...args)
    }

    // Configure React Testing Library for React 19
    configure({
        testIdAttribute: 'data-testid',
        asyncUtilTimeout: 5000,
        computedStyleSupportsPseudoElements: false,
    })

    // Mock React 19 specific APIs that might not be available in test environment
    if (typeof window !== 'undefined') {
        // React 19 Concurrent Features mock
        if (!window.requestIdleCallback) {
            window.requestIdleCallback = (callback: IdleRequestCallback) => {
                return window.setTimeout(() => callback({ timeRemaining: () => 50, didTimeout: false }), 1) as unknown as number
            }
        }

        if (!window.cancelIdleCallback) {
            window.cancelIdleCallback = clearTimeout
        }

        // React 19 Scheduler mock
        if (!window.MessageChannel) {
            window.MessageChannel = class {
                port1 = { onmessage: null, postMessage: vi.fn() }
                port2 = { onmessage: null, postMessage: vi.fn() }
            } as any
        }
    }

    // Mock React 19 specific features
    global.React = require('react')
    global.ReactDOM = require('react-dom')
})

afterAll(() => {
    // Cleanup React 19 specific mocks
    delete (global as any).React
    delete (global as any).ReactDOM
})

export { }
