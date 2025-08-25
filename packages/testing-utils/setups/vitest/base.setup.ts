import '@testing-library/jest-dom'
import { vi, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Clean up after each test
afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

// Setup React testing environment
beforeAll(() => {
    // Ensure React is available globally
    global.React = React
})

// Mock window.matchMedia for responsive tests
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

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock ResizeObserver  
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Basic SVG support for testing
Object.defineProperty(window, 'SVGElement', {
    writable: true,
    value: class SVGElement extends Element {
        getBBox() {
            return { x: 0, y: 0, width: 100, height: 100, top: 0, right: 100, bottom: 100, left: 0 }
        }
    }
})

// Enhanced SVG support for createElementNS
const originalCreateElementNS = document.createElementNS
document.createElementNS = function (namespaceURI: string, qualifiedName: string) {
    const element = originalCreateElementNS.call(this, namespaceURI, qualifiedName)
    if (namespaceURI === 'http://www.w3.org/2000/svg' && element) {
        (element as any).getBBox = () => ({ x: 0, y: 0, width: 100, height: 100, top: 0, right: 100, bottom: 100, left: 0 })
    }
    return element
}

// Real localStorage implementation for testing
Object.defineProperty(window, 'localStorage', {
    value: {
        store: {} as Record<string, string>,
        getItem: function (key: string) {
            return this.store[key] || null
        },
        setItem: function (key: string, value: string) {
            this.store[key] = String(value)
        },
        removeItem: function (key: string) {
            delete this.store[key]
        },
        clear: function () {
            this.store = {}
        },
    },
    writable: true,
})

// Suppress console warnings in tests
const originalWarn = console.warn
console.warn = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
         args[0].includes('Warning: React.createElement'))
    ) {
        return
    }
    originalWarn.call(console, ...args)
}

export { vi }
