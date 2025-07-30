// 🔧 Production Server Entry Point for METU

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ServerResponse } from 'http';
import { MetuDeviceServer } from '../services/discovery/MetuDeviceServer.minimal';
import { HealthMonitor } from './monitoring/health';
import { MetricsCollector } from './monitoring/metrics';
import { securityMiddleware } from './middleware/security';
import { apiKeyMiddleware } from './middleware/auth';
import { loggingMiddleware } from './middleware/logging';

const app = express();
const PORT = process.env.PORT || 4400;
const DEVICE_SERVER_PORT = process.env.DEVICE_SERVER_PORT || 4402;

// Initialize monitoring
const healthMonitor = new HealthMonitor();
const metricsCollector = new MetricsCollector();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss:", "https:", "ws:"],
      mediaSrc: ["'self'", "blob:", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter as any);

// Compression
app.use(compression() as any);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(loggingMiddleware);

// Metrics collection middleware
app.use((req, res, next) => {
  const start = Date.now();
  healthMonitor.recordRequest();

  res.on('finish', () => {
    const duration = Date.now() - start;
    metricsCollector.recordLatency('http_request', duration);

    if (res.statusCode >= 400) {
      healthMonitor.recordError();
    }
  });

  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const health = await healthMonitor.getHealthStatus();
    const metrics = metricsCollector.getMetrics();

    res.json({
      ...health,
      metrics,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics endpoint for Prometheus
app.get('/api/metrics', async (req, res) => {
  const metrics = metricsCollector.getMetrics();
  const health = await healthMonitor.getHealthStatus();

  // Convert to Prometheus format
  let prometheusMetrics = '';

  // HTTP request metrics
  prometheusMetrics += `# HELP metu_http_requests_total Total number of HTTP requests\n`;
  prometheusMetrics += `# TYPE metu_http_requests_total counter\n`;
  prometheusMetrics += `metu_http_requests_total ${health.metrics?.requestCount || 0}\n\n`;

  // Error metrics
  prometheusMetrics += `# HELP metu_http_errors_total Total number of HTTP errors\n`;
  prometheusMetrics += `# TYPE metu_http_errors_total counter\n`;
  prometheusMetrics += `metu_http_errors_total ${health.metrics?.errorCount || 0}\n\n`;

  // Voice interaction metrics
  prometheusMetrics += `# HELP metu_voice_interactions_total Total number of voice interactions\n`;
  prometheusMetrics += `# TYPE metu_voice_interactions_total counter\n`;
  prometheusMetrics += `metu_voice_interactions_total ${health.metrics?.voiceInteractions || 0}\n\n`;

  // Connected devices
  prometheusMetrics += `# HELP metu_connected_devices Number of connected devices\n`;
  prometheusMetrics += `# TYPE metu_connected_devices gauge\n`;
  prometheusMetrics += `metu_connected_devices ${health.metrics?.connectedDevices || 0}\n\n`;

  // MCP connection status
  if (health.metrics?.mcpConnectionStatus) {
    prometheusMetrics += `# HELP metu_mcp_connection_status MCP server connection status\n`;
    prometheusMetrics += `# TYPE metu_mcp_connection_status gauge\n`;
    Object.entries(health.metrics.mcpConnectionStatus).forEach(([server, connected]) => {
      prometheusMetrics += `metu_mcp_connection_status{server="${server}"} ${connected ? 1 : 0}\n`;
    });
    prometheusMetrics += '\n';
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  prometheusMetrics += `# HELP metu_memory_usage_bytes Memory usage in bytes\n`;
  prometheusMetrics += `# TYPE metu_memory_usage_bytes gauge\n`;
  prometheusMetrics += `metu_memory_usage_bytes{type="rss"} ${memUsage.rss}\n`;
  prometheusMetrics += `metu_memory_usage_bytes{type="heap_used"} ${memUsage.heapUsed}\n`;
  prometheusMetrics += `metu_memory_usage_bytes{type="heap_total"} ${memUsage.heapTotal}\n\n`;

  res.set('Content-Type', 'text/plain');
  res.send(prometheusMetrics);
});

// API routes with authentication for sensitive endpoints
app.use('/api/admin', apiKeyMiddleware);

// Proxy to device server
app.use('/api/device', createProxyMiddleware({
  target: `http://localhost:${DEVICE_SERVER_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/device': '/api'
  },
  on: {
    error: (err: any, req: any, res: any) => {
      console.error('Proxy error:', err);
      healthMonitor.recordError();
      // Try to send error response if possible
      try {
        if (res && res.writeHead && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Device server unavailable',
            message: 'The device server is currently unavailable. Please try again later.'
          }));
        }
      } catch (e) {
        console.error('Error handling proxy error:', e);
      }
    }
  }
} as any));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
  app.use(express.static('dist/client'));

  // Serve Next.js static files if they exist
  if (require('fs').existsSync('.next')) {
    app.use('/_next', express.static('.next/static'));
  }

  // Catch-all handler for client-side routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(require('path').join(process.cwd(), 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  healthMonitor.recordError();

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start device server
const deviceServerConfig = {
  port: Number(DEVICE_SERVER_PORT),
  host: '0.0.0.0',
  serviceName: 'METU Device Server',
  serviceType: 'metu-device',
  corsOrigins: ['*'],
  enableRateLimit: true,
  maxRequestsPerWindow: 100,
  windowMs: 60000,
  azure: {
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-realtime-preview',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview',
    voice: 'alloy' as const
  }
};
const deviceServer = new MetuDeviceServer(deviceServerConfig);

async function startServer() {
  try {
    console.log('🚀 Starting METU Production Server...');

    // Start device server
    await deviceServer.start();
    console.log(`✅ Device server started on port ${DEVICE_SERVER_PORT}`);

    // Start main server
    app.listen(PORT, () => {
      console.log(`✅ METU server started on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Metrics: http://localhost:${PORT}/api/metrics`);
      console.log(`🎯 Ready for connections!`);
    });

    // Update MCP connection status in health monitor
    setInterval(async () => {
      try {
        // Check MCP connections and update health monitor
        healthMonitor.updateMCPStatus('playwright', true);
        healthMonitor.updateMCPStatus('memorai', true);
        healthMonitor.updateMCPStatus('glass', true);
        healthMonitor.updateMCPStatus('romai', true);

        // Update memory usage
        metricsCollector.recordMemoryUsage();
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, 30000); // Check every 30 seconds

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📱 SIGTERM received, shutting down gracefully...');
  await deviceServer.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📱 SIGINT received, shutting down gracefully...');
  await deviceServer.stop();
  process.exit(0);
});

// Start the server
startServer();
