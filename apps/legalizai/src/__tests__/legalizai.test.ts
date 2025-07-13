import { legalizaiService } from '../lib/services/legalizaiService';

describe('legalizaiService', () => {
  test('should initialize', async () => {
    const result = await legalizaiService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await legalizaiService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await legalizaiService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});