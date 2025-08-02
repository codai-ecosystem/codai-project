/**
 * CODAI Ecosystem Monitoring Dashboard
 * Phase 4.2.1 - Enhanced Monitoring & Analytics Implementation
 * Real-time ecosystem health and performance monitoring
 */

const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = 4100; // Monitoring Dashboard Port

// Store metrics data
let metricsData = {
    services: {},
    ecosystem: {
        startTime: Date.now(),
        totalRequests: 0,
        errorCount: 0,
        avgResponseTime: 0,
        activeConnections: 0
    },
    cbd: {
        operations: 0,
        paradigms: [],
        performance: {}
    }
};

// Service registry for monitoring
const servicesToMonitor = {
    'cbd': { name: 'CBD Universal Database', url: 'http://localhost:4180', port: 4180 },
    'gateway': { name: 'API Gateway', url: 'http://localhost:3000', port: 3000 },
    'codai': { name: 'CODAI Main App', url: 'http://localhost:4001', port: 4001 },
    'id': { name: 'ID Service', url: 'http://localhost:4004', port: 4004 },
    'memorai': { name: 'MemorAI App', url: 'http://localhost:4006', port: 4006 },
    'hub': { name: 'Hub App', url: 'http://localhost:4008', port: 4008 },
    'admin': { name: 'Admin Dashboard', url: 'http://localhost:4007', port: 4007 },
    'bancai': { name: 'BancAI App', url: 'http://localhost:4005', port: 4005 },
    'controlai': { name: 'ControlAI Dashboard', url: 'http://localhost:4200', port: 4200 }
};

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Health check function
async function checkServiceHealth(serviceId, config) {
    const startTime = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${config.url}/health`, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'User-Agent': 'CODAI-Monitor/1.0' }
        });

        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;
        const isHealthy = response.ok;

        // Store metrics
        metricsData.services[serviceId] = {
            name: config.name,
            status: isHealthy ? 'healthy' : 'unhealthy',
            responseTime: responseTime,
            lastCheck: new Date().toISOString(),
            url: config.url,
            port: config.port,
            uptime: isHealthy ? Math.floor(process.uptime()) : 0
        };

        return { serviceId, healthy: isHealthy, responseTime };
    } catch (error) {
        metricsData.services[serviceId] = {
            name: config.name,
            status: 'error',
            responseTime: Date.now() - startTime,
            lastCheck: new Date().toISOString(),
            url: config.url,
            port: config.port,
            error: error.message,
            uptime: 0
        };

        return { serviceId, healthy: false, responseTime: Date.now() - startTime, error: error.message };
    }
}

// CBD specific metrics collection
async function collectCBDMetrics() {
    try {
        const response = await fetch('http://localhost:4180/stats');
        if (response.ok) {
            const stats = await response.json();
            metricsData.cbd = {
                ...metricsData.cbd,
                service: stats.service,
                uptime: stats.uptime,
                paradigms: Object.keys(stats.paradigms),
                memory: stats.memory,
                version: stats.version,
                lastUpdated: new Date().toISOString()
            };
        }
    } catch (error) {
        console.error('[CBD METRICS] Error collecting CBD metrics:', error.message);
    }
}

// Ecosystem performance calculations
function calculateEcosystemMetrics() {
    const services = Object.values(metricsData.services);
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;
    const avgResponseTime = services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / totalServices;

    metricsData.ecosystem = {
        ...metricsData.ecosystem,
        healthyServices,
        totalServices,
        healthPercentage: Math.round((healthyServices / totalServices) * 100),
        avgResponseTime: Math.round(avgResponseTime),
        uptime: Math.floor((Date.now() - metricsData.ecosystem.startTime) / 1000),
        lastUpdated: new Date().toISOString()
    };
}

// Monitoring endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'CODAI Monitoring Dashboard',
        version: '1.0.0',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/metrics', (req, res) => {
    res.json({
        success: true,
        data: metricsData,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/services', (req, res) => {
    res.json({
        success: true,
        data: {
            services: metricsData.services,
            summary: {
                total: Object.keys(metricsData.services).length,
                healthy: Object.values(metricsData.services).filter(s => s.status === 'healthy').length,
                unhealthy: Object.values(metricsData.services).filter(s => s.status !== 'healthy').length
            }
        }
    });
});

app.get('/api/ecosystem', (req, res) => {
    res.json({
        success: true,
        data: metricsData.ecosystem
    });
});

app.get('/api/cbd', (req, res) => {
    res.json({
        success: true,
        data: metricsData.cbd
    });
});

// Real-time health monitoring
app.get('/api/healthcheck', async (req, res) => {
    const results = await Promise.all(
        Object.entries(servicesToMonitor).map(([id, config]) =>
            checkServiceHealth(id, config)
        )
    );

    calculateEcosystemMetrics();
    await collectCBDMetrics();

    res.json({
        success: true,
        data: {
            results,
            ecosystem: metricsData.ecosystem,
            services: metricsData.services,
            cbd: metricsData.cbd
        },
        timestamp: new Date().toISOString()
    });
});

// Dashboard HTML
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CODAI Ecosystem Monitoring Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        
        .header {
            background: rgba(0,0,0,0.2);
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid rgba(255,255,255,0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: #fff;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            padding-bottom: 10px;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .metric:last-child {
            border-bottom: none;
        }
        
        .metric-label {
            font-weight: 500;
            opacity: 0.9;
        }
        
        .metric-value {
            font-weight: bold;
            padding: 4px 12px;
            border-radius: 20px;
            background: rgba(255,255,255,0.2);
        }
        
        .status-healthy { background: rgba(34, 197, 94, 0.8) !important; }
        .status-unhealthy { background: rgba(239, 68, 68, 0.8) !important; }
        .status-warning { background: rgba(245, 158, 11, 0.8) !important; }
        
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        
        .service-item {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .service-healthy {
            border-color: rgba(34, 197, 94, 0.6);
            background: rgba(34, 197, 94, 0.1);
        }
        
        .service-unhealthy {
            border-color: rgba(239, 68, 68, 0.6);
            background: rgba(239, 68, 68, 0.1);
        }
        
        .refresh-btn {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            margin: 20px auto;
            display: block;
        }
        
        .refresh-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.05);
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            font-size: 1.2rem;
            opacity: 0.8;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 CODAI Ecosystem Monitoring</h1>
        <p>Phase 4.2 - Production Deployment Optimization Dashboard</p>
        <p id="lastUpdate">Loading...</p>
    </div>
    
    <div class="dashboard">
        <div class="card">
            <h3>🌐 Ecosystem Overview</h3>
            <div id="ecosystem-metrics">
                <div class="loading pulse">Loading ecosystem metrics...</div>
            </div>
        </div>
        
        <div class="card">
            <h3>💾 CBD Universal Database</h3>
            <div id="cbd-metrics">
                <div class="loading pulse">Loading CBD metrics...</div>
            </div>
        </div>
        
        <div class="card">
            <h3>🔧 Service Health Status</h3>
            <div id="service-metrics">
                <div class="loading pulse">Loading service metrics...</div>
            </div>
        </div>
        
        <div class="card">
            <h3>📊 Performance Analytics</h3>
            <div id="performance-metrics">
                <div class="loading pulse">Loading performance data...</div>
            </div>
        </div>
    </div>
    
    <button class="refresh-btn" onclick="refreshDashboard()">🔄 Refresh Dashboard</button>
    
    <script>
        let autoRefresh = true;
        
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/healthcheck');
                const data = await response.json();
                
                if (data.success) {
                    updateEcosystemMetrics(data.data.ecosystem);
                    updateCBDMetrics(data.data.cbd);
                    updateServiceMetrics(data.data.services);
                    updatePerformanceMetrics(data.data);
                    
                    document.getElementById('lastUpdate').textContent = 
                        'Last Updated: ' + new Date().toLocaleString();
                }
            } catch (error) {
                console.error('Dashboard update error:', error);
            }
        }
        
        function updateEcosystemMetrics(ecosystem) {
            const container = document.getElementById('ecosystem-metrics');
            container.innerHTML = \`
                <div class="metric">
                    <span class="metric-label">Total Services</span>
                    <span class="metric-value">\${ecosystem.totalServices || 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Healthy Services</span>
                    <span class="metric-value status-healthy">\${ecosystem.healthyServices || 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Health Percentage</span>
                    <span class="metric-value \${ecosystem.healthPercentage >= 80 ? 'status-healthy' : 'status-warning'}">\${ecosystem.healthPercentage || 0}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Response Time</span>
                    <span class="metric-value">\${ecosystem.avgResponseTime || 0}ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Uptime</span>
                    <span class="metric-value">\${Math.floor((ecosystem.uptime || 0) / 60)}m \${(ecosystem.uptime || 0) % 60}s</span>
                </div>
            \`;
        }
        
        function updateCBDMetrics(cbd) {
            const container = document.getElementById('cbd-metrics');
            container.innerHTML = \`
                <div class="metric">
                    <span class="metric-label">Service Status</span>
                    <span class="metric-value status-healthy">Operational</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Uptime</span>
                    <span class="metric-value">\${Math.floor((cbd.uptime || 0) / 60)}m \${(cbd.uptime || 0) % 60}s</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Active Paradigms</span>
                    <span class="metric-value">\${cbd.paradigms ? cbd.paradigms.length : 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Memory Usage</span>
                    <span class="metric-value">\${cbd.memory ? Math.round(cbd.memory.rss / 1024 / 1024) : 0}MB</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Node Version</span>
                    <span class="metric-value">\${cbd.version || 'N/A'}</span>
                </div>
            \`;
        }
        
        function updateServiceMetrics(services) {
            const container = document.getElementById('service-metrics');
            const serviceArray = Object.entries(services || {});
            
            const servicesGrid = serviceArray.map(([id, service]) => \`
                <div class="service-item \${service.status === 'healthy' ? 'service-healthy' : 'service-unhealthy'}">
                    <div style="font-weight: bold; margin-bottom: 5px;">\${service.name}</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Port: \${service.port}</div>
                    <div style="font-size: 0.9rem; margin-top: 5px;">
                        <span class="metric-value \${service.status === 'healthy' ? 'status-healthy' : 'status-unhealthy'}">
                            \${service.status}
                        </span>
                    </div>
                    <div style="font-size: 0.8rem; margin-top: 5px; opacity: 0.7;">
                        \${service.responseTime}ms
                    </div>
                </div>
            \`).join('');
            
            container.innerHTML = \`<div class="services-grid">\${servicesGrid}</div>\`;
        }
        
        function updatePerformanceMetrics(data) {
            const container = document.getElementById('performance-metrics');
            const avgResponse = data.ecosystem?.avgResponseTime || 0;
            const healthPercent = data.ecosystem?.healthPercentage || 0;
            
            container.innerHTML = \`
                <div class="metric">
                    <span class="metric-label">System Health</span>
                    <span class="metric-value \${healthPercent >= 90 ? 'status-healthy' : healthPercent >= 70 ? 'status-warning' : 'status-unhealthy'}">\${healthPercent}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Response Performance</span>
                    <span class="metric-value \${avgResponse < 100 ? 'status-healthy' : avgResponse < 500 ? 'status-warning' : 'status-unhealthy'}">\${avgResponse}ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Availability Target</span>
                    <span class="metric-value status-healthy">99.95%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Performance Grade</span>
                    <span class="metric-value \${healthPercent >= 95 && avgResponse < 100 ? 'status-healthy' : 'status-warning'}">
                        \${healthPercent >= 95 && avgResponse < 100 ? 'A+' : healthPercent >= 85 ? 'B+' : 'C'}
                    </span>
                </div>
            \`;
        }
        
        function refreshDashboard() {
            loadDashboardData();
        }
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            if (autoRefresh) {
                loadDashboardData();
            }
        }, 30000);
        
        // Initial load
        loadDashboardData();
    </script>
</body>
</html>
    `);
});

// Start periodic monitoring
setInterval(async () => {
    console.log('[MONITOR] Performing health checks...');
    const results = await Promise.all(
        Object.entries(servicesToMonitor).map(([id, config]) =>
            checkServiceHealth(id, config)
        )
    );

    calculateEcosystemMetrics();
    await collectCBDMetrics();

    const healthyCount = results.filter(r => r.healthy).length;
    console.log(`[MONITOR] Health check complete: ${healthyCount}/${results.length} services healthy`);
}, 30000);

// Start the monitoring dashboard
app.listen(PORT, () => {
    console.log(`🚀 CODAI Monitoring Dashboard running on port ${PORT}`);
    console.log(`📊 Dashboard URL: http://localhost:${PORT}`);
    console.log(`📈 Metrics API: http://localhost:${PORT}/api/metrics`);
    console.log(`❤️  Health API: http://localhost:${PORT}/api/healthcheck`);
    console.log(`🔍 Services API: http://localhost:${PORT}/api/services`);
    console.log(`\n✅ Phase 4.2.1 - Enhanced Monitoring & Analytics active!`);
    console.log(`🔄 Automatic health checks every 30 seconds`);
    console.log(`📋 Monitoring ${Object.keys(servicesToMonitor).length} services`);

    // Initial health check
    setTimeout(async () => {
        console.log('\n🔍 Performing initial comprehensive health check...');
        const results = await Promise.all(
            Object.entries(servicesToMonitor).map(([id, config]) =>
                checkServiceHealth(id, config)
            )
        );
        calculateEcosystemMetrics();
        await collectCBDMetrics();

        const healthyCount = results.filter(r => r.healthy).length;
        console.log(`✅ Initial health check: ${healthyCount}/${results.length} services healthy`);
        console.log(`📊 Dashboard ready: http://localhost:${PORT}\n`);
    }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down monitoring dashboard...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down monitoring dashboard...');
    process.exit(0);
});

module.exports = app;
