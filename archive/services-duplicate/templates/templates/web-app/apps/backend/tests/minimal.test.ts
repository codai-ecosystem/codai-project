import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';

describe('Minimal Fastify Test', () => {
  it('should create and close Fastify instance without hanging', async () => {
    console.log('Creating Fastify instance...');
    const app = Fastify({ logger: false });

    console.log('Adding simple route...');
    app.get('/test', () => ({ test: true }));

    console.log('Calling app.ready()...');
    await app.ready();

    console.log('Testing route...');
    const response = await app.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ test: true });

    console.log('Closing app...');
    await app.close();

    console.log('Test completed successfully');
  });
});
