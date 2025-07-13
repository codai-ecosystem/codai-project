import { hubService } from '../lib/services/hubService';

describe('hubService', () => {
  test('should initialize', async () => {
    const result = await hubService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await hubService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await hubService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});