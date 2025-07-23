import { describe, it, expect } from 'vitest';
import { GET } from '../../../src/app/api/stats/route';

// Real data validation utility
const validateRealData = (data: any, serviceName: string) => {
  // Check for common mock data indicators
  const dataString = JSON.stringify(data).toLowerCase();
  const mockIndicators = ['mock', 'fake', 'test-', 'dummy', 'sample'];

  for (const indicator of mockIndicators) {
    if (dataString.includes(indicator)) {
      console.warn(`⚠️  Potential mock data detected: contains "${indicator}"`);
    }
  }

  // MemorAI specific validation
  if (serviceName === 'memorai') {
    if (typeof data.totalMemories !== 'number') {
      throw new Error('MemorAI data should contain real totalMemories number');
    }

    if (data.totalMemories < 0) {
      throw new Error('MemorAI totalMemories should be >= 0');
    }
  }
};

describe('Stats API Route - Real MCP Integration', () => {
  describe('GET /api/stats', () => {
    it('should return real MCP stats successfully', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);

      // Expect real MCP data structure, not mock
      expect(data).toHaveProperty('totalMemories');
      expect(data).toHaveProperty('systemHealth');
      expect(data).toHaveProperty('totalAgents');
      expect(data).toHaveProperty('averageImportance');
      expect(data).toHaveProperty('recentActivity');
      expect(data).toHaveProperty('optimized');

      // Validate this is real data, not mock
      validateRealData(data, 'memorai');
    });

    it('should return valid real numeric stats from MCP', async () => {
      const response = await GET();
      const data = await response.json();

      // Real MCP data should have proper types
      expect(typeof data.totalMemories).toBe('number');
      expect(typeof data.totalAgents).toBe('number');
      expect(typeof data.averageImportance).toBe('number');

      // Real data constraints (can be 0 for new system)
      expect(data.totalMemories).toBeGreaterThanOrEqual(0);
      expect(data.totalAgents).toBeGreaterThanOrEqual(0);
      expect(data.averageImportance).toBeGreaterThanOrEqual(0);

      // System health should be a real status
      expect(['healthy', 'degraded', 'error']).toContain(data.systemHealth);
    });

    it('should return real recent activity from MCP', async () => {
      const response = await GET();
      const data = await response.json();

      expect(Array.isArray(data.recentActivity)).toBe(true);

      // Real MCP data can have 0 activities for new system
      if (data.recentActivity.length > 0) {
        // Check real MCP activity structure
        const firstActivity = data.recentActivity[0];
        expect(firstActivity).toHaveProperty('count');
        expect(firstActivity).toHaveProperty('type');
        expect(firstActivity).toHaveProperty('timestamp');

        // Validate real timestamp
        const timestamp = new Date(firstActivity.timestamp);
        expect(timestamp.getTime()).not.toBeNaN();
        expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
      }
    });

    it('should handle MCP connection gracefully', async () => {
      const response = await GET();
      const data = await response.json();

      // Should either succeed with real data or fail gracefully
      if (response.status === 200) {
        // Success case - real MCP data
        expect(data.optimized).toBe(true);
        expect(data.systemHealth).toBe('healthy');
      } else if (response.status === 500) {
        // Graceful failure case
        expect(data.error).toBe('MCP connection failed');
        expect(data.optimized).toBe(false);
        expect(data.totalMemories).toBe(0);
      }
    });

    it('should return real MCP data structure consistently', async () => {
      const response = await GET();
      const data = await response.json();

      // Test that we get consistent real data structure
      expect(data).toHaveProperty('optimized');
      expect(typeof data.optimized).toBe('boolean');

      // If optimized, should have real MCP response structure
      if (data.optimized) {
        expect(data.responseSize).toBeDefined();
        expect(data.systemHealth).toBe('healthy');
      }
    });

    it('should validate real MCP activity types', async () => {
      const response = await GET();
      const data = await response.json();

      // Real MCP activities should have valid types
      data.recentActivity.forEach((activity: any) => {
        expect(typeof activity.count).toBe('number');
        expect(activity.count).toBeGreaterThanOrEqual(0);

        // Real MCP activity types (not hardcoded mock types)
        const realMcpTypes = [
          'memory_created',
          'memory_searched',
          'memory_updated',
          'agent_registered',
          'query_executed'
        ];
        expect(realMcpTypes).toContain(activity.type);
      });
    });

    it('should demonstrate real vs mock data differences', async () => {
      const response = await GET();
      const data = await response.json();

      // This test documents the differences between real and mock data
      console.log('Real MCP Data Structure:', {
        hasOptimized: 'optimized' in data,
        hasSystemHealth: 'systemHealth' in data,
        hasResponseSize: 'responseSize' in data,
        totalMemoriesType: typeof data.totalMemories,
        recentActivityLength: data.recentActivity.length
      });

      // Real data should have MCP-specific fields that mocks don't have
      if (data.optimized) {
        expect(data).toHaveProperty('responseSize');
        expect(data.responseSize).toBe('compact');
      }
    });
  });
});
