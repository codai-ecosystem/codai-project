import { publicaiService } from '../lib/services/publicaiService';

describe('publicaiService', () => {
  test('should initialize', async () => {
    const result = await publicaiService.initialize();
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await publicaiService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await publicaiService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});