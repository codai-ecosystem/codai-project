// Memory performance tests for aide
import { describe, it, expect } from 'vitest';

describe('AIDE Memory Performance Tests', () => {
  describe('Memory Usage Optimization', () => {
    it('should efficiently manage memory for large data structures', () => {
      const createLargeDataStructure = () => {
        const data = new Map<string, any>();
        for (let i = 0; i < 10000; i++) {
          data.set(`key_${i}`, {
            id: i,
            value: Math.random(),
            metadata: { timestamp: Date.now(), processed: false }
          });
        }
        return data;
      };

      const startMemory = process.memoryUsage().heapUsed;
      const largeData = createLargeDataStructure();
      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsed = endMemory - startMemory;

      expect(largeData.size).toBe(10000);
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    it('should properly clean up memory after operations', () => {
      const performMemoryIntensiveOperation = () => {
        const arrays: number[][] = [];
        for (let i = 0; i < 1000; i++) {
          arrays.push(new Array(1000).fill(i));
        }
        return arrays.length;
      };

      const initialMemory = process.memoryUsage().heapUsed;
      const result = performMemoryIntensiveOperation();

      // Force garbage collection simulation
      global.gc && global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDifference = finalMemory - initialMemory;

      expect(result).toBe(1000);
      expect(memoryDifference).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
    });

    it('should handle memory-efficient streaming of large datasets', async () => {
      const processStreamingData = async function* (size: number) {
        for (let i = 0; i < size; i++) {
          yield {
            id: i,
            data: new Array(100).fill(i),
            processed: true
          };
        }
      };

      const startMemory = process.memoryUsage().heapUsed;
      let processedCount = 0;

      for await (const item of processStreamingData(10000)) {
        processedCount++;
        // Process item without storing in memory
        expect(item.id).toBeDefined();
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsed = endMemory - startMemory;

      expect(processedCount).toBe(10000);
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB (realistic for large dataset streaming)
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not accumulate memory with repeated operations', () => {
      const performRepeatedOperations = (iterations: number) => {
        const memorySnapshots: number[] = [];

        for (let i = 0; i < iterations; i++) {
          // Create and discard temporary objects
          const temp = {
            data: new Array(1000).fill(Math.random()),
            timestamp: Date.now(),
            id: i
          };

          // Use the object
          const sum = temp.data.reduce((a, b) => a + b, 0);

          // Record memory usage every 100 iterations
          if (i % 100 === 0) {
            memorySnapshots.push(process.memoryUsage().heapUsed);
          }
        }

        return memorySnapshots;
      };

      const snapshots = performRepeatedOperations(1000);

      // Memory shouldn't grow significantly over time
      const firstSnapshot = snapshots[0];
      const lastSnapshot = snapshots[snapshots.length - 1];
      const memoryGrowth = lastSnapshot - firstSnapshot;

      expect(snapshots.length).toBeGreaterThan(5);
      expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024); // Less than 20MB growth
    });

    it('should properly dispose of event listeners and callbacks', () => {
      const createMockEventEmitter = () => {
        const listeners = new Map<string, Function[]>();

        return {
          on: (event: string, callback: Function) => {
            if (!listeners.has(event)) {
              listeners.set(event, []);
            }
            listeners.get(event)!.push(callback);
          },
          off: (event: string, callback: Function) => {
            const eventListeners = listeners.get(event);
            if (eventListeners) {
              const index = eventListeners.indexOf(callback);
              if (index > -1) {
                eventListeners.splice(index, 1);
              }
            }
          },
          emit: (event: string, data: any) => {
            const eventListeners = listeners.get(event);
            if (eventListeners) {
              eventListeners.forEach(callback => callback(data));
            }
          },
          getListenerCount: (event: string) => {
            return listeners.get(event)?.length || 0;
          }
        };
      };

      const emitter = createMockEventEmitter();
      const callback1 = (data: any) => console.log('Callback 1:', data);
      const callback2 = (data: any) => console.log('Callback 2:', data);

      // Add listeners
      emitter.on('test', callback1);
      emitter.on('test', callback2);
      expect(emitter.getListenerCount('test')).toBe(2);

      // Remove listeners
      emitter.off('test', callback1);
      expect(emitter.getListenerCount('test')).toBe(1);

      emitter.off('test', callback2);
      expect(emitter.getListenerCount('test')).toBe(0);
    });

    it('should handle circular references appropriately', () => {
      const createCircularStructure = () => {
        const obj1: any = { name: 'object1' };
        const obj2: any = { name: 'object2' };

        // Create circular reference
        obj1.ref = obj2;
        obj2.ref = obj1;

        return { obj1, obj2 };
      };

      const breakCircularReferences = (obj: any, visited = new WeakSet()) => {
        if (visited.has(obj)) {
          return '[Circular]';
        }

        if (obj && typeof obj === 'object') {
          visited.add(obj);
          const result: any = Array.isArray(obj) ? [] : {};

          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              result[key] = breakCircularReferences(obj[key], visited);
            }
          }

          return result;
        }

        return obj;
      };

      const { obj1, obj2 } = createCircularStructure();
      const cleaned = breakCircularReferences(obj1);

      expect(cleaned.name).toBe('object1');
      expect(cleaned.ref.name).toBe('object2');
      expect(cleaned.ref.ref).toBe('[Circular]');
    });
  });

  describe('Memory Pool Management', () => {
    it('should efficiently reuse object pools', () => {
      class ObjectPool<T> {
        private pool: T[] = [];
        private createFn: () => T;
        private resetFn: (obj: T) => void;

        constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
          this.createFn = createFn;
          this.resetFn = resetFn;

          // Pre-populate pool
          for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
          }
        }

        acquire(): T {
          const obj = this.pool.pop();
          return obj || this.createFn();
        }

        release(obj: T): void {
          this.resetFn(obj);
          this.pool.push(obj);
        }

        size(): number {
          return this.pool.length;
        }
      }

      interface PooledObject {
        id: number;
        data: number[];
        active: boolean;
      }

      const pool = new ObjectPool<PooledObject>(
        () => ({ id: 0, data: [], active: false }),
        (obj) => {
          obj.id = 0;
          obj.data = [];
          obj.active = false;
        },
        5
      );

      expect(pool.size()).toBe(5);

      // Acquire objects
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      expect(pool.size()).toBe(3);

      // Use objects
      obj1.id = 1;
      obj1.data = [1, 2, 3];
      obj1.active = true;

      obj2.id = 2;
      obj2.data = [4, 5, 6];
      obj2.active = true;

      // Release objects back to pool
      pool.release(obj1);
      pool.release(obj2);
      expect(pool.size()).toBe(5);

      // Verify objects were reset
      const reusedObj = pool.acquire();
      expect(reusedObj.id).toBe(0);
      expect(reusedObj.data).toEqual([]);
      expect(reusedObj.active).toBe(false);
    });

    it('should manage buffer pools for memory efficiency', () => {
      class BufferPool {
        private buffers = new Map<number, ArrayBuffer[]>();

        getBuffer(size: number): ArrayBuffer {
          const roundedSize = this.roundToNearestPowerOfTwo(size);
          const pool = this.buffers.get(roundedSize) || [];

          if (pool.length > 0) {
            return pool.pop()!;
          }

          return new ArrayBuffer(roundedSize);
        }

        returnBuffer(buffer: ArrayBuffer): void {
          const size = buffer.byteLength;
          if (!this.buffers.has(size)) {
            this.buffers.set(size, []);
          }

          const pool = this.buffers.get(size)!;
          if (pool.length < 10) { // Limit pool size
            pool.push(buffer);
          }
        }

        private roundToNearestPowerOfTwo(size: number): number {
          return Math.pow(2, Math.ceil(Math.log2(size)));
        }

        getPoolStats() {
          const stats = new Map<number, number>();
          this.buffers.forEach((pool, size) => {
            stats.set(size, pool.length);
          });
          return stats;
        }
      }

      const bufferPool = new BufferPool();

      // Get and return buffers
      const buffer1 = bufferPool.getBuffer(1000);
      const buffer2 = bufferPool.getBuffer(2000);

      expect(buffer1.byteLength).toBe(1024); // Rounded to power of 2
      expect(buffer2.byteLength).toBe(2048); // Rounded to power of 2

      bufferPool.returnBuffer(buffer1);
      bufferPool.returnBuffer(buffer2);

      const stats = bufferPool.getPoolStats();
      expect(stats.get(1024)).toBe(1);
      expect(stats.get(2048)).toBe(1);

      // Reuse buffer
      const reusedBuffer = bufferPool.getBuffer(1000);
      expect(reusedBuffer).toBe(buffer1); // Should be the same instance
    });
  });

  describe('Memory Monitoring', () => {
    it('should track memory usage patterns', () => {
      const memoryTracker = {
        snapshots: [] as Array<{ timestamp: number; heapUsed: number; heapTotal: number }>,

        takeSnapshot() {
          const memory = process.memoryUsage();
          this.snapshots.push({
            timestamp: Date.now(),
            heapUsed: memory.heapUsed,
            heapTotal: memory.heapTotal
          });
        },

        getMemoryTrend() {
          if (this.snapshots.length < 2) return 0;

          const first = this.snapshots[0];
          const last = this.snapshots[this.snapshots.length - 1];

          return last.heapUsed - first.heapUsed;
        },

        getAverageMemoryUsage() {
          if (this.snapshots.length === 0) return 0;

          const total = this.snapshots.reduce((sum, snapshot) => sum + snapshot.heapUsed, 0);
          return total / this.snapshots.length;
        }
      };

      // Take multiple snapshots during operations
      memoryTracker.takeSnapshot();

      // Perform some operations
      const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() }));
      memoryTracker.takeSnapshot();

      const processed = data.map(item => ({ ...item, processed: true }));
      memoryTracker.takeSnapshot();

      const filtered = processed.filter(item => item.value > 0.5);
      memoryTracker.takeSnapshot();

      expect(memoryTracker.snapshots.length).toBe(4);
      expect(memoryTracker.getAverageMemoryUsage()).toBeGreaterThan(0);

      const trend = memoryTracker.getMemoryTrend();
      expect(typeof trend).toBe('number');
    });
  });
});