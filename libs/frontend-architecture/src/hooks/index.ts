// Advanced React Hooks Collection
// Performance-optimized and accessibility-focused custom hooks

// Performance hooks
export * from './performance-hooks'

// State management hooks
export * from './state-hooks'

// Effect and lifecycle hooks
export * from './lifecycle-hooks'

// DOM and browser API hooks
export * from './dom-hooks'

// Accessibility hooks
export * from './accessibility-hooks'

// Animation and interaction hooks
export * from './animation-hooks'

// Form and validation hooks
export * from './form-hooks'

// Data fetching hooks
export * from './data-hooks'

// Utility hooks
export * from './utility-hooks'

// Hook categories metadata
export const HOOK_CATEGORIES = {
  PERFORMANCE: [
    'useMemoizedCallback',
    'useStableCallback',
    'useDebounce',
    'useThrottle',
    'useVirtualization',
    'useLazyLoad',
  ],
  STATE: [
    'usePersistedState',
    'useUndoRedo',
    'useToggle',
    'useCounter',
    'useList',
    'useMap',
    'useSet',
  ],
  LIFECYCLE: [
    'useMount',
    'useUnmount',
    'useUpdateEffect',
    'usePrevious',
    'useDeepCompareEffect',
    'useInterval',
    'useTimeout',
  ],
  DOM: [
    'useClickOutside',
    'useIntersectionObserver',
    'useResizeObserver',
    'useMutationObserver',
    'useEventListener',
    'useMediaQuery',
    'useElementSize',
  ],
  ACCESSIBILITY: [
    'useFocusManagement',
    'useAriaAnnouncer',
    'useKeyboardNavigation',
    'useScreenReader',
    'useColorScheme',
    'useReducedMotion',
  ],
  ANIMATION: [
    'useSpring',
    'useGesture',
    'useParallax',
    'useScrollAnimation',
    'useInViewAnimation',
    'useHover',
  ],
  FORM: [
    'useForm',
    'useFieldValidation',
    'useFormPersistence',
    'useFileUpload',
    'useAutoSave',
  ],
  DATA: [
    'useFetch',
    'useInfiniteQuery',
    'useWebSocket',
    'useServerSentEvents',
    'useOptimisticUpdate',
  ],
  UTILITY: [
    'useCopyToClipboard',
    'useLocalStorage',
    'useSessionStorage',
    'useGeolocation',
    'useOnlineStatus',
    'useBattery',
  ],
} as const

export type HookCategory = keyof typeof HOOK_CATEGORIES
export type HookName = typeof HOOK_CATEGORIES[HookCategory][number]

// Hook registry for dynamic imports
export const HOOK_REGISTRY = new Map<HookName, () => Promise<any>>()

// Hook documentation interface
export interface HookDoc {
  name: HookName
  category: HookCategory
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
  dependencies: string[]
  performance: 'low' | 'medium' | 'high'
  complexity: 'beginner' | 'intermediate' | 'advanced'
  accessibility: boolean
  testable: boolean
  tags: string[]
}

// Hook metadata registry
export const HOOK_DOCS = new Map<HookName, HookDoc>()

// Hook utilities
export const getHooksByCategory = (category: HookCategory): readonly string[] => {
  return HOOK_CATEGORIES[category]
}

export const getAllHooks = (): HookName[] => {
  return Object.values(HOOK_CATEGORIES).flat()
}

export const searchHooks = (query: string): HookDoc[] => {
  const results: HookDoc[] = []
  const searchTerm = query.toLowerCase()

  for (const [name, doc] of HOOK_DOCS.entries()) {
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

// Hook recommendation engine
export interface HookRecommendation {
  hook: HookName
  score: number
  reasoning: string
  alternatives: HookName[]
  requirements: string[]
}

export const recommendHooks = (
  requirements: {
    category?: HookCategory
    performance?: 'low' | 'medium' | 'high'
    complexity?: 'beginner' | 'intermediate' | 'advanced'
    accessibility?: boolean
    testable?: boolean
    tags?: string[]
  }
): HookRecommendation[] => {
  const recommendations: HookRecommendation[] = []

  for (const [name, doc] of HOOK_DOCS.entries()) {
    let score = 0
    let reasoning = []

    if (requirements.category && doc.category === requirements.category) {
      score += 30
      reasoning.push(`Matches category: ${requirements.category}`)
    }

    if (requirements.performance && doc.performance === requirements.performance) {
      score += 20
      reasoning.push(`Meets performance requirement: ${requirements.performance}`)
    }

    if (requirements.complexity && doc.complexity === requirements.complexity) {
      score += 15
      reasoning.push(`Matches complexity level: ${requirements.complexity}`)
    }

    if (requirements.accessibility && doc.accessibility) {
      score += 20
      reasoning.push('Provides accessibility features')
    }

    if (requirements.testable && doc.testable) {
      score += 10
      reasoning.push('Easily testable')
    }

    if (requirements.tags) {
      const matchingTags = doc.tags.filter(tag =>
        requirements.tags!.some(reqTag => tag.toLowerCase().includes(reqTag.toLowerCase()))
      )
      if (matchingTags.length > 0) {
        score += matchingTags.length * 5
        reasoning.push(`Matches tags: ${matchingTags.join(', ')}`)
      }
    }

    if (score > 0) {
      // Find similar hooks as alternatives
      const alternatives = Array.from(HOOK_DOCS.entries())
        .filter(([altName, altDoc]) =>
          altName !== name &&
          altDoc.category === doc.category &&
          altDoc.tags.some(tag => doc.tags.includes(tag))
        )
        .map(([altName]) => altName)
        .slice(0, 3)

      recommendations.push({
        hook: name,
        score,
        reasoning: reasoning.join('; '),
        alternatives,
        requirements: doc.dependencies,
      })
    }
  }

  return recommendations.sort((a, b) => b.score - a.score)
}

// Hook composition utilities
export const composeHooks = <T extends any[]>(...hooks: T): T => {
  return hooks
}

export const conditionalHook = <T>(
  condition: boolean,
  hook: () => T,
  fallback?: () => T
): T | undefined => {
  if (condition) {
    return hook()
  }
  return fallback?.()
}

// Hook testing utilities
export interface HookTestUtils {
  renderHook: <T>(hook: () => T) => { result: { current: T }; rerender: () => void }
  act: (callback: () => void) => void
  waitFor: (callback: () => void) => Promise<void>
}

export const createHookTestUtils = (): HookTestUtils => {
  // Placeholder implementation - would integrate with @testing-library/react-hooks
  return {
    renderHook: (hook) => ({
      result: { current: hook() },
      rerender: () => { }
    }),
    act: (callback) => callback(),
    waitFor: async (callback) => callback(),
  }
}

// Performance monitoring for hooks
export interface HookPerformanceMetrics {
  hookName: string
  renderCount: number
  averageExecutionTime: number
  memoryUsage: number
  dependencyChanges: number
}

export const monitorHookPerformance = (
  hookName: string,
  hook: () => any
): HookPerformanceMetrics => {
  // Placeholder implementation - would use React DevTools Profiler API
  return {
    hookName,
    renderCount: 0,
    averageExecutionTime: 0,
    memoryUsage: 0,
    dependencyChanges: 0,
  }
}

// Hook pattern validation
export const validateHookPattern = (hookFunction: Function): {
  isValid: boolean
  errors: string[]
  suggestions: string[]
} => {
  const errors: string[] = []
  const suggestions: string[] = []

  // Check if hook name starts with 'use'
  if (!hookFunction.name.startsWith('use')) {
    errors.push('Hook name must start with "use"')
    suggestions.push('Rename the function to start with "use"')
  }

  // Additional pattern validation would go here

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
  }
}
