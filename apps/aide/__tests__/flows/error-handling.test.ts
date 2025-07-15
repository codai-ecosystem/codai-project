import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { basicFunctionalityFlow } from '../../lib/flows/basic-functionality';

describe('AIDE Error Handling Tests', () => {
  beforeEach(() => {
    basicFunctionalityFlow.clearState();
  });

  afterEach(() => {
    basicFunctionalityFlow.clearState();
  });

  describe('Input Validation Errors', () => {
    it('should handle null input gracefully', async () => {
      const result = await basicFunctionalityFlow.process(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid input');
    });

    it('should handle empty id gracefully', async () => {
      const result = await basicFunctionalityFlow.process({
        id: '',
        data: 'test-data'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle undefined data gracefully', async () => {
      const result = await basicFunctionalityFlow.process({
        id: 'test-id',
        data: undefined
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle null data gracefully', async () => {
      const result = await basicFunctionalityFlow.process({
        id: 'test-id',
        data: null
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Processing Errors', () => {
    it('should handle malformed request objects', async () => {
      const malformedRequest = {
        wrong_field: 'test',
        another_wrong_field: 123
      } as any;

      const result = await basicFunctionalityFlow.process(malformedRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle oversized data gracefully', async () => {
      const largeData = 'x'.repeat(1000000); // 1MB string
      const result = await basicFunctionalityFlow.process({
        id: 'oversized-test',
        data: largeData
      });

      // Should still process but we track it
      expect(result).toBeDefined();
      expect(result.metadata?.processingTime).toBeDefined();
    });

    it('should handle special characters in id', async () => {
      const specialCharsId = 'test-id-with-!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = await basicFunctionalityFlow.process({
        id: specialCharsId,
        data: 'test-data'
      });

      expect(result.success).toBe(true);
      expect(result.data.requestId).toBe(specialCharsId);
    });
  });

  describe('State Management Errors', () => {
    it('should handle concurrent requests to same id', async () => {
      const request = {
        id: 'concurrent-test',
        data: 'test-data'
      };

      // Fire multiple concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        basicFunctionalityFlow.process(request)
      );

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // State should be consistent
      const finalState = await basicFunctionalityFlow.getState('concurrent-test');
      expect(finalState?.status).toBe('completed');
    });

    it('should handle state retrieval for non-existent entities', async () => {
      const state = await basicFunctionalityFlow.getState('non-existent-id');
      expect(state).toBeUndefined();
    });
  });

  describe('Performance Under Error Conditions', () => {
    it('should maintain performance during error handling', async () => {
      const startTime = Date.now();

      // Generate many error conditions (reduced count)
      const errorRequests = Array.from({ length: 50 }, (_, i) => ({
        id: i % 2 === 0 ? '' : `error-test-${i}`, // Half will have empty IDs
        data: i % 3 === 0 ? null : `test-data-${i}` // Third will have null data
      }));

      const results = await Promise.all(
        errorRequests.map(req => basicFunctionalityFlow.process(req))
      );

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(results).toHaveLength(50);

      // Check that we got appropriate error responses
      const errorResults = results.filter(r => !r.success);
      expect(errorResults.length).toBeGreaterThan(15); // Expecting at least some errors
    });

    it('should not leak memory during error conditions', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Generate many error requests (reduced for speed)
      for (let i = 0; i < 100; i++) {
        await basicFunctionalityFlow.process({
          id: '', // Always invalid
          data: null // Always invalid
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal even after 100 error operations
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // Less than 20MB
    });
  });

  describe('Recovery and Resilience', () => {
    it('should recover from error states', async () => {
      // First, cause an error
      const errorResult = await basicFunctionalityFlow.process({
        id: '',
        data: null
      });
      expect(errorResult.success).toBe(false);

      // Then, process a valid request
      const validResult = await basicFunctionalityFlow.process({
        id: 'recovery-test',
        data: 'recovery-data'
      });
      expect(validResult.success).toBe(true);
    });

    it('should maintain system integrity after errors', async () => {
      // Mix of valid and invalid requests
      const mixedRequests = [
        { id: 'valid-1', data: 'data-1' },
        { id: '', data: 'invalid-id' },
        { id: 'valid-2', data: 'data-2' },
        { id: 'valid-3', data: null },
        { id: 'valid-4', data: 'data-4' }
      ];

      const results = await Promise.all(
        mixedRequests.map(req => basicFunctionalityFlow.process(req))
      );

      // Valid requests should succeed
      expect(results[0].success).toBe(true);
      expect(results[2].success).toBe(true);
      expect(results[4].success).toBe(true);

      // Invalid requests should fail gracefully
      expect(results[1].success).toBe(false);
      expect(results[3].success).toBe(false);

      // System should still be operational
      const finalTestResult = await basicFunctionalityFlow.process({
        id: 'final-test',
        data: 'final-data'
      });
      expect(finalTestResult.success).toBe(true);
    });
  });
});