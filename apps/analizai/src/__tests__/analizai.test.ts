import { analizaiService } from '../lib/services/analizaiService';

describe('analizaiService', () => {
  test('should initialize', async () => {
    const result = await analizaiService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await analizaiService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await analizaiService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});