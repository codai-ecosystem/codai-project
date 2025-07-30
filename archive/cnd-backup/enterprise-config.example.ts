// Enterprise CND Configuration Example
import { CNDConfig } from './src/types.js';

export const enterpriseConfig: CNDConfig = {
  // Core CBD Connection
  cbd: {
    host: 'localhost',
    port: 5000,
    database: 'enterprise_db',
    auth: {
      username: 'admin',
      password: 'secure_password',
      token: 'optional_bearer_token'
    }
  },

  // Enterprise Features Configuration
  enterprise: {
    enabled: true,
    features: {
      serviceDiscovery: true,
      authentication: true,
      authorization: true,
      encryption: true,
      audit: true,
      monitoring: true,
      backup: true,
      clustering: false // Enable for multi-node deployments
    }
  },

  // Service Discovery Integration
  serviceDiscovery: {
    enabled: true,
    registryUrl: 'http://localhost:8500', // Consul, etcd, or custom registry
    serviceName: 'cnd-enterprise',
    healthCheckInterval: 30000,
    tags: ['database', 'enterprise', 'api', 'multi-paradigm']
  },

  // Authentication & Authorization
  auth: {
    enabled: true,
    provider: 'jwt', // 'internal' | 'oauth2' | 'jwt' | 'saml' | 'ldap'
    config: {
      secret: 'your-super-secret-jwt-key-change-in-production',
      issuer: 'cnd-enterprise',
      audience: 'cnd-users',
      algorithms: ['HS256']
    },
    rbac: {
      enabled: true,
      roles: {
        admin: ['*'],
        user: ['read', 'write'],
        guest: ['read']
      },
      permissions: {
        'read': ['SELECT', 'VIEW'],
        'write': ['INSERT', 'UPDATE'],
        'delete': ['DELETE'],
        'admin': ['*']
      }
    }
  },

  // Security & Encryption
  security: {
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyRotation: {
        enabled: true,
        interval: 90 // days
      }
    },
    audit: {
      enabled: true,
      storage: 'database', // 'database' | 'file' | 'external'
      retention: 365 // days
    },
    rateLimit: {
      enabled: true,
      windowMs: 60000, // 1 minute
      maxRequests: 1000
    }
  },

  // Real-time Features
  realtime: {
    enabled: true,
    websocketPort: 8080
  },

  // Distributed Caching
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    distributed: true,
    redis: {
      host: 'localhost',
      port: 6379,
      password: 'redis_password'
    }
  },

  // Performance & Monitoring
  performance: {
    monitoring: {
      enabled: true,
      metricsPort: 9090,
      healthCheckPath: '/health'
    },
    clustering: {
      enabled: false, // Enable for high availability
      nodes: ['node1:5000', 'node2:5000', 'node3:5000'],
      replicationFactor: 3
    },
    backup: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      storage: 's3', // 's3' | 'gcs' | 'azure' | 'local'
      retention: 30 // days
    }
  },

  // Structured Logging
  logging: {
    enabled: true,
    level: 'info',
    structured: true,
    destination: 'console' // 'console' | 'file' | 'elasticsearch' | 'splunk'
  }
};

// Development Configuration (Simplified)
export const developmentConfig: CNDConfig = {
  cbd: {
    host: 'localhost',
    port: 5000,
    database: 'dev_db'
  },
  enterprise: {
    enabled: true,
    features: {
      serviceDiscovery: true,
      authentication: true,
      authorization: false,
      encryption: false,
      audit: true,
      monitoring: true,
      backup: false,
      clustering: false
    }
  },
  auth: {
    enabled: true,
    provider: 'internal',
    config: {
      secret: 'dev-secret-key'
    }
  },
  realtime: {
    enabled: true,
    websocketPort: 8080
  },
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    distributed: false
  },
  performance: {
    monitoring: {
      enabled: true,
      metricsPort: 9090
    }
  },
  logging: {
    enabled: true,
    level: 'debug'
  }
};

// Production Configuration (Full Security)
export const productionConfig: CNDConfig = {
  cbd: {
    host: process.env.CBD_HOST || 'localhost',
    port: parseInt(process.env.CBD_PORT || '5000'),
    database: process.env.CBD_DATABASE || 'production_db',
    auth: {
      username: process.env.CBD_USERNAME,
      password: process.env.CBD_PASSWORD,
      token: process.env.CBD_TOKEN
    }
  },
  enterprise: {
    enabled: true,
    features: {
      serviceDiscovery: true,
      authentication: true,
      authorization: true,
      encryption: true,
      audit: true,
      monitoring: true,
      backup: true,
      clustering: true
    }
  },
  serviceDiscovery: {
    enabled: true,
    registryUrl: process.env.SERVICE_REGISTRY_URL || 'https://consul.production.com',
    serviceName: 'cnd-enterprise',
    healthCheckInterval: 15000,
    tags: ['database', 'enterprise', 'production']
  },
  auth: {
    enabled: true,
    provider: 'jwt',
    config: {
      secret: process.env.JWT_SECRET!,
      issuer: process.env.JWT_ISSUER || 'cnd-production',
      audience: process.env.JWT_AUDIENCE || 'cnd-users',
      algorithms: ['RS256'] // Use asymmetric encryption in production
    },
    rbac: {
      enabled: true,
      roles: {
        admin: ['*'],
        manager: ['read', 'write', 'manage'],
        user: ['read', 'write'],
        guest: ['read']
      },
      permissions: {
        'read': ['SELECT', 'VIEW'],
        'write': ['INSERT', 'UPDATE'],
        'delete': ['DELETE'],
        'manage': ['CREATE_TABLE', 'ALTER_TABLE'],
        'admin': ['*']
      }
    }
  },
  security: {
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyRotation: {
        enabled: true,
        interval: 30 // days
      }
    },
    audit: {
      enabled: true,
      storage: 'external', // Send to centralized audit system
      retention: 2555 // 7 years
    },
    rateLimit: {
      enabled: true,
      windowMs: 60000,
      maxRequests: 500 // Stricter limits
    }
  },
  realtime: {
    enabled: true,
    websocketPort: parseInt(process.env.WS_PORT || '8080')
  },
  cache: {
    enabled: true,
    ttl: 1800, // 30 minutes
    distributed: true,
    redis: {
      host: process.env.REDIS_HOST || 'redis.production.com',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }
  },
  performance: {
    monitoring: {
      enabled: true,
      metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
      healthCheckPath: '/health'
    },
    clustering: {
      enabled: true,
      nodes: (process.env.CLUSTER_NODES || 'node1:5000,node2:5000,node3:5000').split(','),
      replicationFactor: 3
    },
    backup: {
      enabled: true,
      schedule: '0 1 * * *', // Daily at 1 AM
      storage: 's3',
      retention: 90 // days
    }
  },
  logging: {
    enabled: true,
    level: 'warn', // Less verbose in production
    structured: true,
    destination: 'elasticsearch'
  }
};

// Usage Examples
export const usageExamples = {
  // Basic initialization
  basic: async () => {
    const { CND } = await import('./src/index.js');
    const cnd = new CND(developmentConfig);
    await cnd.connect();
    return cnd;
  },

  // Enterprise initialization with authentication
  enterprise: async () => {
    const { CND } = await import('./src/index.js');
    const cnd = new CND(enterpriseConfig);
    await cnd.connect();

    // Authenticate user
    const authContext = await cnd.authenticate('admin', 'password123');
    if (authContext) {
      console.log('User authenticated:', authContext.userId);
    }

    return cnd;
  },

  // Production initialization with environment variables
  production: async () => {
    const { CND } = await import('./src/index.js');
    const cnd = new CND(productionConfig);
    await cnd.connect();

    // Check health status
    const health = cnd.getHealthStatus();
    console.log('Health status:', health.status);

    return cnd;
  },

  // Service discovery usage
  serviceDiscovery: async () => {
    const { CND } = await import('./src/index.js');
    const cnd = new CND(enterpriseConfig);
    await cnd.connect();

    // Find other services
    const gatewayServices = cnd.findServices('gateway');
    const aiServices = cnd.findServicesByTag('ai');

    console.log('Gateway services:', gatewayServices);
    console.log('AI services:', aiServices);

    return cnd;
  },

  // Metrics and monitoring
  monitoring: async () => {
    const { CND } = await import('./src/index.js');
    const cnd = new CND(enterpriseConfig);
    await cnd.connect();

    // Get current metrics
    const metrics = cnd.getCurrentMetrics();
    console.log('Current metrics:', metrics);

    // Export Prometheus metrics
    const prometheusMetrics = cnd.exportPrometheusMetrics();
    console.log('Prometheus metrics:\n', prometheusMetrics);

    return cnd;
  }
};
