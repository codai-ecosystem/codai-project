/**
 * Anti-Mock Data Guard
 * Prevents introduction of mock/fake data in development
 */

import React from 'react'

// Forbidden patterns that indicate mock data
const FORBIDDEN_MOCK_PATTERNS = [
  // Numbers that look like mock data
  /\b12\.4K\b/g,
  /\b98\.5%\b/g,
  /\b4\.9\/5\b/g,

  // Mock user names
  /john\.doe|jane\.smith|test\.user/gi,

  // Common mock text
  /lorem\s+ipsum/gi,
  /placeholder.*text/gi,
  /dummy.*data/gi,
  /fake.*data/gi,
  /test.*data/gi,
  /mock.*data/gi,
  /sample.*data/gi,
  /example.*data/gi,

  // Mock values
  /value:\s*['"`][^'"`]*example[^'"`]*['"`]/gi,
  /value:\s*['"`][^'"`]*test[^'"`]*['"`]/gi,
  /value:\s*['"`][^'"`]*mock[^'"`]*['"`]/gi,
  /value:\s*['"`][^'"`]*dummy[^'"`]*['"`]/gi,
  /value:\s*['"`][^'"`]*placeholder[^'"`]*['"`]/gi,

  // Hardcoded arrays with fake data
  /\[\s*{\s*id:\s*['"`]1['"`]/gi,
  /\[\s*{\s*name:\s*['"`][^'"`]*test[^'"`]*['"`]/gi,

  // Common mock API responses
  /users\/1|posts\/1|items\/1/gi,

  // Fake email patterns
  /\w+@example\.(com|org|net)/gi,
  /test.*@.*\.(com|org|net)/gi,

  // Mock phone numbers
  /555-\d{3}-\d{4}/g,
  /\(555\)\s*\d{3}-\d{4}/g,

  // Mock addresses
  /123\s+main\s+street/gi,
  /456\s+elm\s+street/gi,

  // Development/test environment hardcoded values
  /localhost:\d{4}(?!\/)/g, // Allow localhost with trailing slash for URLs
  /127\.0\.0\.1:\d{4}/g,
]

// Forbidden variable names
const FORBIDDEN_VARIABLE_NAMES = [
  'mockData',
  'fakeData',
  'testData',
  'dummyData',
  'sampleData',
  'placeholderData',
  'exampleData',
  'hardcodedData',
  'staticData'
]

/**
 * Check if code contains mock data patterns
 */
export function containsMockData(code: string): { hasMockData: boolean; violations: string[] } {
  const violations: string[] = []

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_MOCK_PATTERNS) {
    const matches = code.match(pattern)
    if (matches) {
      violations.push(`Mock data pattern detected: ${matches.join(', ')}`)
    }
  }

  // Check for forbidden variable names
  for (const varName of FORBIDDEN_VARIABLE_NAMES) {
    const regex = new RegExp(`\\b${varName}\\b`, 'gi')
    if (regex.test(code)) {
      violations.push(`Forbidden variable name: ${varName}`)
    }
  }

  return {
    hasMockData: violations.length > 0,
    violations
  }
}

/**
 * Development-time mock data prevention
 */
export function preventMockData() {
  if (process.env.NODE_ENV === 'development') {
    // Override console.warn to detect mock data warnings
    const originalWarn = console.warn
    console.warn = (...args: unknown[]) => {
      const message = args.join(' ')
      const { hasMockData, violations } = containsMockData(message)

      if (hasMockData) {
        // eslint-disable-next-line no-console
        console.error('🚫 MOCK DATA DETECTED! This is forbidden.')
        // eslint-disable-next-line no-console
        console.error('Violations:', violations)
        // eslint-disable-next-line no-console
        console.error('Please replace with real data sources.')

        // In strict mode, throw an error
        if (process.env.STRICT_NO_MOCK === 'true') {
          throw new Error('Mock data is not allowed in this project')
        }
      }

      originalWarn.apply(console, args)
    }
  }
}

/**
 * Runtime check for mock data in components
 */
export function validateRealData<T>(data: T, dataName: string): T {
  if (data === null || data === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️ ${dataName} is null/undefined - ensure real data is loaded`)
    return data
  }

  if (typeof data === 'object') {
    const jsonData = JSON.stringify(data)
    const { hasMockData, violations } = containsMockData(jsonData)

    if (hasMockData) {
      // eslint-disable-next-line no-console
      console.error(`🚫 MOCK DATA DETECTED in ${dataName}!`)
      // eslint-disable-next-line no-console
      console.error('Violations:', violations)
      // eslint-disable-next-line no-console
      console.error('Data:', data)

      if (process.env.STRICT_NO_MOCK === 'true') {
        throw new Error(`Mock data detected in ${dataName}`)
      }
    }
  }

  return data
}

/**
 * HOC to wrap components and prevent mock data
 */
export function withRealDataOnly<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return function RealDataOnlyComponent(props: P): React.ReactElement {
    // Check props for mock data
    const { hasMockData, violations } = containsMockData(JSON.stringify(props))

    if (hasMockData) {
      // eslint-disable-next-line no-console
      console.error(`🚫 MOCK DATA DETECTED in ${componentName} props!`)
      // eslint-disable-next-line no-console
      console.error('Violations:', violations)

      if (process.env.STRICT_NO_MOCK === 'true') {
        throw new Error(`Mock data detected in ${componentName}`)
      }
    }

    return React.createElement(Component, props)
  }
}
