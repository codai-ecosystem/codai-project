// Enhanced API Gateway Configuration
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Service proxies
const services = {
  codai: 'http://localhost:4000',
  memorai: 'http://localhost:4001',
  bancai: 'http://localhost:4002',
  stocai: 'http://localhost:4003',
  talentai: 'http://localhost:4004',
  prezentai: 'http://localhost:4005'
};

Object.entries(services).forEach(([service, target]) => {
  app.use(`/${service}`, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^/${service}`]: '' },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${service}:`, err.message);
      res.status(503).json({ error: 'Service unavailable' });
    }
  }));
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});

export default app;
