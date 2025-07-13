const { createServer } = require('http');
const { URL } = require('url');

const port = 3000;

// Performance metrics simulation
let requestCount = 0;
let startTime = Date.now();

const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${port}`);
  const pathname = parsedUrl.pathname;
  
  requestCount++;

  // Route handling
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      requestCount,
      service: 'romai-mcp-test-server'
    }));
  } else if (pathname === '/mcp/tools' && req.method === 'GET') {
    const delay = Math.random() * 50; // Simulate variable response time
    
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([
        {
          name: "romai_health_check",
          description: "Check ROMAI services health status",
          inputSchema: {
            type: "object",
            properties: {}
          }
        },
        {
          name: "romai_intelligence", 
          description: "Ask ROMAI for intelligent analysis",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string" },
              language: { type: "string", default: "ro" }
            },
            required: ["query"]
          }
        },
        {
          name: "romai_problem_solver",
          description: "General problem-solving with step-by-step analysis",
          inputSchema: {
            type: "object",
            properties: {
              problem: { type: "string" },
              language: { type: "string", default: "ro" }
            },
            required: ["problem"]
          }
        }
      ]));
    }, delay);
  } else if (pathname === '/mcp/call' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { tool, arguments: args } = JSON.parse(body);
        const delay = Math.random() * 100 + 50; // Simulate processing time
        
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          
          switch (tool) {
            case 'romai_health_check':
              res.end(JSON.stringify({
                success: true,
                data: {
                  status: 'healthy',
                  services: {
                    core: 'operational',
                    intelligence: 'operational',
                    problemSolver: 'operational'
                  },
                  timestamp: new Date().toISOString()
                }
              }));
              break;
              
            case 'romai_intelligence':
              res.end(JSON.stringify({
                success: true,
                data: {
                  query: args?.query || 'test query',
                  response: 'Analiza inteligentă completă disponibilă.',
                  confidence: 0.95,
                  processing_time: delay
                }
              }));
              break;
              
            case 'romai_problem_solver':
              res.end(JSON.stringify({
                success: true,
                data: {
                  problem: args?.problem || 'test problem',
                  solution: {
                    steps: [
                      'Analizează problema în detaliu',
                      'Identifică variabilele cheie',
                      'Dezvoltă strategii de soluționare',
                      'Implementează soluția optimă'
                    ],
                    recommendation: 'Soluție sistemică cu abordare graduală',
                    confidence: 0.92
                  },
                  processing_time: delay
                }
              }));
              break;
              
            default:
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                error: `Unknown tool: ${tool}`
              }));
          }
        }, delay);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (pathname === '/metrics' && req.method === 'GET') {
    const uptime = Date.now() - startTime;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      uptime_seconds: Math.floor(uptime / 1000),
      requests_total: requestCount,
      requests_per_second: requestCount / (uptime / 1000),
      memory_usage: process.memoryUsage(),
      cpu_usage: process.cpuUsage()
    }));
  } else if (pathname === '/error' && req.method === 'GET') {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Simulated server error for testing',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(port, () => {
  console.log(`🧪 ROMAI MCP Test Server running on http://localhost:${port}`);
  console.log(`🏥 Health: http://localhost:${port}/health`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
  console.log(`🔧 Tools: http://localhost:${port}/mcp/tools`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down test server...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down test server...');
  server.close(() => process.exit(0));
});
