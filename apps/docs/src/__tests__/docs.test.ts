import { docsService } from '../lib/services/docsService';

describe('docsService', () => {
  test('should initialize', async () => {
    const result = await docsService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await docsService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await docsService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});