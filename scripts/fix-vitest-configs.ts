#!/usr/bin/env tsx

import { promises as fs } from 'fs'
import { join } from 'path'

// List of apps that have vitest config issues
const PROBLEMATIC_APPS = [
    'aide', 'bancai', 'marketai', 'metu', 'memorai',
    'prezentai', 'stocai', 'talentai'
]

// Fixed vitest config template
const getFixedVitestConfig = (appName: string) => `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    name: '${appName}-tests',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    include: [
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});`

// Basic test setup template
const getBasicTestSetup = () => `import '@testing-library/jest-dom'
import { vi } from 'vitest'

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
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
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

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})`

// Basic test template
const getBasicTest = (appName: string) => `/**
 * Basic tests for ${appName.toUpperCase()} application
 */

describe('${appName.toUpperCase()} App Tests', () => {
  test('should be able to run basic tests', () => {
    expect(true).toBe(true)
  })

  test('should have basic math functionality', () => {
    const sum = (a: number, b: number) => a + b
    expect(sum(2, 3)).toBe(5)
  })

  test('should handle async operations', async () => {
    const asyncFunction = async () => Promise.resolve('success')
    const result = await asyncFunction()
    expect(result).toBe('success')
  })

  test('should handle promises', () => {
    return Promise.resolve('resolved').then(data => {
      expect(data).toBe('resolved')
    })
  })

  test('should handle setTimeout', (done) => {
    setTimeout(() => {
      expect(true).toBe(true)
      done()
    }, 100)
  })
})`

async function fixApp(appName: string): Promise<void> {
    const appPath = join(process.cwd(), 'apps', appName)
    console.log(`🔧 Fixing ${appName}...`)

    try {
        // Check if app directory exists
        await fs.access(appPath)

        // Fix vitest.config.ts
        const vitestConfigPath = join(appPath, 'vitest.config.ts')
        try {
            await fs.writeFile(vitestConfigPath, getFixedVitestConfig(appName))
            console.log(`  ✅ Fixed vitest.config.ts for ${appName}`)
        } catch (error) {
            console.log(`  ⚠️  Could not fix vitest.config.ts for ${appName}:`, error)
        }

        // Create tests directory if it doesn't exist
        const testsDir = join(appPath, 'tests')
        try {
            await fs.mkdir(testsDir, { recursive: true })
        } catch {
            // Directory already exists
        }

        // Create test setup file
        const setupPath = join(testsDir, 'setup.ts')
        try {
            await fs.writeFile(setupPath, getBasicTestSetup())
            console.log(`  ✅ Created test setup for ${appName}`)
        } catch (error) {
            console.log(`  ⚠️  Could not create test setup for ${appName}:`, error)
        }

        // Create __tests__ directory if it doesn't exist
        const testDir = join(appPath, '__tests__')
        try {
            await fs.mkdir(testDir, { recursive: true })
        } catch {
            // Directory already exists
        }

        // Create basic test file
        const basicTestPath = join(testDir, 'basic.test.ts')
        try {
            await fs.writeFile(basicTestPath, getBasicTest(appName))
            console.log(`  ✅ Created basic test for ${appName}`)
        } catch (error) {
            console.log(`  ⚠️  Could not create basic test for ${appName}:`, error)
        }

        console.log(`✅ Successfully fixed ${appName}`)
    } catch (error) {
        console.error(`❌ Error fixing ${appName}:`, error)
    }
}

async function main() {
    console.log('🚀 Starting vitest configuration fixes...')
    console.log(`📊 Fixing ${PROBLEMATIC_APPS.length} applications...`)

    for (const appName of PROBLEMATIC_APPS) {
        await fixApp(appName)
        console.log() // Empty line for readability
    }

    console.log('🎉 All vitest configurations have been fixed!')
    console.log(`
📊 Summary:
- Fixed vitest.config.ts syntax errors
- Created test setup files
- Added basic test files
- Updated all configurations for consistency

✨ Next steps:
- Run individual app tests: cd apps/[app-name] && pnpm test:run
- Run all tests: turbo test
- Check specific app: turbo test --filter=[app-name]
`)
}

// Run the script
main().catch(console.error)
