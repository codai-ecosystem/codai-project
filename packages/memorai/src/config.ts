import { z } from 'zod'

// ==================== CORE CONFIGURATION ====================

export interface MemoraiConfig {
  // Database Configuration
  database: {
    url: string
    type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb'
    maxConnections: number
    connectionTimeout: number
    queryTimeout: number
    ssl?: boolean
    migrations?: {
      auto: boolean
      directory: string
    }
  }

  // Vector Database Configuration
  vectorDB: {
    url: string
    type: 'pinecone' | 'weaviate' | 'qdrant' | 'chroma' | 'local'
    apiKey?: string
    dimensions: number
    metric: 'cosine' | 'euclidean' | 'dotproduct'
    indexName: string
  }

  // Storage Configuration  
  storage: {
    provider: 'local' | 'aws-s3' | 'cloudflare-r2' | 'supabase' | 'vercel-blob'
    bucket: string
    region?: string
    accessKey?: string
    secretKey?: string
    publicUrl?: string
    maxFileSize: number
    allowedTypes: string[]
    enableCDN: boolean
  }

  // Cache Configuration
  cache: {
    provider: 'redis' | 'memory' | 'upstash'
    url?: string
    password?: string
    ttl: number
    maxSize: number
  }

  // AI Configuration
  ai: {
    provider: 'openai' | 'anthropic' | 'local'
    apiKey?: string
    model: string
    embeddingModel: string
    maxTokens: number
  }

  // Real-time Configuration
  realtime: {
    enabled: boolean
    provider: 'socket.io' | 'supabase' | 'pusher'
    url?: string
    apiKey?: string
    secret?: string
  }

  // Security Configuration
  security: {
    encryption: {
      enabled: boolean
      algorithm: string
      key?: string
    }
    rateLimit: {
      enabled: boolean
      windowMs: number
      maxRequests: number
    }
    cors: {
      origins: string[]
      credentials: boolean
    }
  }

  // Performance Configuration
  performance: {
    queryOptimization: boolean
    indexOptimization: boolean
    compressionEnabled: boolean
    batchSize: number
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative'
  }
}

// Configuration Validation Schema
export const MemoraiConfigSchema = z.object({
  database: z.object({
    url: z.string().refine((url) => {
      // Allow file URLs for SQLite, regular URLs for others
      return url.startsWith('file:') || url.startsWith('postgresql://') ||
        url.startsWith('mysql://') || url.startsWith('mongodb://') ||
        url.includes('://') || url.endsWith('.db')
    }, 'Invalid database URL'),
    type: z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb']),
    maxConnections: z.number().min(1).max(100),
    connectionTimeout: z.number().min(1000),
    queryTimeout: z.number().min(1000),
    ssl: z.boolean().optional(),
    migrations: z.object({
      auto: z.boolean(),
      directory: z.string()
    }).optional()
  }),

  vectorDB: z.object({
    url: z.string().refine((url) => {
      // Allow local:// for local vector stores, regular URLs for others
      return url.startsWith('local://') || url.includes('://') || url === 'memory'
    }, 'Invalid vector database URL'),
    type: z.enum(['pinecone', 'weaviate', 'qdrant', 'chroma', 'local']),
    apiKey: z.string().optional(),
    dimensions: z.number().min(128).max(2048),
    metric: z.enum(['cosine', 'euclidean', 'dotproduct']),
    indexName: z.string()
  }),

  storage: z.object({
    provider: z.enum(['local', 'aws-s3', 'cloudflare-r2', 'supabase', 'vercel-blob']),
    bucket: z.string(),
    region: z.string().optional(),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    publicUrl: z.string().url().optional(),
    maxFileSize: z.number().min(1024), // Minimum 1KB
    allowedTypes: z.array(z.string()),
    enableCDN: z.boolean()
  }),

  cache: z.object({
    provider: z.enum(['redis', 'memory', 'upstash']),
    url: z.string().url().optional(),
    password: z.string().optional(),
    ttl: z.number().min(60), // Minimum 1 minute
    maxSize: z.number().min(1024) // Minimum 1KB
  }),

  ai: z.object({
    provider: z.enum(['openai', 'anthropic', 'local']),
    apiKey: z.string().optional(),
    model: z.string(),
    embeddingModel: z.string(),
    maxTokens: z.number().min(100).max(100000)
  }),

  realtime: z.object({
    enabled: z.boolean(),
    provider: z.enum(['socket.io', 'supabase', 'pusher']),
    url: z.string().url().optional(),
    apiKey: z.string().optional(),
    secret: z.string().optional()
  }),

  security: z.object({
    encryption: z.object({
      enabled: z.boolean(),
      algorithm: z.string(),
      key: z.string().optional()
    }),
    rateLimit: z.object({
      enabled: z.boolean(),
      windowMs: z.number().min(1000),
      maxRequests: z.number().min(1)
    }),
    cors: z.object({
      origins: z.array(z.string()),
      credentials: z.boolean()
    })
  }),

  performance: z.object({
    queryOptimization: z.boolean(),
    indexOptimization: z.boolean(),
    compressionEnabled: z.boolean(),
    batchSize: z.number().min(10).max(10000),
    cacheStrategy: z.enum(['aggressive', 'balanced', 'conservative'])
  })
})

// ==================== DEFAULT CONFIGURATIONS ====================

export const DEFAULT_CONFIG: MemoraiConfig = {
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./memorai.db',
    type: 'sqlite',
    maxConnections: 10,
    connectionTimeout: 10000,
    queryTimeout: 30000,
    ssl: false,
    migrations: {
      auto: true,
      directory: './prisma/migrations'
    }
  },

  vectorDB: {
    url: process.env.VECTOR_DB_URL || 'http://localhost:8000',
    type: 'local',
    apiKey: process.env.VECTOR_DB_API_KEY,
    dimensions: 384,
    metric: 'cosine',
    indexName: 'memorai-embeddings'
  },

  storage: {
    provider: 'local',
    bucket: 'memorai-storage',
    region: 'us-east-1',
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    publicUrl: process.env.STORAGE_PUBLIC_URL,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/json', 'application/zip'
    ],
    enableCDN: false
  },

  cache: {
    provider: 'memory',
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    ttl: 3600, // 1 hour
    maxSize: 100 * 1024 * 1024 // 100MB
  },

  ai: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    maxTokens: 4000
  },

  realtime: {
    enabled: true,
    provider: 'socket.io',
    url: process.env.REALTIME_URL,
    apiKey: process.env.REALTIME_API_KEY,
    secret: process.env.REALTIME_SECRET
  },

  security: {
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      key: process.env.ENCRYPTION_KEY
    },
    rateLimit: {
      enabled: true,
      windowMs: 60000, // 1 minute
      maxRequests: 100
    },
    cors: {
      origins: ['http://localhost:3000', 'https://*.codai.ro'],
      credentials: true
    }
  },

  performance: {
    queryOptimization: true,
    indexOptimization: true,
    compressionEnabled: true,
    batchSize: 1000,
    cacheStrategy: 'balanced'
  }
}

// ==================== ENVIRONMENT-SPECIFIC CONFIGS ====================

export const DEVELOPMENT_CONFIG: Partial<MemoraiConfig> = {
  database: {
    url: 'sqlite://./memorai-dev.db',
    type: 'sqlite',
    maxConnections: 5,
    connectionTimeout: 5000,
    queryTimeout: 15000,
    ssl: false
  },
  performance: {
    queryOptimization: false,
    indexOptimization: false,
    compressionEnabled: false,
    batchSize: 100,
    cacheStrategy: 'conservative'
  }
}

export const PRODUCTION_CONFIG: Partial<MemoraiConfig> = {
  database: {
    url: process.env.DATABASE_URL!,
    type: 'postgresql',
    maxConnections: 50,
    connectionTimeout: 10000,
    queryTimeout: 60000,
    ssl: true
  },
  storage: {
    provider: 'aws-s3',
    bucket: process.env.S3_BUCKET || 'memorai-production',
    enableCDN: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/json', 'application/zip', 'video/mp4',
      'audio/mpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },
  cache: {
    provider: 'redis',
    ttl: 7200, // 2 hours
    maxSize: 1024 * 1024 * 1024 // 1GB
  },
  performance: {
    queryOptimization: true,
    indexOptimization: true,
    compressionEnabled: true,
    batchSize: 5000,
    cacheStrategy: 'aggressive'
  }
}

// ==================== CONFIG UTILITIES ====================

export function createMemoraiConfig(
  overrides: Partial<MemoraiConfig> = {},
  environment: 'development' | 'production' | 'test' = 'development'
): MemoraiConfig {
  const envConfig = environment === 'production'
    ? PRODUCTION_CONFIG
    : DEVELOPMENT_CONFIG

  // Deep merge configuration objects
  const config: MemoraiConfig = {
    database: { ...DEFAULT_CONFIG.database, ...envConfig.database, ...overrides.database },
    vectorDB: { ...DEFAULT_CONFIG.vectorDB, ...envConfig.vectorDB, ...overrides.vectorDB },
    storage: { ...DEFAULT_CONFIG.storage, ...envConfig.storage, ...overrides.storage },
    cache: { ...DEFAULT_CONFIG.cache, ...envConfig.cache, ...overrides.cache },
    ai: { ...DEFAULT_CONFIG.ai, ...envConfig.ai, ...overrides.ai },
    realtime: { ...DEFAULT_CONFIG.realtime, ...envConfig.realtime, ...overrides.realtime },
    security: { ...DEFAULT_CONFIG.security, ...envConfig.security, ...overrides.security },
    performance: { ...DEFAULT_CONFIG.performance, ...envConfig.performance, ...overrides.performance }
  }

  // Validate configuration
  const result = MemoraiConfigSchema.safeParse(config)
  if (!result.success) {
    throw new Error(`Invalid Memorai configuration: ${result.error.message}`)
  }

  return config // Return the config directly, as it's already properly typed
}

export function validateConfig(config: Partial<MemoraiConfig>): boolean {
  const result = MemoraiConfigSchema.safeParse(config)
  return result.success
}

export function getConfigErrors(config: Partial<MemoraiConfig>): string[] {
  const result = MemoraiConfigSchema.safeParse(config)
  if (result.success) return []

  return result.error.issues.map(issue =>
    `${issue.path.join('.')}: ${issue.message}`
  )
}
