import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Service registry
const serviceRegistry = {
    codai: {
        name: 'CODAI Service',
        url: 'http://localhost:4001',
        healthPath: '/api/health',
        isHealthy: false,
        lastHealthCheck: null,
        category: 'core'
    },
    admin: {
        name: 'Admin Service',
        url: 'http://localhost:4007',
        healthPath: '/api/health',
        isHealthy: false,
        lastHealthCheck: null,
        category: 'core'
    },
    hub: {
        name: 'Hub Service',
        url: 'http://localhost:4008',
        healthPath: '/api/health',
        isHealthy: false,
        lastHealthCheck: null,
        category: 'core'
    },
    id: {
        name: 'ID Service',
        url: 'http://localhost:4004',
        healthPath: '/api/health',
        isHealthy: false,
        lastHealthCheck: null,
        category: 'core'
    },
    bancai: {
        name: 'BancAI Service',
        url: 'http://localhost:4005',
        healthPath: '/api/health',
        isHealthy: false,
        lastHealthCheck: null,
        category: 'business'
    },
    memorai: {
        name: 'MemorAI Service',
        url: 'http://localhost:4006',
        healthPath: '/api/health',
        isHealthy: false,
        lastHealthCheck: null,
        category: 'utility'
    }
};

// Health check function
async function checkServiceHealth(serviceId) {
    const service = serviceRegistry[serviceId];
    if (!service) return false;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${service.url}${service.healthPath}`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const isHealthy = response.ok;
        service.isHealthy = isHealthy;
        service.lastHealthCheck = new Date();
        return isHealthy;
    } catch (error) {
        service.isHealthy = false;
        service.lastHealthCheck = new Date();
        return false;
    }
}

// Gateway health endpoint
// Gateway health endpoint (standard format)
app.get('/health', (req, res) => {
    const healthStatus = {
        gateway: {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '2.0.0-simple'
        },
        services: Object.entries(serviceRegistry).map(([id, config]) => ({
            id,
            name: config.name,
            status: config.isHealthy ? 'healthy' : 'unhealthy',
            url: config.url,
            lastHealthCheck: config.lastHealthCheck,
            category: config.category
        }))
    };

    const allHealthy = Object.values(serviceRegistry).every(service => service.isHealthy);

    res.status(200).json({
        success: true,
        data: healthStatus,
        message: allHealthy ? 'Gateway running - checking services...' : 'Gateway running - some services may be down'
    });
});

// Gateway health endpoint (test-compatible format)
app.get('/api/gateway/health', (req, res) => {
    res.status(200).json({
        service: 'Gateway Service',
        status: 'healthy',
        version: '2.0.0-simple',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: Object.entries(serviceRegistry).map(([id, config]) => ({
            id,
            name: config.name,
            status: config.isHealthy ? 'healthy' : 'unhealthy',
            url: config.url,
            lastHealthCheck: config.lastHealthCheck
        }))
    });
});

// Services list endpoint
app.get('/api/gateway/services', (req, res) => {
    const services = Object.entries(serviceRegistry).map(([id, config]) => ({
        id,
        name: config.name,
        status: config.isHealthy ? 'healthy' : 'unhealthy',
        url: config.url,
        lastHealthCheck: config.lastHealthCheck,
        category: config.category
    }));

    res.json({
        success: true,
        data: {
            services,
            total: services.length,
            healthy: services.filter(s => s.status === 'healthy').length
        },
        message: 'Service registry retrieved'
    });
});

// Health check all services endpoint
app.get('/api/gateway/health-check', async (req, res) => {
    console.log('🔍 Performing health checks on all services...');
    
    const healthChecks = Object.keys(serviceRegistry).map(async serviceId => {
        const isHealthy = await checkServiceHealth(serviceId);
        return { serviceId, isHealthy };
    });
    
    const results = await Promise.all(healthChecks);
    
    const summary = {
        timestamp: new Date().toISOString(),
        total: results.length,
        healthy: results.filter(r => r.isHealthy).length,
        unhealthy: results.filter(r => !r.isHealthy).length,
        results: results.map(r => ({
            service: r.serviceId,
            name: serviceRegistry[r.serviceId].name,
            status: r.isHealthy ? 'healthy' : 'unhealthy',
            url: serviceRegistry[r.serviceId].url
        }))
    };
    
    console.log(`✅ Health check complete: ${summary.healthy}/${summary.total} services healthy`);
    
    res.json({
        success: true,
        data: summary,
        message: `Health check completed: ${summary.healthy}/${summary.total} services are healthy`
    });
});

// Start the gateway
app.listen(PORT, () => {
    console.log(`🚀 CODAI Simple Gateway running on port ${PORT}`);
    console.log(`❤️  Gateway Health: http://localhost:${PORT}/health`);
    console.log(`🔍 Services Status: http://localhost:${PORT}/api/gateway/services`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/gateway/health-check`);
    console.log(`\n📋 Registered Services:`);
    Object.entries(serviceRegistry).forEach(([id, config]) => {
        console.log(`   ${config.name}: ${config.url}`);
    });
    console.log(`\n✅ Gateway ready (${Object.keys(serviceRegistry).length} services registered)`);
});
