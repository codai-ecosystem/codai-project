// Performance-Optimized React Hooks
// Advanced hooks for performance optimization and efficient rendering

import {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  DependencyList,
  EffectCallback,
  MutableRefObject,
} from 'react'

// Stable callback hook that never changes reference unless dependencies change
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T => {
  const ref = useRef<T>(callback)

  useLayoutEffect(() => {
    ref.current = callback
  })

  return useCallback(
    ((...args) => ref.current(...args)) as T,
    deps
  )
}

// Stable callback that never changes reference
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const ref = useRef<T>(callback)

  useLayoutEffect(() => {
    ref.current = callback
  })

  return useCallback(
    ((...args) => ref.current(...args)) as T,
    []
  )
}

// Debounced value hook with configurable delay
export const useDebounce = <T>(
  value: T,
  delay: number,
  options?: {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
  }
): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const maxTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastCallTimeRef = useRef<number | undefined>(undefined)
  const { leading = false, trailing = true, maxWait } = options || {}

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastCall = lastCallTimeRef.current ? now - lastCallTimeRef.current : 0

    const shouldCallLeading = leading && !lastCallTimeRef.current
    const shouldScheduleTrailing = trailing

    if (shouldCallLeading) {
      setDebouncedValue(value)
      lastCallTimeRef.current = now
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set up trailing call
    if (shouldScheduleTrailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value)
        lastCallTimeRef.current = Date.now()
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current)
          maxTimeoutRef.current = undefined
        }
      }, delay)
    }

    // Handle maxWait
    if (maxWait && !maxTimeoutRef.current && lastCallTimeRef.current) {
      const remainingTime = maxWait - timeSinceLastCall
      if (remainingTime <= 0) {
        setDebouncedValue(value)
        lastCallTimeRef.current = now
      } else {
        maxTimeoutRef.current = setTimeout(() => {
          setDebouncedValue(value)
          lastCallTimeRef.current = Date.now()
          maxTimeoutRef.current = undefined
        }, remainingTime)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current)
      }
    }
  }, [value, delay, leading, trailing, maxWait])

  return debouncedValue
}

// Throttled value hook with configurable delay
export const useThrottle = <T>(
  value: T,
  delay: number,
  options?: {
    leading?: boolean
    trailing?: boolean
  }
): T => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastExecutedRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { leading = true, trailing = true } = options || {}

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecutedRef.current

    const shouldExecuteLeading = leading && timeSinceLastExecution >= delay
    const shouldScheduleTrailing = trailing && timeSinceLastExecution < delay

    if (shouldExecuteLeading) {
      setThrottledValue(value)
      lastExecutedRef.current = now
    } else if (shouldScheduleTrailing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value)
        lastExecutedRef.current = Date.now()
      }, delay - timeSinceLastExecution)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay, leading, trailing])

  return throttledValue
}

// Virtualization hook for large lists
export interface VirtualizationOptions {
  itemHeight: number
  containerHeight: number
  itemCount: number
  overscan?: number
  scrollElement?: HTMLElement | null
}

export interface VirtualizationResult {
  visibleStartIndex: number
  visibleEndIndex: number
  offsetY: number
  visibleItems: Array<{ index: number; offsetY: number }>
}

export const useVirtualization = (
  options: VirtualizationOptions
): VirtualizationResult => {
  const { itemHeight, containerHeight, itemCount, overscan = 5, scrollElement } = options
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    if (!scrollElement) return

    const handleScroll = () => {
      setScrollTop(scrollElement.scrollTop)
    }

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [scrollElement])

  const result = useMemo((): VirtualizationResult => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + visibleItemCount, itemCount - 1)

    const visibleStartIndex = Math.max(0, startIndex - overscan)
    const visibleEndIndex = Math.min(itemCount - 1, endIndex + overscan)
    const offsetY = visibleStartIndex * itemHeight

    const visibleItems = []
    for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
      visibleItems.push({
        index: i,
        offsetY: i * itemHeight,
      })
    }

    return {
      visibleStartIndex,
      visibleEndIndex,
      offsetY,
      visibleItems,
    }
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan])

  return result
}

// Lazy loading hook with intersection observer
export interface LazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  fallbackInView?: boolean
}

export const useLazyLoad = (
  options: LazyLoadOptions = {}
): [MutableRefObject<HTMLElement | null>, boolean, () => void] => {
  const { threshold = 0, rootMargin = '50px', triggerOnce = true, fallbackInView = false } = options
  const [inView, setInView] = useState(fallbackInView)
  const ref = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  const observe = useCallback(() => {
    if (ref.current && 'IntersectionObserver' in window) {
      disconnect()

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          const isIntersecting = entry.isIntersecting
          setInView(isIntersecting)

          if (isIntersecting && triggerOnce) {
            disconnect()
          }
        },
        {
          threshold,
          rootMargin,
        }
      )

      observerRef.current.observe(ref.current)
    }
  }, [threshold, rootMargin, triggerOnce, disconnect])

  useEffect(() => {
    observe()
    return disconnect
  }, [observe, disconnect])

  useEffect(() => {
    if (!ref.current && inView && triggerOnce) {
      setInView(false)
    }
  }, [inView, triggerOnce])

  return [ref, inView, disconnect]
}

// RAF-based animation hook
export const useRafState = <T>(
  initialState: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState(initialState)
  const rafRef = useRef<number | undefined>(undefined)

  const setRafState = useCallback((value: T | ((prev: T) => T)) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      setState(value)
    })
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return [state, setRafState]
}

// Idle callback hook
export const useIdleCallback = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): void => {
  const callbackRef = useRef(callback)
  const optionsRef = useRef(options)

  useLayoutEffect(() => {
    callbackRef.current = callback
    optionsRef.current = options
  })

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(
        (deadline) => callbackRef.current(deadline),
        optionsRef.current
      )

      return () => cancelIdleCallback(id)
    } else {
      // Fallback for browsers without requestIdleCallback
      const id = setTimeout(() => {
        callbackRef.current({
          didTimeout: false,
          timeRemaining: () => 50, // Assume 50ms available
        } as IdleDeadline)
      }, 1)

      return () => clearTimeout(id)
    }
  }, [])
}

// Memory usage monitoring hook
export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export const useMemoryInfo = (interval: number = 1000): MemoryInfo | null => {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        })
      }
    }

    updateMemoryInfo()
    const intervalId = setInterval(updateMemoryInfo, interval)

    return () => clearInterval(intervalId)
  }, [interval])

  return memoryInfo
}

// Render tracking hook for performance debugging
export const useRenderCount = (name?: string): number => {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
    if (name && process.env.NODE_ENV === 'development') {
      console.log(`${name} rendered ${renderCount.current} times`)
    }
  })

  return renderCount.current
}

// Why did you update hook for debugging unnecessary re-renders
export const useWhyDidYouUpdate = (
  name: string,
  props: Record<string, any>
): void => {
  const previousProps = useRef<Record<string, any> | undefined>(undefined)

  useEffect(() => {
    if (previousProps.current && process.env.NODE_ENV === 'development') {
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      const changedProps: Record<string, { from: any; to: any }> = {}

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          }
        }
      })

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps)
      }
    }

    previousProps.current = props
  })
}

// Performance hooks documentation
export const PERFORMANCE_HOOKS = {
  useMemoizedCallback: {
    description: 'Creates a memoized callback that only changes when dependencies change',
    performance: 'high',
    useCase: 'Preventing unnecessary re-renders in child components',
  },
  useStableCallback: {
    description: 'Creates a callback that never changes reference',
    performance: 'high',
    useCase: 'Event handlers that should never trigger re-renders',
  },
  useDebounce: {
    description: 'Debounces a value with configurable options',
    performance: 'medium',
    useCase: 'Search inputs, API calls, expensive computations',
  },
  useThrottle: {
    description: 'Throttles a value with configurable options',
    performance: 'medium',
    useCase: 'Scroll handlers, resize handlers, frequent updates',
  },
  useVirtualization: {
    description: 'Implements virtual scrolling for large lists',
    performance: 'high',
    useCase: 'Large datasets, infinite lists, performance-critical rendering',
  },
  useLazyLoad: {
    description: 'Lazy loading with intersection observer',
    performance: 'high',
    useCase: 'Images, components, content below the fold',
  },
} as const
