import AnalizaiService from '../services/analizaiService';

describe('analizaiService', () => {
  const analizaiService = AnalizaiService.getInstance();

  test('should get metrics', async () => {
    const metrics = await analizaiService.getMetrics();
    expect(Array.isArray(metrics)).toBe(true);
  });

  test('should get insights', async () => {
    const insights = await analizaiService.getInsights();
    expect(Array.isArray(insights)).toBe(true);
  });

  test('should get data sources', async () => {
    const dataSources = await analizaiService.getDataSources();
    expect(Array.isArray(dataSources)).toBe(true);
  });

  test('should get real-time metrics', async () => {
    const realTimeMetrics = await analizaiService.getRealTimeMetrics();
    expect(typeof realTimeMetrics).toBe('object');
    expect(typeof realTimeMetrics.activeUsers).toBe('number');
  });
});