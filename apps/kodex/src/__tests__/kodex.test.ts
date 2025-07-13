import { kodexService } from '../lib/services/kodexService';

describe('kodexService', () => {
  test('should initialize', async () => {
    const result = await kodexService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await kodexService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await kodexService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});