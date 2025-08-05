/**
 * MemorAI Documentation Server
 * Serves generated documentation with live updates
 */

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { DocumentationGenerator } = require('./documentation-generator');

class DocumentationServer {
  constructor(options = {}) {
    this.app = express();
    this.port = options.port || 4600;
    this.docsDir = options.docsDir || './generated';
    this.autoRegenerate = options.autoRegenerate || false;
    this.generator = new DocumentationGenerator();

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    // JSON parsing
    this.app.use(express.json());

    // Static files from generated docs
    this.app.use('/docs', express.static(this.docsDir));

    // Static assets
    this.app.use('/assets', express.static(path.join(__dirname, 'assets')));
  }

  setupRoutes() {
    // Main documentation portal
    this.app.get('/', (req, res) => {
      res.send(this.generatePortalHTML());
    });

    // API health endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'MemorAI Documentation Server',
        status: 'healthy',
        port: this.port,
        timestamp: new Date().toISOString(),
        documentation_status: this.getDocumentationStatus()
      });
    });

    // Documentation generation endpoints
    this.app.post('/generate', async (req, res) => {
      try {
        const { type = 'all' } = req.body;
        console.log(`📚 Generating documentation type: ${type}`);

        await this.generateDocumentation(type);

        res.json({
          success: true,
          message: `Documentation generated successfully`,
          type,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Documentation generation failed:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get documentation status
    this.app.get('/status', async (req, res) => {
      const status = await this.getDetailedStatus();
      res.json(status);
    });

    // Live documentation preview
    this.app.get('/preview/:type', async (req, res) => {
      const { type } = req.params;
      const previewData = await this.getPreviewData(type);
      res.json(previewData);
    });

    // Documentation search
    this.app.get('/search', async (req, res) => {
      const { q: query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
      }

      const results = await this.searchDocumentation(query);
      res.json(results);
    });

    // API introspection endpoint
    this.app.get('/introspect', async (req, res) => {
      try {
        const introspectionData = await this.introspectAPIs();
        res.json(introspectionData);
      } catch (error) {
        res.status(500).json({
          error: 'Introspection failed',
          message: error.message
        });
      }
    });

    // Webhook for auto-regeneration
    this.app.post('/webhook/regenerate', async (req, res) => {
      if (!this.autoRegenerate) {
        return res.status(403).json({
          error: 'Auto-regeneration disabled'
        });
      }

      try {
        console.log('🔄 Auto-regenerating documentation...');
        await this.generateDocumentation('all');

        res.json({
          success: true,
          message: 'Documentation regenerated',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  generatePortalHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MemorAI Documentation Portal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 3rem;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 48px rgba(0,0,0,0.15);
        }
        
        .card h3 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.4rem;
        }
        
        .card p {
            color: #666;
            margin-bottom: 1.5rem;
        }
        
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        }
        
        .status-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .status-item {
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .status-item h4 {
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .status-online {
            border-left-color: #28a745;
        }
        
        .status-offline {
            border-left-color: #dc3545;
        }
        
        .actions {
            margin-top: 2rem;
            text-align: center;
        }
        
        .actions button {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            margin: 0 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .actions button:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }
        
        .loading {
            display: none;
            text-align: center;
            margin: 2rem 0;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 MemorAI Documentation Portal</h1>
            <p>Comprehensive documentation for the MemorAI platform</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>📖 API Reference</h3>
                <p>Complete REST API documentation with interactive examples and detailed endpoint descriptions.</p>
                <a href="/docs/api/" class="btn">View API Docs</a>
            </div>
            
            <div class="card">
                <h3>📦 SDK Documentation</h3>
                <p>Client libraries for JavaScript, Python, Go, and Java with code examples and guides.</p>
                <a href="/docs/sdk/" class="btn">View SDK Docs</a>
            </div>
            
            <div class="card">
                <h3>📡 Webhook Guide</h3>
                <p>Real-time event notifications, security setup, and integration examples.</p>
                <a href="/docs/webhook/" class="btn">View Webhook Docs</a>
            </div>
            
            <div class="card">
                <h3>🧬 GraphQL API</h3>
                <p>Flexible GraphQL interface with complete schema documentation and playground.</p>
                <a href="/docs/graphql/" class="btn">View GraphQL Docs</a>
            </div>
            
            <div class="card">
                <h3>📚 User Guides</h3>
                <p>Step-by-step guides for getting started and using advanced features.</p>
                <a href="/docs/guides/" class="btn">View Guides</a>
            </div>
            
            <div class="card">
                <h3>🎓 Tutorials</h3>
                <p>Hands-on tutorials and real-world examples to help you build with MemorAI.</p>
                <a href="/docs/tutorials/" class="btn">View Tutorials</a>
            </div>
        </div>
        
        <div class="status-section">
            <h2>📊 System Status</h2>
            <div class="status-grid" id="statusGrid">
                <div class="status-item">
                    <h4>Documentation Server</h4>
                    <p id="docStatus">Loading...</p>
                </div>
                <div class="status-item">
                    <h4>MemorAI API</h4>
                    <p id="apiStatus">Loading...</p>
                </div>
                <div class="status-item">
                    <h4>Webhook System</h4>
                    <p id="webhookStatus">Loading...</p>
                </div>
                <div class="status-item">
                    <h4>GraphQL API</h4>
                    <p id="graphqlStatus">Loading...</p>
                </div>
            </div>
            
            <div class="actions">
                <button onclick="generateDocs('all')">🔄 Regenerate All Docs</button>
                <button onclick="generateDocs('api')">📖 Update API Docs</button>
                <button onclick="generateDocs('sdk')">📦 Update SDK Docs</button>
                <button onclick="introspectAPIs()">🔍 Introspect APIs</button>
            </div>
            
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Generating documentation...</p>
            </div>
        </div>
    </div>
    
    <script>
        // Load status on page load
        window.addEventListener('load', loadStatus);
        
        async function loadStatus() {
            try {
                const response = await fetch('/status');
                const status = await response.json();
                updateStatusDisplay(status);
            } catch (error) {
                console.error('Failed to load status:', error);
            }
        }
        
        function updateStatusDisplay(status) {
            document.getElementById('docStatus').textContent = '✅ Online';
            document.getElementById('apiStatus').textContent = status.apis?.memorai?.status === 'online' ? '✅ Online' : '❌ Offline';
            document.getElementById('webhookStatus').textContent = status.apis?.webhook?.status === 'online' ? '✅ Online' : '❌ Offline';
            document.getElementById('graphqlStatus').textContent = status.apis?.graphql?.status === 'online' ? '✅ Online' : '❌ Offline';
        }
        
        async function generateDocs(type) {
            const loading = document.getElementById('loading');
            loading.style.display = 'block';
            
            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(\`Documentation generated successfully! Type: \${type}\`);
                    loadStatus(); // Refresh status
                } else {
                    alert(\`Documentation generation failed: \${result.error}\`);
                }
            } catch (error) {
                alert(\`Error: \${error.message}\`);
            } finally {
                loading.style.display = 'none';
            }
        }
        
        async function introspectAPIs() {
            const loading = document.getElementById('loading');
            loading.style.display = 'block';
            
            try {
                const response = await fetch('/introspect');
                const data = await response.json();
                
                console.log('API Introspection Data:', data);
                alert('API introspection completed! Check console for details.');
                loadStatus(); // Refresh status
            } catch (error) {
                alert(\`Introspection failed: \${error.message}\`);
            } finally {
                loading.style.display = 'none';
            }
        }
    </script>
</body>
</html>`;
  }

  async generateDocumentation(type) {
    const generator = new DocumentationGenerator();

    switch (type) {
      case 'api':
        await generator.setupDirectories();
        await generator.loadTemplates();
        await generator.introspectAPIs();
        await generator.generateOpenAPIDoc();
        break;
      case 'sdk':
        await generator.setupDirectories();
        await generator.loadTemplates();
        await generator.generateSDKDocs();
        break;
      case 'webhook':
        await generator.setupDirectories();
        await generator.loadTemplates();
        await generator.introspectAPIs();
        await generator.generateWebhookDocs();
        break;
      case 'all':
      default:
        await generator.generateAllDocumentation();
        break;
    }
  }

  getDocumentationStatus() {
    return {
      generated_docs_exist: fs.pathExistsSync(this.docsDir),
      last_generated: this.getLastGeneratedTime(),
      auto_regenerate: this.autoRegenerate
    };
  }

  getLastGeneratedTime() {
    try {
      const indexPath = path.join(this.docsDir, 'README.md');
      if (fs.pathExistsSync(indexPath)) {
        const stats = fs.statSync(indexPath);
        return stats.mtime.toISOString();
      }
    } catch (error) {
      // Ignore errors
    }
    return null;
  }

  async getDetailedStatus() {
    const status = {
      server: {
        status: 'online',
        port: this.port,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      },
      documentation: this.getDocumentationStatus(),
      apis: {}
    };

    // Check API statuses
    try {
      const healthResponse = await fetch('http://localhost:4006/api/health', { timeout: 3000 });
      status.apis.memorai = {
        status: healthResponse.ok ? 'online' : 'error',
        url: 'http://localhost:4006'
      };
    } catch (error) {
      status.apis.memorai = { status: 'offline', url: 'http://localhost:4006' };
    }

    try {
      const webhookResponse = await fetch('http://localhost:4510/health', { timeout: 3000 });
      status.apis.webhook = {
        status: webhookResponse.ok ? 'online' : 'error',
        url: 'http://localhost:4510'
      };
    } catch (error) {
      status.apis.webhook = { status: 'offline', url: 'http://localhost:4510' };
    }

    try {
      const graphqlResponse = await fetch('http://localhost:4500/health', { timeout: 3000 });
      status.apis.graphql = {
        status: graphqlResponse.ok ? 'online' : 'error',
        url: 'http://localhost:4500'
      };
    } catch (error) {
      status.apis.graphql = { status: 'offline', url: 'http://localhost:4500' };
    }

    return status;
  }

  async getPreviewData(type) {
    const previewPath = path.join(this.docsDir, type, 'README.md');

    try {
      if (await fs.pathExists(previewPath)) {
        const content = await fs.readFile(previewPath, 'utf8');
        return {
          type,
          content,
          exists: true,
          last_modified: (await fs.stat(previewPath)).mtime.toISOString()
        };
      }
    } catch (error) {
      // Ignore errors
    }

    return { type, exists: false, content: null };
  }

  async searchDocumentation(query) {
    const results = [];
    const searchDirs = ['api', 'sdk', 'webhook', 'graphql', 'guides', 'tutorials'];

    for (const dir of searchDirs) {
      const dirPath = path.join(this.docsDir, dir);

      if (await fs.pathExists(dirPath)) {
        const files = await fs.readdir(dirPath);

        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = path.join(dirPath, file);
            const content = await fs.readFile(filePath, 'utf8');

            if (content.toLowerCase().includes(query.toLowerCase())) {
              const lines = content.split('\n');
              const matchingLines = lines.filter(line =>
                line.toLowerCase().includes(query.toLowerCase())
              );

              results.push({
                file: `${dir}/${file}`,
                path: filePath,
                matches: matchingLines.slice(0, 3),
                type: dir
              });
            }
          }
        }
      }
    }

    return {
      query,
      results,
      total: results.length
    };
  }

  async introspectAPIs() {
    const introspectionData = {
      timestamp: new Date().toISOString(),
      apis: {}
    };

    // MemorAI API
    try {
      const healthResponse = await fetch('http://localhost:4006/api/health', { timeout: 5000 });
      const healthData = await healthResponse.json();
      introspectionData.apis.memorai = {
        status: 'online',
        health: healthData,
        endpoints: await this.discoverEndpoints('http://localhost:4006')
      };
    } catch (error) {
      introspectionData.apis.memorai = { status: 'offline', error: error.message };
    }

    // Webhook API
    try {
      const webhookResponse = await fetch('http://localhost:4510/health', { timeout: 5000 });
      const webhookData = await webhookResponse.json();
      introspectionData.apis.webhook = {
        status: 'online',
        health: webhookData
      };
    } catch (error) {
      introspectionData.apis.webhook = { status: 'offline', error: error.message };
    }

    // GraphQL API
    try {
      const graphqlQuery = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
          }
        }
      `;

      const graphqlResponse = await fetch('http://localhost:4500/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: graphqlQuery }),
        timeout: 5000
      });

      const graphqlData = await graphqlResponse.json();
      introspectionData.apis.graphql = {
        status: 'online',
        schema: graphqlData.data
      };
    } catch (error) {
      introspectionData.apis.graphql = { status: 'offline', error: error.message };
    }

    return introspectionData;
  }

  async discoverEndpoints(baseUrl) {
    // This would normally discover endpoints dynamically
    // For now, return known endpoints
    return [
      { method: 'GET', path: '/api/health', description: 'System health check' },
      { method: 'GET', path: '/api/memories', description: 'List memories' },
      { method: 'POST', path: '/api/memories', description: 'Create memory' },
      { method: 'POST', path: '/api/search', description: 'Search memories' }
    ];
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log('📚 MemorAI Documentation Server Started');
      console.log('=====================================');
      console.log(`🌐 Server: http://localhost:${this.port}`);
      console.log(`📁 Docs Directory: ${path.resolve(this.docsDir)}`);
      console.log(`🔄 Auto-regenerate: ${this.autoRegenerate ? 'Enabled' : 'Disabled'}`);
      console.log('');
      console.log('📖 Available endpoints:');
      console.log(`   • http://localhost:${this.port}/ - Documentation Portal`);
      console.log(`   • http://localhost:${this.port}/health - Server Health`);
      console.log(`   • http://localhost:${this.port}/status - Detailed Status`);
      console.log(`   • http://localhost:${this.port}/docs/ - Generated Documentation`);
      console.log('');
    });

    return this.server;
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('📚 Documentation server stopped');
    }
  }
}

// Create and start server if called directly
if (require.main === module) {
  const server = new DocumentationServer({
    port: process.env.PORT || 4600,
    autoRegenerate: process.env.AUTO_REGENERATE === 'true'
  });

  server.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down documentation server...');
    server.stop();
    process.exit(0);
  });
}

module.exports = { DocumentationServer };
