// Advanced Frontend Utility Functions
// Comprehensive utilities for modern React applications

// Performance utilities
export * from './performance-utils'

// DOM manipulation utilities
export * from './dom-utils'

// Type utilities
export * from './type-utils'

// Validation utilities
export * from './validation-utils'

// Format utilities
export * from './format-utils'

// Animation utilities
export * from './animation-utils'

// Storage utilities
export * from './storage-utils'

// URL and routing utilities
export * from './url-utils'

// Color and theme utilities
export * from './color-utils'

// Utility categories metadata
export const UTILITY_CATEGORIES = {
  PERFORMANCE: [
    'debounce',
    'throttle',
    'memoize',
    'lazy',
    'defer',
    'batch',
  ],
  DOM: [
    'createElement',
    'addClass',
    'removeClass',
    'toggleClass',
    'getElementOffset',
    'scrollTo',
  ],
  TYPE: [
    'isType',
    'assertType',
    'castType',
    'deepClone',
    'deepMerge',
    'pick',
    'omit',
  ],
  VALIDATION: [
    'isEmail',
    'isURL',
    'isPhoneNumber',
    'isValidDate',
    'validateForm',
    'sanitize',
  ],
  FORMAT: [
    'formatCurrency',
    'formatDate',
    'formatNumber',
    'formatFileSize',
    'pluralize',
    'truncate',
  ],
  ANIMATION: [
    'easing',
    'interpolate',
    'spring',
    'transition',
    'keyframes',
    'timeline',
  ],
  STORAGE: [
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'cookie',
    'cache',
    'persist',
  ],
  URL: [
    'parseURL',
    'buildURL',
    'getQueryParams',
    'setQueryParams',
    'isExternalURL',
    'isValidURL',
  ],
  COLOR: [
    'hexToRgb',
    'rgbToHex',
    'hslToRgb',
    'getContrast',
    'generatePalette',
    'isValidColor',
  ],
} as const

export type UtilityCategory = keyof typeof UTILITY_CATEGORIES
export type UtilityName = typeof UTILITY_CATEGORIES[UtilityCategory][number]

// Utility registry for dynamic imports
export const UTILITY_REGISTRY = new Map<UtilityName, () => Promise<any>>()

// Common utility interfaces
export interface UtilityDoc {
  name: UtilityName
  category: UtilityCategory
  description: string
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
    defaultValue?: any
  }>
  returns: {
    type: string
    description: string
  }
  examples: Array<{
    name: string
    code: string
    description: string
  }>
  performance: 'low' | 'medium' | 'high'
  complexity: 'simple' | 'moderate' | 'complex'
  browserSupport: string[]
  tags: string[]
}

// Utility metadata registry
export const UTILITY_DOCS = new Map<UtilityName, UtilityDoc>()

// Utility search and discovery
export const getUtilitiesByCategory = (category: UtilityCategory): readonly string[] => {
  return UTILITY_CATEGORIES[category]
}

export const getAllUtilities = (): UtilityName[] => {
  return Object.values(UTILITY_CATEGORIES).flat()
}

export const searchUtilities = (query: string): UtilityDoc[] => {
  const results: UtilityDoc[] = []
  const searchTerm = query.toLowerCase()

  for (const [name, doc] of UTILITY_DOCS.entries()) {
    if (
      name.toLowerCase().includes(searchTerm) ||
      doc.description.toLowerCase().includes(searchTerm) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    ) {
      results.push(doc)
    }
  }

  return results
}

// Utility composition helpers
export const pipe = <T>(...functions: Array<(arg: T) => T>) => (value: T): T => {
  return functions.reduce((acc, fn) => fn(acc), value)
}

export const compose = <T>(...functions: Array<(arg: T) => T>) => (value: T): T => {
  return functions.reduceRight((acc, fn) => fn(acc), value)
}

export const curry = <T extends any[], R>(
  fn: (...args: T) => R
) => {
  return function curried(...args: Partial<T>): any {
    if (args.length >= fn.length) {
      return fn(...(args as T))
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs)
  }
}

// Async utility helpers
export const promisify = <T extends any[], R>(
  fn: (...args: [...T, (error: any, result: R) => void]) => void
) => {
  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      fn(...args, (error: any, result: R) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}

export const promiseTimeout = <T>(
  promise: Promise<T>,
  timeout: number,
  timeoutMessage = 'Promise timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeout)
    }),
  ])
}

export const promiseRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return promiseRetry(fn, retries - 1, delay)
    }
    throw error
  }
}

// Error handling utilities
export class AdvancedError extends Error {
  public code: string
  public context: Record<string, any>
  public timestamp: number

  constructor(
    message: string,
    code: string = 'GENERIC_ERROR',
    context: Record<string, any> = {}
  ) {
    super(message)
    this.name = 'AdvancedError'
    this.code = code
    this.context = context
    this.timestamp = Date.now()

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AdvancedError)
    }
  }
}

export const createErrorHandler = (
  options: {
    logError?: (error: Error) => void
    reportError?: (error: Error) => void
    fallbackValue?: any
    throwOnError?: boolean
  } = {}
) => {
  const {
    logError = console.error,
    reportError = () => { },
    fallbackValue = null,
    throwOnError = false,
  } = options

  return <T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args)

        if (result instanceof Promise) {
          return result.catch((error: Error) => {
            logError(error)
            reportError(error)

            if (throwOnError) {
              throw error
            }

            return fallbackValue
          })
        }

        return result
      } catch (error) {
        logError(error as Error)
        reportError(error as Error)

        if (throwOnError) {
          throw error
        }

        return fallbackValue
      }
    }) as T
  }
}

// Event system utilities
export class EventEmitter<T extends Record<string, any[]> = Record<string, any[]>> {
  private events: { [K in keyof T]?: Array<(...args: T[K]) => void> } = {}

  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): () => void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event]!.push(listener)

    // Return unsubscribe function
    return () => this.off(event, listener)
  }

  off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
    if (this.events[event]) {
      const index = this.events[event]!.indexOf(listener)
      if (index > -1) {
        this.events[event]!.splice(index, 1)
      }
    }
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    if (this.events[event]) {
      this.events[event]!.forEach(listener => listener(...args))
    }
  }

  once<K extends keyof T>(event: K, listener: (...args: T[K]) => void): () => void {
    const onceWrapper = (...args: T[K]) => {
      listener(...args)
      this.off(event, onceWrapper)
    }

    return this.on(event, onceWrapper)
  }

  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
  }

  listenerCount<K extends keyof T>(event: K): number {
    return this.events[event]?.length || 0
  }

  eventNames(): (keyof T)[] {
    return Object.keys(this.events) as (keyof T)[]
  }
}

// Functional programming utilities
export const identity = <T>(x: T): T => x

export const constant = <T>(value: T) => (): T => value

export const noop = (): void => { }

export const once = <T extends (...args: any[]) => any>(fn: T): T => {
  let called = false
  let result: ReturnType<T>

  return ((...args: Parameters<T>) => {
    if (!called) {
      called = true
      result = fn(...args)
    }
    return result
  }) as T
}

export const after = <T extends (...args: any[]) => any>(
  count: number,
  fn: T
): T => {
  let callCount = 0

  return ((...args: Parameters<T>) => {
    callCount++
    if (callCount >= count) {
      return fn(...args)
    }
  }) as T
}

export const before = <T extends (...args: any[]) => any>(
  count: number,
  fn: T
): T => {
  let callCount = 0
  let lastResult: ReturnType<T>

  return ((...args: Parameters<T>) => {
    if (callCount < count) {
      callCount++
      lastResult = fn(...args)
    }
    return lastResult
  }) as T
}

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export const flatten = <T>(array: (T | T[])[]): T[] => {
  return array.reduce<T[]>((acc, val) => {
    return Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val)
  }, [])
}

export const unique = <T>(array: T[], key?: (item: T) => any): T[] => {
  if (key) {
    const seen = new Set()
    return array.filter(item => {
      const k = key(item)
      if (seen.has(k)) {
        return false
      }
      seen.add(k)
      return true
    })
  }
  return [...new Set(array)]
}

export const groupBy = <T, K extends string | number | symbol>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const group = key(item)
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

// Object utilities
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) {
    return true
  }

  if (obj1 == null || obj2 == null) {
    return false
  }

  if (typeof obj1 !== typeof obj2) {
    return false
  }

  if (typeof obj1 !== 'object') {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false
    }

    if (!deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as { [K in keyof T]: T[K] }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}
