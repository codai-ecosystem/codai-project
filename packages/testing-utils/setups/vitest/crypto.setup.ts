import { vi } from 'vitest'

// Comprehensive crypto mocking for test environment
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256)
            }
            return arr
        },
        createCipher: vi.fn(),
        createDecipher: vi.fn(),
        subtle: {
            digest: vi.fn(),
            encrypt: vi.fn(),
            decrypt: vi.fn(),
            generateKey: vi.fn(),
            importKey: vi.fn(),
            exportKey: vi.fn()
        }
    },
    writable: true,
    configurable: true
})

// Mock Node.js crypto module for imports
vi.mock('crypto', () => ({
    default: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
        randomBytes: vi.fn((size: number) => Buffer.alloc(size, 0)),
        createCipher: vi.fn(() => ({
            update: vi.fn(() => 'encrypted-data'),
            final: vi.fn(() => ''),
            setAutoPadding: vi.fn(),
            getAuthTag: vi.fn(() => Buffer.alloc(16, 0))
        })),
        createDecipher: vi.fn(() => ({
            update: vi.fn(() => 'decrypted-data'),
            final: vi.fn(() => ''),
            setAutoPadding: vi.fn(),
            setAuthTag: vi.fn()
        })),
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256)
            }
            return arr
        }
    },
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    randomBytes: vi.fn((size: number) => Buffer.alloc(size, 0))
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock WebCrypto API  
Object.defineProperty(window, 'crypto', {
    value: global.crypto,
    writable: true,
    configurable: true
})
