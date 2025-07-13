import { xService } from '../lib/services/xService';

describe('xService', () => {
  test('should initialize', async () => {
    const result = await xService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await xService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await xService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});