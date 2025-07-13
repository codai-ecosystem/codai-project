import { modService } from '../lib/services/modService';

describe('modService', () => {
  test('should initialize', async () => {
    const result = await modService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await modService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await modService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});