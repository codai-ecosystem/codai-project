#!/usr/bin/env node

/**
 * Simple MemorAI MCP HTTP Server
 * A stable, minimal HTTP server for MCP protocol
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8002;
const API_KEY = process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo
const memories = new Map();

// Authentication middleware for API routes
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  if (token !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Public health endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'healthy',
    service: 'MemorAI MCP HTTP Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// MCP Tools endpoint
app.get('/tools', authenticate, (req, res) => {
  console.log('Tools list requested');
  res.json({
    tools: [
      {
        name: 'remember',
        description: 'Store a memory with content and metadata',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            metadata: { type: 'object' }
          },
          required: ['content']
        }
      },
      {
        name: 'recall',
        description: 'Search and retrieve memories',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            limit: { type: 'number', default: 10 }
          },
          required: ['query']
        }
      },
      {
        name: 'forget',
        description: 'Delete a memory by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        }
      }
    ]
  });
});

// MCP Tool execution endpoint
app.post('/tools/:toolName', authenticate, (req, res) => {
  const { toolName } = req.params;
  const args = req.body;
  
  console.log(`Tool ${toolName} called with args:`, args);
  
  try {
    switch (toolName) {
      case 'remember':
        const id = uuidv4();
        const memory = {
          id,
          content: args.content,
          metadata: {
            ...args.metadata,
            timestamp: new Date().toISOString()
          }
        };
        memories.set(id, memory);
        
        res.json({
          success: true,
          memory: memory,
          message: 'Memory stored successfully'
        });
        break;
        
      case 'recall':
        const query = args.query?.toLowerCase() || '';
        const limit = args.limit || 10;
        
        const results = Array.from(memories.values())
          .filter(memory => 
            memory.content.toLowerCase().includes(query) ||
            JSON.stringify(memory.metadata).toLowerCase().includes(query)
          )
          .slice(0, limit);
          
        res.json({
          success: true,
          memories: results,
          totalFound: results.length,
          query: args.query
        });
        break;
        
      case 'forget':
        if (memories.has(args.id)) {
          memories.delete(args.id);
          res.json({
            success: true,
            message: 'Memory deleted successfully'
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Memory not found'
          });
        }
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: `Unknown tool: ${toolName}`
        });
    }
  } catch (error) {
    console.error(`Error in tool ${toolName}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 MemorAI MCP HTTP Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🛠️ Tools: http://localhost:${PORT}/tools`);
  console.log(`🔑 API Key: ${API_KEY}`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('🛑 Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('🛑 Server stopped');
    process.exit(0);
  });
});
