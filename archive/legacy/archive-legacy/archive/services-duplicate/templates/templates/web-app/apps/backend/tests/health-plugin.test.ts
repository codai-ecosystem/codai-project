import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import healthRoutesPlugin from '../src/routes/health';

describe('Health Plugin Registration Test', () => {
  it('should register health plugin without hanging', async () => {
    console.log('Creating Fastify instance...');
    const app = Fastify({ logger: false });

    console.log('Registering health plugin...');
    await app.register(healthRoutesPlugin);

    console.log('Calling app.ready()...');
    await app.ready();

    console.log('Testing health route...');
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('status', 'ok');

    console.log('Closing app...');
    await app.close();

    console.log('Test completed successfully');
  });
});
