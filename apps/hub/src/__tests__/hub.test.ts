import { hubService } from '../lib/services/hubService';

describe('hubService', () => {
  test('should be ready', async () => {
    const isReady = await hubService.isReady();
    expect(typeof isReady).toBe('boolean');
  });

  test('should create resource', async () => {
    const result = await hubService.createResource({ name: 'Test' });
    expect(result.success).toBe(true);
    expect(result.operation).toBe('create');
    expect(result.data.name).toBe('Test');
  });

  test('should get health', async () => {
    const health = await hubService.getHealth();
    expect(health.status).toBeDefined();
    expect(health.service).toBe('hub');
  });

  test('should execute operations', async () => {
    const result = await hubService.executeOperation('create', { name: 'Test' });
    expect(result.success).toBe(true);
    expect(result.operation).toBe('create');
  });
});