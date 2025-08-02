import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4018;
const serviceName = 'hub';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    service: 'hub',
    status: 'operational',
    timestamp: new Date().toISOString(),
    port: 4018,
    message: 'hub service is running successfully'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    service: 'hub'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    service: 'hub',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: ['api', 'health-check', 'cors-enabled']
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ ${serviceName.toUpperCase()} service running at http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔧 API status: http://localhost:${port}/api/status`);
});
