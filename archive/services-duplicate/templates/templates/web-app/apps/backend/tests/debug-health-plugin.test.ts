import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import healthRoutesPlugin from '../src/routes/health';

describe('Health Plugin Registration Test', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    console.log('Creating Fastify instance...');
    app = Fastify({ logger: false });
    console.log('Fastify instance created');

    console.log('Registering health routes plugin...');
    await app.register(healthRoutesPlugin);
    console.log('Health routes plugin registered');

    console.log('Making app ready...');
    await app.ready();
    console.log('App is ready');
  });

  afterEach(async () => {
    console.log('Closing app...');
    await app.close();
    console.log('App closed');
  });

  it('should respond to health endpoint', async () => {
    console.log('Testing health endpoint...');
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('status', 'ok');
    console.log('Health test completed');
  });
});
