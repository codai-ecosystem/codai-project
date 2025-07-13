const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

class AjutaiService {
  constructor() {
    this.app = express();
    this.port = 4003;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    });
    this.app.use('/api', limiter);
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'ajutai',
        port: 4003,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Service info
    this.app.get('/info', (req, res) => {
      res.json({
        name: 'ajutai',
        description: 'AI Support & Help Platform',
        type: 'support',
        port: 4003,
        version: '1.0.0'
      });
    });

    // API routes
    this.app.get('/api', (req, res) => {
      res.json({
        service: 'ajutai',
        message: 'API endpoint for AI Support & Help Platform',
        endpoints: ['/health', '/info', '/api']
      });
    });
  }

  setupErrorHandling() {
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        service: 'ajutai'
      });
    });

    this.app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        service: 'ajutai'
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err) => {
        if (err) reject(err);
        console.log(`🚀 ${config.name} service running on port ${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

if (require.main === module) {
  const service = new AjutaiService();
  service.start().catch(console.error);
}

module.exports = AjutaiService;