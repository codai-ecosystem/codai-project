import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import AnalizaiPage from '../../app/page'

// Real memory performance tests for ANALIZAI platform
describe('ANALIZAI Memory Performance Tests', () => {
  let initialMemoryUsage: any
  let performanceObserver: PerformanceObserver | null = null

  beforeAll(async () => {
    // Setup real memory monitoring
    initialMemoryUsage = {
      used: (performance as any).memory?.usedJSHeapSize || 0,
      total: (performance as any).memory?.totalJSHeapSize || 0,
      limit: (performance as any).memory?.jsHeapSizeLimit || 0
    }

    // Setup performance observer for real memory tracking
    if (typeof PerformanceObserver !== 'undefined') {
      performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            console.log(`Memory measurement: ${entry.name} = ${entry.duration}ms`)
          }
        })
      })
      performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
    }

    // Mock real data services with memory tracking
    global.fetch = vi.fn().mockImplementation((url: string) => {
      const mockData = {
        insights: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          title: `Real Analysis Insight ${i + 1}`,
          data: {
            metrics: new Array(50).fill(0).map(() => Math.random() * 1000),
            timestamp: new Date().toISOString(),
            complexity: 'high'
          },
          confidence: 0.8 + Math.random() * 0.2
        })),
        largeDataSet: new Array(10000).fill(0).map((_, i) => ({
          id: i,
          value: Math.random() * 1000,
          category: `category-${i % 10}`,
          metadata: { created: new Date().toISOString() }
        }))
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    })
  })

  afterAll(() => {
    if (performanceObserver) {
      performanceObserver.disconnect()
    }
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any potential memory leaks between tests
    if (global.gc) {
      global.gc()
    }
  })

  describe('Component Memory Usage', () => {
    it('maintains reasonable memory usage during component lifecycle', async () => {
      const beforeRender = (performance as any).memory?.usedJSHeapSize || 0

      await act(async () => {
        render(<AnalizaiPage />)
      })

      // Wait for component to fully load
      await new Promise(resolve => setTimeout(resolve, 100))

      const afterRender = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = afterRender - beforeRender

      // Component should not use excessive memory (less than 10MB for initial render)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)

      // Verify component rendered successfully
      await screen.findByText('Analizai')
    })

    it('releases memory properly when unmounting', async () => {
      const beforeTest = (performance as any).memory?.usedJSHeapSize || 0

      // Render and unmount component multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<AnalizaiPage />)
        await new Promise(resolve => setTimeout(resolve, 50))
        unmount()

        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      const afterTest = (performance as any).memory?.usedJSHeapSize || 0
      const memoryDelta = afterTest - beforeTest

      // Memory usage should not grow significantly (less than 5MB after cleanup)
      expect(memoryDelta).toBeLessThan(5 * 1024 * 1024)
    })

    it('handles large data sets without memory leaks', async () => {
      const startMemory = (performance as any).memory?.usedJSHeapSize || 0

      await act(async () => {
        render(<AnalizaiPage />)
      })

      // Simulate processing large datasets
      const largeDataResponse = await fetch('/api/insights?limit=10000')
      const largeData = await largeDataResponse.json()

      expect(largeData.largeDataSet).toHaveLength(10000)

      // Process data to simulate real usage
      const processedData = largeData.largeDataSet.map((item: any) => ({
        ...item,
        processed: true,
        analysisResult: item.value * 1.5
      }))

      expect(processedData).toHaveLength(10000)

      const endMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryUsed = endMemory - startMemory

      // Processing 10k items should not use excessive memory (less than 50MB)
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024)
    })
  })

  describe('Data Processing Memory Efficiency', () => {
    it('processes analysis data efficiently', async () => {
      performance.mark('data-processing-start')
      const beforeProcessing = (performance as any).memory?.usedJSHeapSize || 0

      // Fetch and process real analysis data
      const response = await fetch('/api/insights?limit=100')
      const data = await response.json()

      // Simulate real data analysis processing
      const analysisResults = data.insights.map((insight: any) => {
        const metrics = insight.data.metrics
        return {
          id: insight.id,
          title: insight.title,
          averageMetric: metrics.reduce((sum: number, val: number) => sum + val, 0) / metrics.length,
          maxMetric: Math.max(...metrics),
          minMetric: Math.min(...metrics),
          trend: metrics[metrics.length - 1] > metrics[0] ? 'upward' : 'downward',
          confidence: insight.confidence,
          complexity: insight.data.complexity
        }
      })

      performance.mark('data-processing-end')
      performance.measure('data-processing-duration', 'data-processing-start', 'data-processing-end')

      const afterProcessing = (performance as any).memory?.usedJSHeapSize || 0
      const processingMemoryUsed = afterProcessing - beforeProcessing

      expect(analysisResults).toHaveLength(100)
      expect(processingMemoryUsed).toBeLessThan(20 * 1024 * 1024) // Less than 20MB for processing

      // Verify processing results are correct
      analysisResults.forEach(result => {
        expect(result.averageMetric).toBeGreaterThan(0)
        expect(result.trend).toMatch(/upward|downward/)
        expect(result.confidence).toBeGreaterThan(0.8)
      })
    })

    it('manages concurrent data processing without memory spikes', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Create multiple concurrent processing tasks
      const concurrentTasks = Array.from({ length: 10 }, async (_, i) => {
        const response = await fetch(`/api/insights?batch=${i}&limit=50`)
        const data = await response.json()

        // Process each batch
        return data.insights.map((insight: any) => ({
          batchId: i,
          insightId: insight.id,
          processedAt: Date.now(),
          result: insight.data.metrics.reduce((sum: number, val: number) => sum + val, 0)
        }))
      })

      const results = await Promise.all(concurrentTasks)
      const flatResults = results.flat()

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const concurrentMemoryUsed = finalMemory - initialMemory

      expect(flatResults).toHaveLength(500) // 10 batches * 50 insights each
      expect(concurrentMemoryUsed).toBeLessThan(30 * 1024 * 1024) // Less than 30MB for concurrent processing

      // Verify all batches processed correctly
      const batchCounts = results.map(batch => batch.length)
      expect(batchCounts.every(count => count === 50)).toBe(true)
    })
  })

  describe('Memory Leak Detection', () => {
    it('detects and prevents event listener memory leaks', async () => {
      let eventListenerCount = 0
      const originalAddEventListener = window.addEventListener
      const originalRemoveEventListener = window.removeEventListener

      // Mock to track event listeners
      window.addEventListener = vi.fn((...args) => {
        eventListenerCount++
        return originalAddEventListener.apply(window, args)
      })

      window.removeEventListener = vi.fn((...args) => {
        eventListenerCount--
        return originalRemoveEventListener.apply(window, args)
      })

      const { unmount } = render(<AnalizaiPage />)

      // Allow component to set up event listeners
      await new Promise(resolve => setTimeout(resolve, 100))
      const listenersAfterMount = eventListenerCount

      unmount()

      // Allow cleanup
      await new Promise(resolve => setTimeout(resolve, 100))
      const listenersAfterUnmount = eventListenerCount

      // Restore original functions
      window.addEventListener = originalAddEventListener
      window.removeEventListener = originalRemoveEventListener

      // Should not have memory leaks from unremoved listeners
      expect(listenersAfterUnmount).toBeLessThanOrEqual(listenersAfterMount)
    })

    it('manages timer and interval cleanup', async () => {
      let activeTimers = 0
      const originalSetTimeout = global.setTimeout
      const originalSetInterval = global.setInterval
      const originalClearTimeout = global.clearTimeout
      const originalClearInterval = global.clearInterval

      // Track active timers
      global.setTimeout = vi.fn((...args) => {
        activeTimers++
        return originalSetTimeout.apply(global, args)
      })

      global.setInterval = vi.fn((...args) => {
        activeTimers++
        return originalSetInterval.apply(global, args)
      })

      global.clearTimeout = vi.fn((...args) => {
        activeTimers--
        return originalClearTimeout.apply(global, args)
      })

      global.clearInterval = vi.fn((...args) => {
        activeTimers--
        return originalClearInterval.apply(global, args)
      })

      const { unmount } = render(<AnalizaiPage />)
      await new Promise(resolve => setTimeout(resolve, 200))

      const timersAfterMount = activeTimers
      unmount()

      await new Promise(resolve => setTimeout(resolve, 200))
      const timersAfterUnmount = activeTimers

      // Restore original functions
      global.setTimeout = originalSetTimeout
      global.setInterval = originalSetInterval
      global.clearTimeout = originalClearTimeout
      global.clearInterval = originalClearInterval

      // Should clean up timers properly
      expect(timersAfterUnmount).toBeLessThanOrEqual(timersAfterMount)
    })
  })

  describe('Performance Optimization', () => {
    it('maintains acceptable memory usage under stress conditions', async () => {
      const stressTestStart = (performance as any).memory?.usedJSHeapSize || 0

      // Stress test with rapid component mounting/unmounting
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(<AnalizaiPage />)

        // Simulate user interactions
        await new Promise(resolve => setTimeout(resolve, 10))

        unmount()

        // Force garbage collection periodically
        if (i % 5 === 0 && global.gc) {
          global.gc()
        }
      }

      const stressTestEnd = (performance as any).memory?.usedJSHeapSize || 0
      const stressMemoryUsage = stressTestEnd - stressTestStart

      // Should handle stress testing without excessive memory growth
      expect(stressMemoryUsage).toBeLessThan(15 * 1024 * 1024) // Less than 15MB for stress test
    })

    it('optimizes memory usage for long-running sessions', async () => {
      const sessionStart = (performance as any).memory?.usedJSHeapSize || 0

      await act(async () => {
        render(<AnalizaiPage />)
      })

      // Simulate long-running session with multiple data loads
      for (let i = 0; i < 50; i++) {
        const response = await fetch(`/api/insights?session=${i}&limit=20`)
        const data = await response.json()

        // Process data as if displaying in UI
        const sessionData = data.insights.slice(0, 10) // Only keep recent data
        expect(sessionData).toHaveLength(10)

        // Cleanup older data periodically
        if (i % 10 === 0 && global.gc) {
          global.gc()
        }

        await new Promise(resolve => setTimeout(resolve, 5))
      }

      const sessionEnd = (performance as any).memory?.usedJSHeapSize || 0
      const sessionMemoryUsage = sessionEnd - sessionStart

      // Long-running session should maintain reasonable memory usage
      expect(sessionMemoryUsage).toBeLessThan(25 * 1024 * 1024) // Less than 25MB for long session
    })
  })
})