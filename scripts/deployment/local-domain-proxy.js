#!/usr/bin/env node

const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// BEAUTIFUL UI APPS - LOCAL DOMAIN MAPPING
const DOMAIN_MAP = {
    // Primary apps with confirmed beautiful UIs
    'codai.local': { port: 4030, name: 'CodAI', description: 'AI Development Platform' },
    'memorai.local': { port: 4031, name: 'MemorAI', description: 'AI Memory & Database Core' },
    'bancai.local': { port: 4033, name: 'BancAI', description: 'Romanian AI Banking Platform' },
    'aide.local': { port: 4042, name: 'AIDE', description: 'Development Assistant' },
    'publicai.local': { port: 4040, name: 'PublicAI', description: 'Public AI Interface' },

    // Additional ecosystem apps
    'logai.local': { port: 4032, name: 'LogAI', description: 'Logging & Analytics' },
    'kodex.local': { port: 4034, name: 'Kodex', description: 'Code Management Platform' },
    'sociai.local': { port: 4062, name: 'SociAI', description: 'Social AI Platform' },
    'stocai.local': { port: 4063, name: 'StocAI', description: 'Stock Management' },
    'cumparai.local': { port: 4061, name: 'CumparAI', description: 'Shopping Platform' },

    // Creative and specialized apps
    'curtai.local': { port: 4056, name: 'CurtAI', description: 'AI Dating Platform' },
    'legalizai.local': { port: 4057, name: 'LegalizAI', description: 'Legal AI Assistant' },
    'analizai.local': { port: 4058, name: 'AnalizAI', description: 'Analytics Platform' },
    'studiai.local': { port: 4059, name: 'StudiAI', description: 'Educational AI' },
    'muzicai.local': { port: 4060, name: 'MuzicAI', description: 'Music AI Platform' }
};

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create proxy server
const proxy = httpProxy.createProxyServer({});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
    const domain = req.headers.host;
    const app = DOMAIN_MAP[domain];

    log(`❌ ${domain} (${app?.name || 'Unknown'}) - App not running on port ${app?.port || 'unknown'}`, 'red');

    res.writeHead(503, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
    });

    res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${app?.name || 'App'} - Starting Up</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 600px;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .app-name { font-size: 3rem; margin-bottom: 1rem; font-weight: bold; }
        .description { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .status { font-size: 1rem; opacity: 0.8; }
        .spinner { 
          width: 50px; 
          height: 50px; 
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
      <script>
        setTimeout(() => location.reload(), 5000);
      </script>
    </head>
    <body>
      <div class="container">
        <div class="app-name">${app?.name || 'AI App'}</div>
        <div class="description">${app?.description || 'AI Application'}</div>
        <div class="spinner"></div>
        <div class="status">
          🚀 Application is starting up...<br>
          📡 Port: ${app?.port || 'unknown'}<br>
          ⏳ This page will auto-refresh in 5 seconds
        </div>
      </div>
    </body>
    </html>
  `);
});

// Create the server
const server = http.createServer((req, res) => {
    const domain = req.headers.host;
    const app = DOMAIN_MAP[domain];

    if (!app) {
        log(`❓ Unknown domain: ${domain}`, 'yellow');
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Domain not configured');
        return;
    }

    log(`🌐 ${domain} → localhost:${app.port} (${app.name})`, 'cyan');

    // Proxy the request
    proxy.web(req, res, {
        target: `http://localhost:${app.port}`,
        changeOrigin: true
    });
});

const PROXY_PORT = 3000;

server.listen(PROXY_PORT, () => {
    log('🎯 CODAI ECOSYSTEM - LOCAL DOMAIN PROXY', 'bright');
    log('=====================================', 'cyan');
    log(`🌐 Proxy server running on port ${PROXY_PORT}`, 'green');
    log(`🎨 Beautiful UI apps accessible via local domains`, 'yellow');

    log('\n✨ BEAUTIFUL UI APPS - LOCAL ACCESS:', 'magenta');
    Object.entries(DOMAIN_MAP).forEach(([domain, config]) => {
        log(`  🎨 ${config.name}: http://${domain}:${PROXY_PORT}`, 'green');
        log(`     📝 ${config.description}`, 'blue');
    });

    log('\n📋 SETUP INSTRUCTIONS:', 'yellow');
    log('1. Add these entries to your hosts file:', 'white');
    log('   (Windows: C:\\Windows\\System32\\drivers\\etc\\hosts)', 'white');
    log('   (Mac/Linux: /etc/hosts)', 'white');

    Object.keys(DOMAIN_MAP).forEach(domain => {
        log(`   127.0.0.1 ${domain}`, 'cyan');
    });

    log('\n2. Access apps via:', 'white');
    log(`   🎨 http://codai.local:${PROXY_PORT}`, 'green');
    log(`   🧠 http://memorai.local:${PROXY_PORT}`, 'green');
    log(`   💰 http://bancai.local:${PROXY_PORT}`, 'green');

    log('\n🚀 Starting apps will automatically become available!', 'bright');
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        log(`❌ Port ${PROXY_PORT} is already in use. Try a different port.`, 'red');
        process.exit(1);
    } else {
        log(`❌ Server error: ${err.message}`, 'red');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    log('\n🛑 Shutting down proxy server...', 'yellow');
    server.close(() => {
        log('✅ Proxy server stopped', 'green');
        process.exit(0);
    });
});
