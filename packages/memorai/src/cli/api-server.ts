#!/usr/bin/env node

/**
 * MEMORAI API Server CLI
 * Command-line interface to start the REST API server
 */

import { Command } from 'commander'
import { MemoraiService } from '../services/MemoraiService'
import { MemoraiAPIServer } from '../api/server'
import type { MemoraiConfig } from '../types'

const program = new Command()

program
  .name('memorai-api')
  .description('MEMORAI REST API Server for CODAI Ecosystem')
  .version('1.0.0')

program
  .command('start')
  .description('Start the MEMORAI API server')
  .option('-p, --port <port>', 'Port to run the server on', '3001')
  .option('-h, --host <host>', 'Host to bind to', 'localhost')
  .option('--db-url <url>', 'Database connection URL')
  .option('--redis-url <url>', 'Redis connection URL')
  .option('--storage-path <path>', 'Local storage path', './data/storage')
  .option('--log-level <level>', 'Log level (error, warn, info, debug)', 'info')
  .option('--cors-origins <origins>', 'Comma-separated list of CORS origins', '*')
  .option('--rate-limit <requests>', 'Max requests per IP per window', '100')
  .option('--rate-window <ms>', 'Rate limiting window in milliseconds', '900000')
  .action(async (options) => {
    try {
      console.log('🚀 Starting MEMORAI API Server...')

      // Build configuration from options
      const config: Partial<MemoraiConfig> = {
        database: {
          url: options.dbUrl || process.env.DATABASE_URL || 'file:./data/dev.db',
          type: 'sqlite',
          provider: 'sqlite',
          maxConnections: 10,
          connectionTimeout: 30000,
          queryTimeout: 30000,
          logging: options.logLevel === 'debug'
        },
        vectorDB: {
          url: 'local://memory',
          type: 'local',
          dimensions: 1536,
          metric: 'cosine',
          indexName: 'memorai_vectors'
        },
        cache: {
          provider: options.redisUrl ? 'redis' : 'memory',
          url: options.redisUrl,
          ttl: 3600,
          maxSize: 1000
        },
        storage: {
          provider: 'local',
          bucket: options.storagePath,
          maxFileSize: 50 * 1024 * 1024, // 50MB
          allowedTypes: ['image/*', 'text/*', 'application/pdf', 'application/json'],
          enableCDN: false
        },
        ai: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          embeddingModel: 'text-embedding-3-small',
          maxTokens: 2000,
          apiKey: process.env.OPENAI_API_KEY
        },
        realtime: {
          enabled: true,
          provider: 'socket.io'
        },
        security: {
          encryption: {
            enabled: false,
            algorithm: 'aes-256-gcm'
          },
          cors: {
            origins: options.corsOrigins === '*' ? ['*'] : options.corsOrigins.split(','),
            credentials: true
          },
          rateLimit: {
            enabled: true,
            windowMs: parseInt(options.rateWindow),
            maxRequests: parseInt(options.rateLimit)
          }
        },
        performance: {
          queryOptimization: true,
          indexOptimization: true,
          compressionEnabled: false,
          batchSize: 100,
          cacheStrategy: 'balanced'
        }
      }

      // Initialize services
      const memoraiService = await MemoraiService.create(config)

      // Create and start API server
      const apiServer = new MemoraiAPIServer(memoraiService, memoraiService.configuration)
      
      // Setup graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down gracefully...')
        await apiServer.stop()
        await memoraiService.shutdown()
        process.exit(0)
      })

      process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
        await apiServer.stop()
        await memoraiService.shutdown()
        process.exit(0)
      })

      // Start the server
      await apiServer.start(parseInt(options.port), options.host)

      console.log('✅ MEMORAI API Server is ready!')
      console.log(`📡 API Documentation: http://${options.host}:${options.port}/api/info`)
      console.log(`🏥 Health Check: http://${options.host}:${options.port}/health`)

    } catch (error) {
      console.error('❌ Failed to start MEMORAI API Server:', error)
      process.exit(1)
    }
  })

program
  .command('health')
  .description('Check the health of a running MEMORAI API server')
  .option('-u, --url <url>', 'Server URL', 'http://localhost:3001')
  .action(async (options) => {
    try {
      const response = await fetch(`${options.url}/health`)
      const health = await response.json()
      
      console.log('🏥 MEMORAI API Health Check:')
      console.log(JSON.stringify(health, null, 2))
      
      if (health.status === 'healthy') {
        console.log('✅ Server is healthy!')
        process.exit(0)
      } else {
        console.log('❌ Server is unhealthy!')
        process.exit(1)
      }
      
    } catch (error) {
      console.error('❌ Failed to check server health:', error)
      process.exit(1)
    }
  })

program
  .command('test')
  .description('Test the MEMORAI API endpoints')
  .option('-u, --url <url>', 'Server URL', 'http://localhost:3001')
  .action(async (options) => {
    try {
      console.log('🧪 Testing MEMORAI API endpoints...')
      
      const baseUrl = options.url
      const testResults: any[] = []
      
      // Test health endpoint
      console.log('Testing /health...')
      try {
        const response = await fetch(`${baseUrl}/health`)
        const data = await response.json()
        testResults.push({
          endpoint: '/health',
          status: response.status,
          success: response.ok,
          data
        })
      } catch (error) {
        testResults.push({
          endpoint: '/health',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      
      // Test API info endpoint
      console.log('Testing /api/info...')
      try {
        const response = await fetch(`${baseUrl}/api/info`)
        const data = await response.json()
        testResults.push({
          endpoint: '/api/info',
          status: response.status,
          success: response.ok,
          data
        })
      } catch (error) {
        testResults.push({
          endpoint: '/api/info',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      
      // Test database endpoint (simple query)
      console.log('Testing /api/v1/database/query...')
      try {
        const response = await fetch(`${baseUrl}/api/v1/database/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'test-user',
            'x-user-email': 'test@example.com'
          },
          body: JSON.stringify({
            table: 'users',
            operation: 'find',
            conditions: [],
            limit: 1
          })
        })
        const data = await response.json()
        testResults.push({
          endpoint: '/api/v1/database/query',
          status: response.status,
          success: response.ok,
          data
        })
      } catch (error) {
        testResults.push({
          endpoint: '/api/v1/database/query',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      
      // Display results
      console.log('\n📊 Test Results:')
      testResults.forEach(result => {
        const status = result.success ? '✅' : '❌'
        console.log(`${status} ${result.endpoint} ${result.status ? `(${result.status})` : ''}`)
        if (result.error) {
          console.log(`   Error: ${result.error}`)
        }
      })
      
      const allPassed = testResults.every(r => r.success)
      console.log(allPassed ? '\n✅ All tests passed!' : '\n❌ Some tests failed!')
      process.exit(allPassed ? 0 : 1)
      
    } catch (error) {
      console.error('❌ Failed to run tests:', error)
      process.exit(1)
    }
  })

// Parse command line arguments
program.parse()

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
