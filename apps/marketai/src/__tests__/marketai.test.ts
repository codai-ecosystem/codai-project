import { marketaiService } from '../lib/services/marketaiService';

describe('marketaiService', () => {
  test('should initialize', async () => {
    const result = await marketaiService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await marketaiService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await marketaiService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});