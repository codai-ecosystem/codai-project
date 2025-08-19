/**
 * CODAI Production Load Balancer
 * Phase 4.2.2 - Production Reliability & Scaling Implementation
 * Multi-instance deployment with automatic failover and load balancing
 */

const http = require('http');
const url = require('url');
const cluster = require('cluster');
const os = require('os');

const PORT = 4300; // Load Balancer Port
const HEALTH_CHECK_INTERVAL = 10000; // 10 seconds
const FAILURE_THRESHOLD = 3; // Failed attempts before marking unhealthy

// Service instance registry with multiple instances support
const serviceInstances = {
    'cbd': [
        { id: 'cbd-1', url: 'http://localhost:4180', healthy: true, failures: 0, responseTime: 0 },
        // Future instances: cbd-2 (4181), cbd-3 (4182)
    ],
    'gateway': [
        { id: 'gateway-1', url: 'http://localhost:3000', healthy: true, failures: 0, responseTime: 0 },
        // Future instances: gateway-2 (3001), gateway-3 (3002)
    ],
    'codai': [
        { id: 'codai-1', url: 'http://localhost:4001', healthy: true, failures: 0, responseTime: 0 },
        // Future instances: codai-2 (4002), codai-3 (4003)
    ],
    'id': [
        { id: 'id-1', url: 'http://localhost:4004', healthy: true, failures: 0, responseTime: 0 }
    ],
    'memorai': [
        { id: 'memorai-1', url: 'http://localhost:4006', healthy: true, failures: 0, responseTime: 0 }
    ],
    'hub': [
        { id: 'hub-1', url: 'http://localhost:4008', healthy: true, failures: 0, responseTime: 0 }
    ]
};

// Load balancing algorithms
const loadBalancingStrategies = {
    'round-robin': (instances) => {
        const healthy = instances.filter(instance => instance.healthy);
        if (healthy.length === 0) return null;

        // Simple round-robin implementation
        const current = healthy[0];
        healthy.push(healthy.shift()); // Move first to end
        return current;
    },

    'least-connections': (instances) => {
        const healthy = instances.filter(instance => instance.healthy);
        if (healthy.length === 0) return null;

        // For simplicity, return fastest responding instance
        return healthy.reduce((best, current) =>
            current.responseTime < best.responseTime ? current : best
        );
    },

    'weighted-round-robin': (instances) => {
        const healthy = instances.filter(instance => instance.healthy);
        if (healthy.length === 0) return null;

        // Weight based on inverse response time (faster = higher weight)
        const weights = healthy.map(instance => 1000 / (instance.responseTime + 1));
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        const random = Math.random() * totalWeight;

        let accumulated = 0;
        for (let i = 0; i < healthy.length; i++) {
            accumulated += weights[i];
            if (random <= accumulated) {
                return healthy[i];
            }
        }
        return healthy[0];
    }
};

// Current strategy
let currentStrategy = 'round-robin';

// Health check function for individual instances
async function checkInstanceHealth(instance) {
    const startTime = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${instance.url}/health`, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'User-Agent': 'CODAI-LoadBalancer/1.0' }
        });

        clearTimeout(timeout);
        instance.responseTime = Date.now() - startTime;

        if (response.ok) {
            instance.healthy = true;
            instance.failures = 0;
            return true;
        } else {
            instance.failures++;
            if (instance.failures >= FAILURE_THRESHOLD) {
                instance.healthy = false;
            }
            return false;
        }
    } catch (error) {
        instance.responseTime = Date.now() - startTime;
        instance.failures++;
        if (instance.failures >= FAILURE_THRESHOLD) {
            instance.healthy = false;
        }
        console.error(`[HEALTH] Instance ${instance.id} failed: ${error.message}`);
        return false;
    }
}

// Comprehensive health monitoring
async function performHealthChecks() {
    console.log('[HEALTH] Performing comprehensive health checks...');
    let totalInstances = 0;
    let healthyInstances = 0;

    for (const [serviceName, instances] of Object.entries(serviceInstances)) {
        const healthPromises = instances.map(instance => checkInstanceHealth(instance));
        const results = await Promise.all(healthPromises);

        const serviceHealthy = results.filter(Boolean).length;
        totalInstances += instances.length;
        healthyInstances += serviceHealthy;

        console.log(`[HEALTH] ${serviceName}: ${serviceHealthy}/${instances.length} instances healthy`);
    }

    console.log(`[HEALTH] Overall: ${healthyInstances}/${totalInstances} instances healthy`);
    return { total: totalInstances, healthy: healthyInstances };
}

// Load balancer proxy function
async function proxyRequest(req, res, serviceName) {
    const instances = serviceInstances[serviceName];
    if (!instances || instances.length === 0) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Service Unavailable',
            message: `No instances available for service: ${serviceName}`
        }));
        return;
    }

    // Select instance using load balancing strategy
    const selectedInstance = loadBalancingStrategies[currentStrategy](instances);

    if (!selectedInstance) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Service Unavailable',
            message: `No healthy instances available for service: ${serviceName}`
        }));
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const targetPath = parsedUrl.pathname.replace(`/${serviceName}`, '') || '/';

    console.log(`[PROXY] ${req.method} ${req.url} -> ${selectedInstance.id} (${selectedInstance.url}${targetPath})`);

    try {
        const proxyOptions = {
            hostname: url.parse(selectedInstance.url).hostname,
            port: url.parse(selectedInstance.url).port,
            path: targetPath + (parsedUrl.search || ''),
            method: req.method,
            headers: {
                ...req.headers,
                'host': url.parse(selectedInstance.url).host,
                'X-Load-Balancer': 'CODAI-LB/1.0',
                'X-Instance-ID': selectedInstance.id,
                'X-Strategy': currentStrategy,
                'X-Request-ID': req.headers['x-request-id'] || generateRequestId()
            }
        };

        const proxyReq = http.request(proxyOptions, (proxyRes) => {
            // Copy response headers
            res.writeHead(proxyRes.statusCode, {
                ...proxyRes.headers,
                'X-Served-By': selectedInstance.id,
                'X-Load-Balancer': 'CODAI-LB/1.0',
                'X-Response-Time': selectedInstance.responseTime + 'ms'
            });

            // Pipe response data
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (error) => {
            console.error(`[PROXY] Error with ${selectedInstance.id}:`, error.message);

            // Mark instance as potentially unhealthy
            selectedInstance.failures++;
            if (selectedInstance.failures >= FAILURE_THRESHOLD) {
                selectedInstance.healthy = false;
            }

            if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Bad Gateway',
                    message: `Instance ${selectedInstance.id} unavailable`,
                    instance: selectedInstance.id
                }));
            }
        });

        // Forward request body if present
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                if (body) {
                    proxyReq.write(body);
                }
                proxyReq.end();
            });
        } else {
            proxyReq.end();
        }

    } catch (error) {
        console.error(`[PROXY] Unexpected error:`, error);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            }));
        }
    }
}

// Generate unique request ID
function generateRequestId() {
    return `lb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Main request handler
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);

    try {
        // Load balancer management endpoints
        if (path === '/lb/health') {
            const healthStats = await performHealthChecks();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                service: 'CODAI Production Load Balancer',
                version: '1.0.0',
                strategy: currentStrategy,
                instances: healthStats,
                uptime: Math.floor(process.uptime()),
                timestamp: new Date().toISOString()
            }));
            return;
        }

        if (path === '/lb/instances') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: {
                    strategy: currentStrategy,
                    services: Object.entries(serviceInstances).map(([name, instances]) => ({
                        service: name,
                        instances: instances.map(instance => ({
                            id: instance.id,
                            url: instance.url,
                            healthy: instance.healthy,
                            failures: instance.failures,
                            responseTime: instance.responseTime + 'ms'
                        })),
                        healthy: instances.filter(i => i.healthy).length,
                        total: instances.length
                    }))
                }
            }));
            return;
        }

        if (path === '/lb/strategy' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { strategy } = JSON.parse(body);
                    if (loadBalancingStrategies[strategy]) {
                        currentStrategy = strategy;
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: `Load balancing strategy changed to: ${strategy}`,
                            strategy: currentStrategy
                        }));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Invalid strategy',
                            availableStrategies: Object.keys(loadBalancingStrategies)
                        }));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Invalid JSON body'
                    }));
                }
            });
            return;
        }

        // Service routing with load balancing
        for (const serviceName of Object.keys(serviceInstances)) {
            if (path.startsWith(`/${serviceName}`)) {
                await proxyRequest(req, res, serviceName);
                return;
            }
        }

        // 404 for unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Not Found',
            message: 'Service not found',
            path: path,
            availableServices: Object.keys(serviceInstances),
            loadBalancerEndpoints: ['/lb/health', '/lb/instances', '/lb/strategy']
        }));

    } catch (error) {
        console.error('[LB ERROR]:', error);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            }));
        }
    }
}

// Create and start the load balancer
const server = http.createServer(handleRequest);

// Start periodic health checks
setInterval(performHealthChecks, HEALTH_CHECK_INTERVAL);

server.listen(PORT, () => {
    console.log(`🚀 CODAI Production Load Balancer running on port ${PORT}`);
    console.log(`🔄 Load Balancing Strategy: ${currentStrategy}`);
    console.log(`⚖️  Service Instances: ${Object.keys(serviceInstances).length} services`);
    console.log(`❤️  Health Checks: Every ${HEALTH_CHECK_INTERVAL / 1000} seconds`);
    console.log(`🔧 Management Endpoints:`);
    console.log(`   Health: http://localhost:${PORT}/lb/health`);
    console.log(`   Instances: http://localhost:${PORT}/lb/instances`);
    console.log(`   Strategy: http://localhost:${PORT}/lb/strategy (POST)`);
    console.log(`\n🌐 Load Balanced Services:`);

    Object.entries(serviceInstances).forEach(([name, instances]) => {
        console.log(`   ${name}: http://localhost:${PORT}/${name} -> ${instances.length} instance(s)`);
        instances.forEach(instance => {
            console.log(`     └─ ${instance.id}: ${instance.url}`);
        });
    });

    console.log(`\n✅ Phase 4.2.2 - Production Load Balancer active!`);
    console.log(`🎯 Ready for multi-instance scaling and automatic failover`);

    // Initial health check
    setTimeout(performHealthChecks, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down load balancer...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down load balancer...');
    server.close(() => process.exit(0));
});

module.exports = server;
