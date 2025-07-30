import { studiaiService } from '../lib/services/studiaiService';

describe('studiaiService', () => {
  test('should initialize', async () => {
    const result = await studiaiService.initialize();
    expect(result.success).toBe(true);
    expect(result.data?.initialized).toBe(true);
  });

  test('should create item', async () => {
    const response = await studiaiService.createItem({ name: 'Test' });
    expect(response.success).toBe(true);
    expect(response.data?.name).toBe('Test');
    expect(response.data?.id).toBeDefined();
  });

  test('should get health', async () => {
    const response = await studiaiService.healthCheck();
    expect(response.success).toBe(true);
    expect(response.data?.status).toBe('healthy');
  });
});