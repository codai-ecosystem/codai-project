import { toolsService } from '../lib/services/toolsService';

describe('toolsService', () => {
  test('should initialize', async () => {
    const result = await toolsService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await toolsService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await toolsService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});