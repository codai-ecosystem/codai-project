import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Minimal Fastify Test', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    console.log('Creating Fastify instance...');
    app = Fastify({ logger: false });
    console.log('Fastify instance created');

    // Add a simple route without any plugin
    app.get('/test', (): { message: string; } => {
      return { message: 'test' };
    });

    console.log('Making app ready...');
    await app.ready();
    console.log('App is ready');
  });

  afterEach(async () => {
    console.log('Closing app...');
    await app.close();
    console.log('App closed');
  });

  it('should respond to test endpoint', async () => {
    console.log('Testing endpoint...');
    const response = await app.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'test' });
    console.log('Test completed');
  });
});
