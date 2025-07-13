const fs = require('fs');
const path = require('path');

// Service configurations for all 29 services
const serviceConfigs = [
    { name: 'admin', port: 4001, description: 'Enterprise Admin Panel & System Management Dashboard', type: 'management' },
    { name: 'AIDE', port: 4002, description: 'AI Development Environment', type: 'development' },
    { name: 'ajutai', port: 4003, description: 'AI Support & Help Platform', type: 'support' },
    { name: 'analizai', port: 4004, description: 'AI Analytics Platform', type: 'analytics' },
    { name: 'bancai', port: 4005, description: 'Financial Platform Service Layer', type: 'financial' },
    { name: 'codai', port: 4006, description: 'Central Platform Service Layer', type: 'platform' },
    { name: 'cumparai', port: 4007, description: 'AI Shopping Platform Service Layer', type: 'ecommerce' },
    { name: 'dash', port: 4008, description: 'Analytics Dashboard Service', type: 'analytics' },
    { name: 'docs', port: 4009, description: 'Documentation Platform', type: 'documentation' },
    { name: 'explorer', port: 4010, description: 'AI Blockchain Explorer', type: 'blockchain' },
    { name: 'fabricai', port: 4011, description: 'AI Services Platform Service Layer', type: 'ai-services' },
    { name: 'hub', port: 4012, description: 'Central Service Management Platform', type: 'management' },
    { name: 'id', port: 4013, description: 'Identity Management System', type: 'identity' },
    { name: 'jucai', port: 4014, description: 'AI Gaming Platform', type: 'gaming' },
    { name: 'kodex', port: 4015, description: 'Code Repository & Version Control', type: 'development' },
    { name: 'legalizai', port: 4016, description: 'AI Legal Services Platform', type: 'legal' },
    { name: 'logai', port: 4017, description: 'Identity & Authentication Service Layer', type: 'authentication' },
    { name: 'marketai', port: 4018, description: 'AI Marketing Platform', type: 'marketing' },
    { name: 'memorai', port: 4019, description: 'AI Memory & Database Service Layer', type: 'database' },
    { name: 'metu', port: 4020, description: 'AI Metrics & Analytics', type: 'metrics' },
    { name: 'mod', port: 4021, description: 'Modding & Extension Platform', type: 'modding' },
    { name: 'publicai', port: 4022, description: 'Public AI Services', type: 'public-services' },
    { name: 'sociai', port: 4023, description: 'AI Social Platform Service Layer', type: 'social' },
    { name: 'stocai', port: 4024, description: 'AI Stock Trading Platform', type: 'trading' },
    { name: 'studiai', port: 4025, description: 'AI Education Platform Service Layer', type: 'education' },
    { name: 'templates', port: 4026, description: 'Shared Templates & Boilerplates', type: 'templates' },
    { name: 'tools', port: 4027, description: 'Development Tools & Utilities', type: 'tools' },
    { name: 'wallet', port: 4028, description: 'Programmable Wallet Service Layer', type: 'wallet' },
    { name: 'x', port: 4029, description: 'AI Trading Platform Service Layer', type: 'trading' }
];

function createServiceImplementation(config) {
    const servicePath = path.join(__dirname, '..', 'services', config.name);

    // Create service directory if it doesn't exist
    if (!fs.existsSync(servicePath)) {
        fs.mkdirSync(servicePath, { recursive: true });
    }

    // Create package.json
    const packageJson = {
        name: `@codai/${config.name}`,
        version: "1.0.0",
        description: config.description,
        main: "index.js",
        type: "commonjs",
        scripts: {
            start: "node index.js",
            dev: "nodemon index.js",
            test: "jest"
        },
        dependencies: {
            express: "^4.18.2",
            cors: "^2.8.5",
            helmet: "^7.1.0",
            "express-rate-limit": "^7.1.5",
            dotenv: "^16.3.1"
        },
        devDependencies: {
            nodemon: "^3.0.2",
            jest: "^29.7.0"
        }
    };

    fs.writeFileSync(
        path.join(servicePath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    // Create main service file
    const serviceCode = `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

class ${config.name.charAt(0).toUpperCase() + config.name.slice(1)}Service {
  constructor() {
    this.app = express();
    this.port = ${config.port};
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
        service: '${config.name}',
        port: ${config.port},
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Service info
    this.app.get('/info', (req, res) => {
      res.json({
        name: '${config.name}',
        description: '${config.description}',
        type: '${config.type}',
        port: ${config.port},
        version: '1.0.0'
      });
    });

    // API routes
    this.app.get('/api', (req, res) => {
      res.json({
        service: '${config.name}',
        message: 'API endpoint for ${config.description}',
        endpoints: ['/health', '/info', '/api']
      });
    });
  }

  setupErrorHandling() {
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        service: '${config.name}'
      });
    });

    this.app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        service: '${config.name}'
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err) => {
        if (err) reject(err);
        console.log(\`🚀 \${config.name} service running on port \${this.port}\`);
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
  const service = new ${config.name.charAt(0).toUpperCase() + config.name.slice(1)}Service();
  service.start().catch(console.error);
}

module.exports = ${config.name.charAt(0).toUpperCase() + config.name.slice(1)}Service;`;

    fs.writeFileSync(path.join(servicePath, 'index.js'), serviceCode);

    // Create .env file
    const envContent = `PORT=${config.port}
NODE_ENV=development
SERVICE_NAME=${config.name}`;

    fs.writeFileSync(path.join(servicePath, '.env'), envContent);

    console.log(`✅ Created ${config.name} service (port ${config.port})`);
}

async function deployAllServices() {
    console.log('🚀 Creating all 29 Codai services...\n');

    let created = 0;
    let errors = 0;

    for (const config of serviceConfigs) {
        try {
            createServiceImplementation(config);
            created++;
        } catch (error) {
            console.error(`❌ Failed to create ${config.name}:`, error.message);
            errors++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Created: ${created} services`);
    console.log(`❌ Errors: ${errors} services`);
    console.log(`\n🔄 Next: Install dependencies and start services`);
}

deployAllServices();
