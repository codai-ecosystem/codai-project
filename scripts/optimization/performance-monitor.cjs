const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 4999;

// Middleware
app.use(cors());
app.use(express.json());

// Service configuration
const SERVICES = [
    { name: 'CODAI', port: 5000, url: 'http://localhost:5000/api/health' },
    { name: 'MEMORAI', port: 5002, url: 'http://localhost:5002/api/health' },
    { name: 'ANALIZAI', port: 5003, url: 'http://localhost:5003/api/health' },
    { name: 'BANCAI', port: 5004, url: 'http://localhost:5004/api/health' },
    { name: 'STOCAI', port: 5005, url: 'http://localhost:5005/api/health' },
    { name: 'AIDE', port: 5008, url: 'http://localhost:5008/api/health' },
    { name: 'MARKETAI', port: 5026, url: 'http://localhost:5026/api/health' },
    { name: 'TALENTAI', port: 5037, url: 'http://localhost:5037/api/health' },
    { name: 'API_GATEWAY', port: 8080, url: 'http://localhost:8080/health' }
];

// Performance metrics storage
let performanceMetrics = {
    timestamp: new Date().toISOString(),
    services: {},
    system: {},
    aggregated: {
        totalServices: SERVICES.length,
        activeServices: 0,
        averageResponseTime: 0,
        systemLoad: 0
    }
};

// Health check function
async function checkServiceHealth(service) {
    try {
        const startTime = Date.now();
        const response = await fetch(service.url, {
            method: 'GET',
            timeout: 5000,
            headers: { 'Accept': 'application/json' }
        });

        const responseTime = Date.now() - startTime;
        const isHealthy = response.ok;

        let healthData = null;
        try {
            healthData = await response.json();
        } catch (e) {
            healthData = { status: response.ok ? 'ok' : 'error' };
        }

        return {
            name: service.name,
            port: service.port,
            status: isHealthy ? 'healthy' : 'unhealthy',
            responseTime,
            lastCheck: new Date().toISOString(),
            details: healthData
        };
    } catch (error) {
        return {
            name: service.name,
            port: service.port,
            status: 'offline',
            responseTime: null,
            lastCheck: new Date().toISOString(),
            error: error.message
        };
    }
}

// System metrics collection
function getSystemMetrics() {
    const used = process.memoryUsage();
    return {
        memory: {
            rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
            heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
            heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
            external: Math.round(used.external / 1024 / 1024 * 100) / 100
        },
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform
    };
}

// Comprehensive health check endpoint
app.get('/health', async (req, res) => {
    try {
        console.log('🔍 Running comprehensive health check...');

        // Check all services
        const serviceChecks = await Promise.all(
            SERVICES.map(service => checkServiceHealth(service))
        );

        // Update performance metrics
        const systemMetrics = getSystemMetrics();
        const activeServices = serviceChecks.filter(s => s.status === 'healthy').length;
        const avgResponseTime = serviceChecks
            .filter(s => s.responseTime !== null)
            .reduce((sum, s) => sum + s.responseTime, 0) / serviceChecks.length || 0;

        performanceMetrics = {
            timestamp: new Date().toISOString(),
            services: serviceChecks.reduce((acc, service) => {
                acc[service.name] = service;
                return acc;
            }, {}),
            system: systemMetrics,
            aggregated: {
                totalServices: SERVICES.length,
                activeServices,
                averageResponseTime: Math.round(avgResponseTime),
                systemLoad: Math.round((systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal) * 100)
            }
        };

        console.log(`✅ Health check complete: ${activeServices}/${SERVICES.length} services active`);

        res.json({
            status: 'healthy',
            monitor: 'Performance Monitor',
            port: PORT,
            timestamp: performanceMetrics.timestamp,
            summary: performanceMetrics.aggregated,
            services: performanceMetrics.services,
            system: performanceMetrics.system
        });
    } catch (error) {
        console.error('❌ Health check failed:', error);
        res.status(500).json({
            status: 'error',
            monitor: 'Performance Monitor',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Real-time metrics endpoint
app.get('/metrics', (req, res) => {
    res.json(performanceMetrics);
});

// Service status summary
app.get('/status', (req, res) => {
    const serviceStatus = Object.values(performanceMetrics.services || {}).map(service => ({
        name: service.name,
        port: service.port,
        status: service.status,
        responseTime: service.responseTime
    }));

    res.json({
        timestamp: performanceMetrics.timestamp,
        summary: performanceMetrics.aggregated,
        services: serviceStatus
    });
});

// Performance dashboard (simple HTML)
app.get('/dashboard', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CODAI Ecosystem Performance Monitor</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .service { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .healthy { border-left-color: #10b981; }
        .unhealthy { border-left-color: #f59e0b; }
        .offline { border-left-color: #ef4444; }
        .status { font-weight: bold; }
        .refresh { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .refresh:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 CODAI Ecosystem Performance Monitor</h1>
          <p>Real-time monitoring of all CODAI services and infrastructure</p>
          <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
        </div>
        
        <div class="metrics">
          <div class="card">
            <h3>📊 System Overview</h3>
            <div id="overview">Loading...</div>
          </div>
          
          <div class="card">
            <h3>🏥 Service Health</h3>
            <div id="services">Loading...</div>
          </div>
          
          <div class="card">
            <h3>💻 System Metrics</h3>
            <div id="system">Loading...</div>
          </div>
        </div>
      </div>

      <script>
        async function loadMetrics() {
          try {
            const response = await fetch('/metrics');
            const data = await response.json();
            
            // Overview
            document.getElementById('overview').innerHTML = \`
              <p><strong>Active Services:</strong> \${data.aggregated.activeServices}/\${data.aggregated.totalServices}</p>
              <p><strong>Average Response:</strong> \${data.aggregated.averageResponseTime}ms</p>
              <p><strong>System Load:</strong> \${data.aggregated.systemLoad}%</p>
              <p><strong>Last Update:</strong> \${new Date(data.timestamp).toLocaleString()}</p>
            \`;
            
            // Services
            const servicesHtml = Object.values(data.services).map(service => \`
              <div class="service \${service.status}">
                <div>
                  <strong>\${service.name}</strong><br>
                  <small>Port: \${service.port}</small>
                </div>
                <div>
                  <span class="status">\${service.status.toUpperCase()}</span><br>
                  <small>\${service.responseTime ? service.responseTime + 'ms' : 'N/A'}</small>
                </div>
              </div>
            \`).join('');
            document.getElementById('services').innerHTML = servicesHtml;
            
            // System
            document.getElementById('system').innerHTML = \`
              <p><strong>Memory (Heap):</strong> \${data.system.memory.heapUsed}MB / \${data.system.memory.heapTotal}MB</p>
              <p><strong>Memory (RSS):</strong> \${data.system.memory.rss}MB</p>
              <p><strong>Uptime:</strong> \${Math.round(data.system.uptime)}s</p>
              <p><strong>Node.js:</strong> \${data.system.nodeVersion}</p>
            \`;
          } catch (error) {
            console.error('Failed to load metrics:', error);
          }
        }
        
        loadMetrics();
        setInterval(loadMetrics, 10000); // Auto-refresh every 10 seconds
      </script>
    </body>
    </html>
  `;
    res.send(html);
});

// Start the performance monitor
app.listen(PORT, () => {
    console.log('🚀 CODAI Performance Monitor Started');
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`🏥 Health API: http://localhost:${PORT}/health`);
    console.log(`📈 Metrics API: http://localhost:${PORT}/metrics`);
    console.log(`📋 Status API: http://localhost:${PORT}/status`);
    console.log('='.repeat(60));

    // Initial health check
    setTimeout(async () => {
        try {
            const response = await fetch(`http://localhost:${PORT}/health`);
            const data = await response.json();
            console.log(`✅ Initial scan: ${data.summary.activeServices}/${data.summary.totalServices} services active`);
        } catch (error) {
            console.log('⚠️ Initial health check failed - this is normal on first startup');
        }
    }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Performance Monitor shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Performance Monitor shutting down...');
    process.exit(0);
});
