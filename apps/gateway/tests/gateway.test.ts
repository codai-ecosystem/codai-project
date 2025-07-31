/**
 * CODAI Gateway Service - Test Suite
 * Comprehensive tests for the working gateway implementation
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';

// We'll import the app after it's built
let app: any;

const JWT_SECRET = 'test-secret';
const validToken = jwt.sign({ id: 'test-user', role: 'admin' }, JWT_SECRET);

beforeAll(async () => {
    // Set test environment variables
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.GATEWAY_PORT = '4001'; // Use different port for tests
    process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

    // Import the app after setting env vars
    const { default: gatewayApp } = await import('../src/gateway-working');
    app = gatewayApp;
});

describe('CODAI Gateway - Health Endpoints', () => {
    test('GET /api/gateway/health should return gateway status', async () => {
        const response = await request(app)
            .get('/api/gateway/health')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('gateway');
        expect(response.body.data).toHaveProperty('services');
        expect(response.body.data.gateway).toHaveProperty('status', 'healthy');
        expect(response.body.data.gateway).toHaveProperty('version');
        expect(response.body.data.gateway).toHaveProperty('uptime');
        expect(Array.isArray(response.body.data.services)).toBe(true);
    });

    test('Gateway health should include service information', async () => {
        const response = await request(app)
            .get('/api/gateway/health');

        const services = response.body.data.services;
        expect(services.length).toBeGreaterThan(0);

        // Check service structure
        const service = services[0];
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('status');
        expect(service).toHaveProperty('category');
        expect(['healthy', 'unhealthy']).toContain(service.status);
        expect(['core', 'business', 'utility']).toContain(service.category);
    });
});

describe('CODAI Gateway - Authentication', () => {
    test('Protected endpoints should require authentication', async () => {
        await request(app)
            .get('/api/gateway/services')
            .expect(401);
    });

    test('Invalid token should return 403', async () => {
        await request(app)
            .get('/api/gateway/services')
            .set('Authorization', 'Bearer invalid-token')
            .expect(403);
    });

    test('Valid token should allow access to protected endpoints', async () => {
        const response = await request(app)
            .get('/api/gateway/services')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
    });
});

describe('CODAI Gateway - Service Registry', () => {
    test('GET /api/gateway/services should return service list', async () => {
        const response = await request(app)
            .get('/api/gateway/services')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('services');
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('healthy');
        expect(response.body.data).toHaveProperty('categories');
        expect(Array.isArray(response.body.data.services)).toBe(true);
    });

    test('Service list should include expected services', async () => {
        const response = await request(app)
            .get('/api/gateway/services')
            .set('Authorization', `Bearer ${validToken}`);

        const services = response.body.data.services;
        const serviceIds = services.map((s: any) => s.id);

        expect(serviceIds).toContain('codai');
        expect(serviceIds).toContain('admin');
        expect(serviceIds).toContain('hub');
        expect(serviceIds).toContain('memorai');
    });

    test('Each service should have required properties', async () => {
        const response = await request(app)
            .get('/api/gateway/services')
            .set('Authorization', `Bearer ${validToken}`);

        const services = response.body.data.services;
        services.forEach((service: any) => {
            expect(service).toHaveProperty('id');
            expect(service).toHaveProperty('name');
            expect(service).toHaveProperty('description');
            expect(service).toHaveProperty('version');
            expect(service).toHaveProperty('category');
            expect(service).toHaveProperty('endpoint');
            expect(service).toHaveProperty('status');
            expect(service).toHaveProperty('lastHealthCheck');
        });
    });
});

describe('CODAI Gateway - Service Discovery', () => {
    test('GET /api/gateway/discover/:serviceId should return service details', async () => {
        const response = await request(app)
            .get('/api/gateway/discover/codai')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', 'codai');
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('description');
        expect(response.body.data).toHaveProperty('baseUrl');
        expect(response.body.data).toHaveProperty('directUrl');
    });

    test('Non-existent service should return 404', async () => {
        const response = await request(app)
            .get('/api/gateway/discover/nonexistent')
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Service not found');
        expect(response.body).toHaveProperty('availableServices');
    });
});

describe('CODAI Gateway - Metrics', () => {
    test('GET /api/gateway/metrics should return system metrics', async () => {
        const response = await request(app)
            .get('/api/gateway/metrics')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('gateway');
        expect(response.body.data).toHaveProperty('services');
        expect(response.body.data.gateway).toHaveProperty('uptime');
        expect(response.body.data.gateway).toHaveProperty('memory');
        expect(response.body.data.services).toHaveProperty('total');
        expect(response.body.data.services).toHaveProperty('healthy');
    });

    test('Metrics should require authentication', async () => {
        await request(app)
            .get('/api/gateway/metrics')
            .expect(401);
    });
});

describe('CODAI Gateway - Documentation', () => {
    test('GET /docs should serve API documentation', async () => {
        const response = await request(app)
            .get('/docs/')
            .expect(200);

        expect(response.text).toContain('swagger-ui');
    });
});

describe('CODAI Gateway - Error Handling', () => {
    test('Unknown routes should return 404', async () => {
        const response = await request(app)
            .get('/api/unknown/endpoint')
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Not Found');
        expect(response.body).toHaveProperty('availableServices');
    });

    test('Error responses should include request ID', async () => {
        const response = await request(app)
            .get('/api/unknown/endpoint');

        expect(response.body).toHaveProperty('requestId');
        expect(typeof response.body.requestId).toBe('string');
    });
});

describe('CODAI Gateway - Request Headers', () => {
    test('Responses should include security headers', async () => {
        const response = await request(app)
            .get('/api/gateway/health');

        expect(response.headers).toHaveProperty('x-request-id');
        expect(response.headers).toHaveProperty('x-content-type-options');
        expect(response.headers).toHaveProperty('x-frame-options');
    });

    test('CORS headers should be present', async () => {
        const response = await request(app)
            .get('/api/gateway/health')
            .set('Origin', 'http://localhost:3000');

        expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
});

describe('CODAI Gateway - Rate Limiting', () => {
    test('Rate limiting should be applied', async () => {
        // This test would need to make many requests to trigger rate limiting
        // For now, we'll just check that the middleware is in place
        const response = await request(app)
            .get('/api/gateway/health');

        // Rate limiting headers should be present
        expect(response.headers).toHaveProperty('x-ratelimit-limit');
        expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
});

describe('CODAI Gateway - Service Proxying', () => {
    test('Health check endpoints should be accessible without auth', async () => {
        // Test that we can access service health endpoints
        const response = await request(app)
            .get('/api/v1/codai/health');

        // This will likely fail since the actual service isn't running
        // But we're testing that the route is configured correctly
        expect([200, 502, 503]).toContain(response.status);
    });

    test('Service routes should require authentication for non-health endpoints', async () => {
        const response = await request(app)
            .get('/api/v1/codai/some-endpoint');

        expect(response.status).toBe(401);
    });
});

afterAll(async () => {
    // Clean up any resources if needed
});
