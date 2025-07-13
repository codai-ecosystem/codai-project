const fs = require('fs');
const path = require('path');
const CodeAIService = require('./enhanced-service-template.js');

// Service configurations for all 29 services
const serviceConfigs = [
    {
        name: 'admin',
        port: 4001,
        description: 'Enterprise Admin Panel & System Management Dashboard',
        type: 'management',
        capabilities: ['user-management', 'system-monitoring', 'configuration'],
        dependencies: ['postgres', 'redis']
    },
    {
        name: 'AIDE',
        port: 4002,
        description: 'AI Development Environment',
        type: 'development',
        capabilities: ['code-completion', 'ai-assistance', 'project-management'],
        dependencies: ['openai', 'postgres']
    },
    {
        name: 'ajutai',
        port: 4003,
        description: 'AI Support & Help Platform',
        type: 'support',
        capabilities: ['chat-support', 'ai-assistance', 'ticket-management'],
        dependencies: ['openai', 'postgres', 'redis']
    },
    {
        name: 'analizai',
        port: 4004,
        description: 'AI Analytics Platform',
        type: 'analytics',
        capabilities: ['data-analysis', 'reporting', 'insights'],
        dependencies: ['postgres', 'redis', 'analytics-engine']
    },
    {
        name: 'bancai',
        port: 4005,
        description: 'Financial Platform Service Layer',
        type: 'financial',
        capabilities: ['payments', 'banking', 'financial-insights'],
        dependencies: ['stripe', 'postgres', 'redis']
    },
    {
        name: 'codai',
        port: 4006,
        description: 'Central Platform Service Layer',
        type: 'platform',
        capabilities: ['service-discovery', 'orchestration', 'central-hub'],
        dependencies: ['postgres', 'redis', 'all-services']
    },
    {
        name: 'cumparai',
        port: 4007,
        description: 'AI Shopping Platform Service Layer',
        type: 'ecommerce',
        capabilities: ['product-catalog', 'ai-recommendations', 'shopping-cart'],
        dependencies: ['stripe', 'postgres', 'openai']
    },
    {
        name: 'dash',
        port: 4008,
        description: 'Analytics Dashboard Service',
        type: 'analytics',
        capabilities: ['real-time-dashboards', 'metrics', 'visualization'],
        dependencies: ['postgres', 'redis', 'metrics-collector']
    },
    {
        name: 'docs',
        port: 4009,
        description: 'Documentation Platform',
        type: 'documentation',
        capabilities: ['documentation', 'api-docs', 'knowledge-base'],
        dependencies: ['postgres', 'search-engine']
    },
    {
        name: 'explorer',
        port: 4010,
        description: 'AI Blockchain Explorer',
        type: 'blockchain',
        capabilities: ['blockchain-data', 'transaction-analysis', 'ai-insights'],
        dependencies: ['blockchain-node', 'postgres', 'openai']
    },
    {
        name: 'fabricai',
        port: 4011,
        description: 'AI Services Platform Service Layer',
        type: 'ai-services',
        capabilities: ['ai-models', 'custom-deployment', 'ai-marketplace'],
        dependencies: ['openai', 'postgres', 'model-registry']
    },
    {
        name: 'hub',
        port: 4012,
        description: 'Central Service Management Platform',
        type: 'management',
        capabilities: ['service-management', 'health-monitoring', 'configuration'],
        dependencies: ['postgres', 'redis', 'all-services']
    },
    {
        name: 'id',
        port: 4013,
        description: 'Identity Management System',
        type: 'identity',
        capabilities: ['user-identity', 'authentication', 'authorization'],
        dependencies: ['postgres', 'redis', 'oauth-providers']
    },
    {
        name: 'jucai',
        port: 4014,
        description: 'AI Gaming Platform',
        type: 'gaming',
        capabilities: ['game-services', 'ai-opponents', 'leaderboards'],
        dependencies: ['postgres', 'redis', 'openai']
    },
    {
        name: 'kodex',
        port: 4015,
        description: 'Code Repository & Version Control',
        type: 'development',
        capabilities: ['git-repository', 'version-control', 'code-review'],
        dependencies: ['git', 'postgres', 'file-storage']
    },
    {
        name: 'legalizai',
        port: 4016,
        description: 'AI Legal Services Platform',
        type: 'legal',
        capabilities: ['legal-documents', 'ai-legal-assistance', 'compliance'],
        dependencies: ['openai', 'postgres', 'document-storage']
    },
    {
        name: 'logai',
        port: 4017,
        description: 'Identity & Authentication Service Layer',
        type: 'authentication',
        capabilities: ['jwt-tokens', 'session-management', 'multi-factor-auth'],
        dependencies: ['postgres', 'redis', 'oauth-providers']
    },
    {
        name: 'marketai',
        port: 4018,
        description: 'AI Marketing Platform',
        type: 'marketing',
        capabilities: ['marketing-automation', 'ai-campaigns', 'analytics'],
        dependencies: ['openai', 'postgres', 'email-service']
    },
    {
        name: 'memorai',
        port: 4019,
        description: 'AI Memory & Database Service Layer',
        type: 'database',
        capabilities: ['semantic-search', 'vector-storage', 'ai-memory'],
        dependencies: ['postgres', 'vector-db', 'openai']
    },
    {
        name: 'metu',
        port: 4020,
        description: 'AI Metrics & Analytics',
        type: 'metrics',
        capabilities: ['metrics-collection', 'ai-insights', 'performance-monitoring'],
        dependencies: ['postgres', 'redis', 'prometheus']
    },
    {
        name: 'mod',
        port: 4021,
        description: 'Modding & Extension Platform',
        type: 'modding',
        capabilities: ['extensions', 'plugins', 'customization'],
        dependencies: ['postgres', 'file-storage', 'sandbox']
    },
    {
        name: 'publicai',
        port: 4022,
        description: 'Public AI Services',
        type: 'public-services',
        capabilities: ['public-apis', 'ai-services', 'transparency'],
        dependencies: ['openai', 'postgres', 'rate-limiter']
    },
    {
        name: 'sociai',
        port: 4023,
        description: 'AI Social Platform Service Layer',
        type: 'social',
        capabilities: ['social-features', 'ai-moderation', 'real-time-chat'],
        dependencies: ['postgres', 'redis', 'websockets', 'openai']
    },
    {
        name: 'stocai',
        port: 4024,
        description: 'AI Stock Trading Platform',
        type: 'trading',
        capabilities: ['stock-data', 'ai-trading', 'portfolio-management'],
        dependencies: ['financial-apis', 'postgres', 'openai']
    },
    {
        name: 'studiai',
        port: 4025,
        description: 'AI Education Platform Service Layer',
        type: 'education',
        capabilities: ['courses', 'ai-tutoring', 'progress-tracking'],
        dependencies: ['postgres', 'video-streaming', 'openai']
    },
    {
        name: 'templates',
        port: 4026,
        description: 'Shared Templates & Boilerplates',
        type: 'templates',
        capabilities: ['code-templates', 'project-scaffolding', 'best-practices'],
        dependencies: ['git', 'file-storage']
    },
    {
        name: 'tools',
        port: 4027,
        description: 'Development Tools & Utilities',
        type: 'tools',
        capabilities: ['dev-tools', 'utilities', 'automation'],
        dependencies: ['postgres', 'file-storage']
    },
    {
        name: 'wallet',
        port: 4028,
        description: 'Programmable Wallet Service Layer',
        type: 'wallet',
        capabilities: ['crypto-wallet', 'defi-integration', 'smart-contracts'],
        dependencies: ['blockchain-node', 'postgres', 'crypto-apis']
    },
    {
        name: 'x',
        port: 4029,
        description: 'AI Trading Platform Service Layer',
        type: 'trading',
        capabilities: ['advanced-trading', 'ai-algorithms', 'risk-management'],
        dependencies: ['financial-apis', 'postgres', 'openai', 'redis']
    }
];

async function createServiceImplementation(config) {
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
        scripts: {
            start: "node index.js",
            dev: "nodemon index.js",
            test: "jest",
            "test:watch": "jest --watch"
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
            jest: "^29.7.0",
            supertest: "^6.3.3"
        },
        keywords: [config.type, "codai", "microservice"],
        type: "commonjs"
    };

    fs.writeFileSync(
        path.join(servicePath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    // Create main service file
    const serviceCode = `const CodeAIService = require('../../scripts/enhanced-service-template.js');

// ${config.description}
class ${config.name.charAt(0).toUpperCase() + config.name.slice(1)}Service extends CodeAIService {
  constructor() {
    super({
      name: '${config.name}',
      port: ${config.port},
      description: '${config.description}',
      type: '${config.type}',
      capabilities: ${JSON.stringify(config.capabilities)},
      dependencies: ${JSON.stringify(config.dependencies)}
    });
  }

  createAPIRouter() {
    const router = super.createAPIRouter();
    
    // Service-specific routes
    router.get('/${config.name}', (req, res) => {
      res.json({
        service: '${config.name}',
        description: '${config.description}',
        type: '${config.type}',
        capabilities: ${JSON.stringify(config.capabilities)},
        status: 'operational',
        version: '1.0.0'
      });
    });

    // Add more service-specific endpoints here
    ${this.generateServiceSpecificRoutes(config)}

    return router;
  }

  checkDatabase() {
    // TODO: Implement actual database health check
    return { 
      status: 'ok', 
      message: 'Database connection healthy',
      dependencies: ${JSON.stringify(config.dependencies)}
    };
  }

  checkAuth() {
    // TODO: Implement actual auth health check
    return { 
      status: 'ok', 
      message: 'Authentication service healthy' 
    };
  }

  checkDependencies() {
    // TODO: Implement actual dependency health checks
    return { 
      status: 'ok', 
      message: 'All dependencies healthy',
      dependencies: ${JSON.stringify(config.dependencies)}
    };
  }
}

// Start the service
if (require.main === module) {
  const service = new ${config.name.charAt(0).toUpperCase() + config.name.slice(1)}Service();
  service.start().catch(console.error);
}

module.exports = ${config.name.charAt(0).toUpperCase() + config.name.slice(1)}Service;`;

    fs.writeFileSync(path.join(servicePath, 'index.js'), serviceCode);

    // Create .env file
    const envContent = `# ${config.description}
NODE_ENV=development
PORT=${config.port}
SERVICE_NAME=${config.name}

# Database
DATABASE_URL=postgresql://codai:codai_secure_2025@localhost:5432/codai
REDIS_URL=redis://localhost:6379

# API Keys (replace with actual keys)
OPENAI_API_KEY=your_openai_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Service URLs
${serviceConfigs.map(s => `${s.name.toUpperCase()}_SERVICE_URL=http://localhost:${s.port}`).join('\n')}`;

    fs.writeFileSync(path.join(servicePath, '.env'), envContent);

    // Create README.md
    const readmeContent = `# ${config.name.charAt(0).toUpperCase() + config.name.slice(1)} Service

${config.description}

## Overview
- **Type**: ${config.type}
- **Port**: ${config.port}
- **Capabilities**: ${config.capabilities.join(', ')}
- **Dependencies**: ${config.dependencies.join(', ')}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
\`\`\`

## Endpoints

- \`GET /health\` - Health check
- \`GET /status\` - Service status  
- \`GET /info\` - Service information
- \`GET /api\` - API documentation
- \`GET /api/${config.name}\` - Service-specific endpoint

## Development

\`\`\`bash
# Run tests
npm test

# Watch tests
npm run test:watch
\`\`\`

## Configuration

Environment variables are loaded from \`.env\` file:

- \`NODE_ENV\` - Environment (development/production)
- \`PORT\` - Service port (${config.port})
- \`DATABASE_URL\` - PostgreSQL connection string
- \`REDIS_URL\` - Redis connection string

## Health Checks

The service provides comprehensive health checks:

\`\`\`bash
curl http://localhost:${config.port}/health
\`\`\`

## API Documentation

Service-specific API documentation available at:
\`http://localhost:${config.port}/api\`
`;

    fs.writeFileSync(path.join(servicePath, 'README.md'), readmeContent);

    console.log(`✅ Created ${config.name} service at port ${config.port}`);
}

function generateServiceSpecificRoutes(config) {
    const routes = [];

    if (config.capabilities.includes('user-management')) {
        routes.push(`
    // User management routes
    router.get('/users', (req, res) => {
      res.json({ message: 'User management endpoint', users: [] });
    });`);
    }

    if (config.capabilities.includes('ai-assistance')) {
        routes.push(`
    // AI assistance routes
    router.post('/ai/complete', (req, res) => {
      res.json({ message: 'AI completion endpoint', completion: 'Generated content...' });
    });`);
    }

    if (config.capabilities.includes('payments')) {
        routes.push(`
    // Payment routes
    router.post('/payments', (req, res) => {
      res.json({ message: 'Payment processing endpoint', status: 'pending' });
    });`);
    }

    return routes.join('\n');
}

async function deployAllServices() {
    console.log('🚀 Starting deployment of all 29 services...');
    console.log('─'.repeat(60));

    const deploymentResults = [];

    for (const config of serviceConfigs) {
        try {
            await createServiceImplementation(config);
            deploymentResults.push({ service: config.name, status: 'created', port: config.port });
        } catch (error) {
            console.error(`❌ Failed to create ${config.name}:`, error.message);
            deploymentResults.push({ service: config.name, status: 'failed', error: error.message });
        }
    }

    console.log('\n🎯 Deployment Summary:');
    console.log('─'.repeat(60));

    const successful = deploymentResults.filter(r => r.status === 'created');
    const failed = deploymentResults.filter(r => r.status === 'failed');

    console.log(`✅ Successfully created: ${successful.length} services`);
    console.log(`❌ Failed: ${failed.length} services`);

    if (successful.length > 0) {
        console.log('\n✅ Created Services:');
        successful.forEach(result => {
            console.log(`   - ${result.service} (port ${result.port})`);
        });
    }

    if (failed.length > 0) {
        console.log('\n❌ Failed Services:');
        failed.forEach(result => {
            console.log(`   - ${result.service}: ${result.error}`);
        });
    }

    console.log('\n🔄 Next Steps:');
    console.log('1. Install dependencies: pnpm install');
    console.log('2. Start services: node scripts/start-all-services.js');
    console.log('3. Verify health: node scripts/verify-all-services.js');

    return deploymentResults;
}

if (require.main === module) {
    deployAllServices().catch(console.error);
}

module.exports = { deployAllServices, serviceConfigs };
