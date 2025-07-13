import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
    cleanup()
})

// Minimal framer-motion mock - string mapping approach
vi.mock('framer-motion', () => ({
    motion: {
        div: 'div',
        span: 'span',
        button: 'button',
        form: 'form',
        input: 'input',
        textarea: 'textarea',
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        p: 'p',
        a: 'a',
        img: 'img',
        section: 'section',
        article: 'article',
        nav: 'nav',
        header: 'header',
        footer: 'footer',
        main: 'main',
        aside: 'aside'
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn()
    }),
    useInView: () => true,
    useMotionValue: (initial: any) => ({ get: () => initial, set: vi.fn() }),
    useSpring: (value: any) => value,
    useTransform: (value: any, input: any, output: any) => value,
    animate: vi.fn()
}))

// Mock useVoice hook
vi.mock('../src/hooks/useVoice', () => ({
    useVoice: () => ({
        voiceState: 'idle',
        messages: [],
        isSupported: true,
        settings: {
            language: 'en-US',
            volume: 0.8,
            rate: 1.0,
            pitch: 1.0,
            enabled: true
        },
        startListening: vi.fn(),
        stopListening: vi.fn(),
        speak: vi.fn(),
        stopSpeaking: vi.fn(),
        updateSettings: vi.fn(),
        clearMessages: vi.fn()
    })
}))

// Mock Speech Recognition APIs
Object.defineProperty(window, 'SpeechRecognition', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        abort: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        continuous: true,
        interimResults: true,
        lang: 'en-US'
    }))
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
    writable: true,
    value: window.SpeechRecognition
})

// Mock Speech Synthesis APIs
Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => []),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    }
})

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    writable: true,
    value: vi.fn().mockImplementation((text) => ({
        text,
        voice: null,
        volume: 1,
        rate: 1,
        pitch: 1,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    }))
})

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

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock performance API
Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
        mark: vi.fn(),
        measure: vi.fn(),
        now: () => Date.now(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => [])
    }
})
