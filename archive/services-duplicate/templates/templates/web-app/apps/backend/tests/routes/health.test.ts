import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import healthRoutesPlugin from '../../src/routes/health';

describe('Health Routes', () => {
  let app: FastifyInstance;
  beforeEach(async () => {
    // Create a fresh Fastify instance for each test
    app = Fastify({ logger: false });
    await app.register(healthRoutesPlugin);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });
  it('should respond to the health check endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('status', 'ok');
    expect(response.json()).toHaveProperty('timestamp');
    expect(response.json()).toHaveProperty('uptime');
    expect(response.json()).toHaveProperty('version');
  });
  it('should respond to the readiness check endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health/ready',
    });

    expect(response.statusCode).toBe(200);
    const body: { status: string; checks: Record<string, unknown>; } = response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('checks');
    expect(body.checks).toHaveProperty('database');
    expect(body.checks).toHaveProperty('cache');
    expect(body.checks).toHaveProperty('storage');
  });
});
