import { templatesService } from '../lib/services/templatesService';

describe('templatesService', () => {
  test('should initialize', async () => {
    const result = await templatesService.initialize();
    expect(result.status).toBe('initialized');
  });

  test('should create item', async () => {
    const item = await templatesService.createItem({ name: 'Test' });
    expect(item.name).toBe('Test');
    expect(item.id).toBeDefined();
  });

  test('should get health', async () => {
    const health = await templatesService.healthCheck();
    expect(health.status).toBe('healthy');
  });
});