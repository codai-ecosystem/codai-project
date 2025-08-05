// CODAI Ecosystem - Node.js Performance Optimization
module.exports = {
  // Memory Management
  memory: {
    maxOldSpaceSize: 4096,
    maxSemiSpaceSize: 512,
    initialOldSpaceSize: 2048,
    gcInterval: 100
  },
  
  // Event Loop Optimization
  eventLoop: {
    maxEventLoopDelay: 10,
    maxEventLoopUtilization: 0.8
  },
  
  // Connection Pooling
  database: {
    poolSize: 20,
    maxConnections: 100,
    connectionTimeout: 5000,
    idleTimeout: 30000,
    acquireTimeout: 10000
  },
  
  // Caching Strategy
  cache: {
    redis: {
      maxMemoryPolicy: 'allkeys-lru',
      maxMemory: '2gb',
      keyPrefix: 'codai:',
      ttl: 3600
    },
    local: {
      maxSize: '500mb',
      ttl: 300
    }
  },
  
  // HTTP Optimization
  http: {
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 256,
    maxFreeSockets: 16,
    timeout: 30000
  },
  
  // Compression
  compression: {
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return true;
    }
  }
};
