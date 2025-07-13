import { studiaiService } from '../lib/services/studiaiService';

describe('studiaiService', () => {
  test('should initialize', async () => {
    const result = await studiaiService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await studiaiService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await studiaiService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});