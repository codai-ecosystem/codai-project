// 📊 Enterprise Performance Monitor for Codai Ecosystem
// Real-time monitoring and metrics collection

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import compression from 'compression';
import cors from 'cors';

const app = express();
const PORT = 4999; // Monitoring dashboard port

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Performance metrics storage
let metrics = {
    responseData: [],
    healthChecks: [],
    errorCounts: {},
    lastUpdated: new Date().toISOString()
};

// App configurations for monitoring
const apps = [
    // Next.js Applications
    { name: 'CodAI', port: 4030, type: 'nextjs', domain: 'codai.ro' },
    { name: 'MemorAI', port: 4031, type: 'nextjs', domain: 'memorai.ro' },
    { name: 'LogAI', port: 4032, type: 'nextjs', domain: 'logai.ro' },
    { name: 'BancAI', port: 4033, type: 'nextjs', domain: 'bancai.ro' },
    { name: 'Mobile App', port: 4056, type: 'nextjs', domain: 'mobile.codai.ro' },

    // Express.js Services (sample for monitoring)
    { name: 'AIDE', port: 4041, type: 'express', domain: 'aide.codai.ro' },
    { name: 'AnalizAI', port: 4042, type: 'express', domain: 'analizai.ro' },
    { name: 'MarketAI', port: 4043, type: 'express', domain: 'marketai.ro' }
];

// Performance monitoring function
async function checkPerformance() {
    const timestamp = new Date().toISOString();
    const results = [];

    for (const appConfig of apps) {
        try {
            const startTime = Date.now();
            const response = await fetch(`http://localhost:${appConfig.port}`, {
                method: 'GET',
                timeout: 5000
            }).catch(() => null);

            const responseTime = Date.now() - startTime;

            const result = {
                app: appConfig.name,
                port: appConfig.port,
                type: appConfig.type,
                domain: appConfig.domain,
                responseTime,
                status: response ? response.status : 'TIMEOUT',
                healthy: response && response.status === 200,
                timestamp
            };

            results.push(result);

            // Log slow responses
            if (responseTime > 100) {
                console.log(`⚠️ Slow response: ${appConfig.name} took ${responseTime}ms`);
            }

        } catch (error) {
            results.push({
                app: appConfig.name,
                port: appConfig.port,
                type: appConfig.type,
                domain: appConfig.domain,
                responseTime: -1,
                status: 'ERROR',
                healthy: false,
                error: error.message,
                timestamp
            });
        }
    }

    // Store metrics
    metrics.responseData = results;
    metrics.healthChecks.push({
        timestamp,
        totalApps: apps.length,
        healthyApps: results.filter(r => r.healthy).length,
        averageResponseTime: Math.round(results.reduce((sum, r) => sum + (r.responseTime > 0 ? r.responseTime : 0), 0) / results.length)
    });

    // Keep only last 100 health checks
    if (metrics.healthChecks.length > 100) {
        metrics.healthChecks = metrics.healthChecks.slice(-100);
    }

    metrics.lastUpdated = timestamp;

    console.log(`✅ Performance check completed - ${results.filter(r => r.healthy).length}/${apps.length} apps healthy`);
    return results;
}

// API Endpoints
app.get('/api/metrics', (req, res) => {
    res.json(metrics);
});

app.get('/api/health', (req, res) => {
    const healthyCount = metrics.responseData.filter(app => app.healthy).length;
    const totalCount = metrics.responseData.length;

    res.json({
        status: healthyCount === totalCount ? 'healthy' : 'degraded',
        healthy: healthyCount,
        total: totalCount,
        timestamp: metrics.lastUpdated
    });
});

app.get('/api/performance/current', async (req, res) => {
    const results = await checkPerformance();
    res.json(results);
});

// Performance dashboard HTML
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>🚀 Codai Ecosystem Performance Monitor</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .healthy { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .app-status { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 4px; }
        h1 { color: #333; }
        h2 { color: #666; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .refresh-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .stats { display: flex; gap: 20px; }
        .stat { text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Codai Ecosystem Performance Monitor</h1>
        
        <div class="card">
            <h2>📊 Real-time Status</h2>
            <button class="refresh-btn" onclick="refreshMetrics()">🔄 Refresh Metrics</button>
            <div id="status-content">Loading...</div>
        </div>
        
        <div class="metrics-grid">
            <div class="card">
                <h2>🎯 Performance Summary</h2>
                <div id="performance-summary">Loading...</div>
            </div>
            
            <div class="card">
                <h2>📈 Health Trend</h2>
                <div id="health-trend">Loading...</div>
            </div>
        </div>
        
        <div class="card">
            <h2>🔍 Application Details</h2>
            <div id="app-details">Loading...</div>
        </div>
    </div>

    <script>
        async function refreshMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const data = await response.json();
                
                updateStatus(data);
                updatePerformanceSummary(data);
                updateAppDetails(data);
                updateHealthTrend(data);
                
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        }
        
        function updateStatus(data) {
            const healthy = data.responseData.filter(app => app.healthy).length;
            const total = data.responseData.length;
            const status = healthy === total ? 'healthy' : 'degraded';
            
            document.getElementById('status-content').innerHTML = \`
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value \${status === 'healthy' ? 'healthy' : 'warning'}">\${healthy}/\${total}</div>
                        <div>Apps Healthy</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">
                            \${data.healthChecks.length > 0 ? data.healthChecks[data.healthChecks.length-1].averageResponseTime + 'ms' : 'N/A'}
                        </div>
                        <div>Avg Response</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value healthy">27</div>
                        <div>Total Services</div>
                    </div>
                </div>
                <p>Last updated: \${new Date(data.lastUpdated).toLocaleString()}</p>
            \`;
        }
        
        function updateAppDetails(data) {
            const appsHtml = data.responseData.map(app => \`
                <div class="app-status">
                    <div>
                        <strong>\${app.app}</strong> (\${app.type}) - \${app.domain}:\${app.port}
                    </div>
                    <div>
                        <span class="\${app.healthy ? 'healthy' : 'error'}">
                            \${app.healthy ? '✅' : '❌'} \${app.status}
                        </span>
                        <span class="\${app.responseTime < 50 ? 'healthy' : app.responseTime < 100 ? 'warning' : 'error'}">
                            \${app.responseTime > 0 ? app.responseTime + 'ms' : 'N/A'}
                        </span>
                    </div>
                </div>
            \`).join('');
            
            document.getElementById('app-details').innerHTML = appsHtml;
        }
        
        function updatePerformanceSummary(data) {
            const fastApps = data.responseData.filter(app => app.responseTime > 0 && app.responseTime < 50).length;
            const slowApps = data.responseData.filter(app => app.responseTime >= 100).length;
            
            document.getElementById('performance-summary').innerHTML = \`
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value healthy">\${fastApps}</div>
                        <div>Fast Apps (&lt;50ms)</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value \${slowApps > 0 ? 'warning' : 'healthy'}">\${slowApps}</div>
                        <div>Slow Apps (≥100ms)</div>
                    </div>
                </div>
            \`;
        }
        
        function updateHealthTrend(data) {
            const recentChecks = data.healthChecks.slice(-10);
            const trendHtml = recentChecks.map(check => \`
                <div style="display: flex; justify-content: space-between; padding: 5px;">
                    <span>\${new Date(check.timestamp).toLocaleTimeString()}</span>
                    <span class="\${check.healthyApps === check.totalApps ? 'healthy' : 'warning'}">
                        \${check.healthyApps}/\${check.totalApps} (\${check.averageResponseTime}ms)
                    </span>
                </div>
            \`).join('');
            
            document.getElementById('health-trend').innerHTML = trendHtml || 'No trend data available';
        }
        
        // Auto-refresh every 30 seconds
        setInterval(refreshMetrics, 30000);
        
        // Initial load
        refreshMetrics();
    </script>
</body>
</html>
    `);
});

// Start monitoring
let monitoringInterval;

function startMonitoring() {
    console.log('🚀 Starting Codai Ecosystem Performance Monitor...');
    console.log(`📊 Dashboard available at: http://localhost:${PORT}`);

    // Initial performance check
    checkPerformance();

    // Set up periodic monitoring (every 30 seconds)
    monitoringInterval = setInterval(checkPerformance, 30000);
}

// Start server
app.listen(PORT, () => {
    console.log(`✅ Performance Monitor started on port ${PORT}`);
    startMonitoring();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Stopping Performance Monitor...');
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
    process.exit(0);
});
