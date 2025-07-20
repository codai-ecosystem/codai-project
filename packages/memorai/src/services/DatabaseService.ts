/**
 * Database Service - Production Implementation
 */

import { EventEmitter } from 'events'
import { PrismaClient } from '@prisma/client'
import type { DatabaseQuery, MemoraiConfig } from '../types'

export class DatabaseService extends EventEmitter {
  private prisma: PrismaClient | null = null
  private isConnected = false

  constructor(private config: MemoraiConfig['database']) {
    super()
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Prisma client
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.config.url || process.env.DATABASE_URL
          }
        },
        log: this.config.logging ? ['query', 'info', 'warn', 'error'] : []
      })

      // Test connection
      await this.prisma.$connect()

      // Run migrations if needed in development
      if (process.env.NODE_ENV === 'development') {
        try {
          await this.prisma.$queryRaw`SELECT 1`
        } catch (error) {
          console.warn('Database might need migrations:', error)
        }
      }

      this.isConnected = true
      this.emit('connected')
      console.log('🗃️  Database Service initialized')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      this.emit('error', error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    if (this.prisma && this.isConnected) {
      try {
        await this.prisma.$disconnect()
        this.isConnected = false
        this.emit('disconnected')
        console.log('🗃️  Database Service shutdown')
      } catch (error) {
        console.error('Error shutting down database:', error)
        throw error
      }
    }
  }

  async execute<T = any>(query: DatabaseQuery): Promise<T[]> {
    if (!this.prisma) {
      throw new Error('Database not initialized')
    }

    try {
      const startTime = Date.now()
      let result: any[] = []

      switch (query.operation) {
        case 'select':
          result = await this.executeSelect(query)
          break
        case 'insert':
          result = await this.executeInsert(query)
          break
        case 'update':
          result = await this.executeUpdate(query)
          break
        case 'delete':
          result = await this.executeDelete(query)
          break
        default:
          throw new Error(`Unsupported operation: ${query.operation}`)
      }

      const executionTime = Date.now() - startTime
      this.emit('query:executed', { query, executionTime, resultCount: result.length })

      return result
    } catch (error) {
      console.error('Database query error:', error)
      this.emit('query:error', { query, error })
      throw error
    }
  }

  private async executeSelect<T>(query: DatabaseQuery): Promise<T[]> {
    if (!this.prisma) throw new Error('Database not initialized')

    // Build dynamic query based on table
    const model = this.getModelForTable(query.table)
    if (!model) {
      throw new Error(`Unknown table: ${query.table}`)
    }

    // Build where conditions
    const where = this.buildWhereConditions(query.conditions)

    // Build query options
    const queryOptions: any = {
      where,
      select: query.fields ? this.buildSelectFields(query.fields) : undefined,
      orderBy: query.orderBy ? this.buildOrderBy(query.orderBy) : undefined,
      take: query.limit,
      skip: query.offset
    }

    // Remove undefined options
    Object.keys(queryOptions).forEach(key => {
      if (queryOptions[key] === undefined) {
        delete queryOptions[key]
      }
    })

    return await model.findMany(queryOptions)
  }

  private async executeInsert<T>(query: DatabaseQuery): Promise<T[]> {
    if (!this.prisma) throw new Error('Database not initialized')

    const model = this.getModelForTable(query.table)
    if (!model) {
      throw new Error(`Unknown table: ${query.table}`)
    }

    // Handle single or batch insert
    if (Array.isArray(query.data)) {
      // Batch insert
      const results = []
      for (const item of query.data) {
        const result = await model.create({ data: item })
        results.push(result)
      }
      return results
    } else {
      // Single insert
      const result = await model.create({ data: query.data })
      return [result]
    }
  }

  private async executeUpdate<T>(query: DatabaseQuery): Promise<T[]> {
    if (!this.prisma) throw new Error('Database not initialized')

    const model = this.getModelForTable(query.table)
    if (!model) {
      throw new Error(`Unknown table: ${query.table}`)
    }

    const where = this.buildWhereConditions(query.conditions)

    if (Object.keys(where).length === 0) {
      throw new Error('Update operations require WHERE conditions')
    }

    // Use updateMany for multiple records
    const updateResult = await model.updateMany({
      where,
      data: query.data
    })

    // Return updated records
    return await model.findMany({ where })
  }

  private async executeDelete<T>(query: DatabaseQuery): Promise<T[]> {
    if (!this.prisma) throw new Error('Database not initialized')

    const model = this.getModelForTable(query.table)
    if (!model) {
      throw new Error(`Unknown table: ${query.table}`)
    }

    const where = this.buildWhereConditions(query.conditions)

    if (Object.keys(where).length === 0) {
      throw new Error('Delete operations require WHERE conditions')
    }

    // Get records before deletion
    const recordsToDelete = await model.findMany({ where })

    // Perform deletion
    await model.deleteMany({ where })

    return recordsToDelete
  }

  private getModelForTable(tableName: string): any {
    if (!this.prisma) return null

    // Map table names to Prisma models
    const tableModelMap: Record<string, string> = {
      'agents': 'agent',
      'memories': 'memory',
      'memory_sessions': 'memorySession',
      'context_windows': 'contextWindow',
      'memory_embeddings': 'memoryEmbedding',
      'memory_associations': 'memoryAssociation',
      'memory_retrievals': 'memoryRetrieval',
      'storage_files': 'storageFile' // Custom table for file metadata
    }

    const modelName = tableModelMap[tableName]
    if (!modelName) return null

    return (this.prisma as any)[modelName]
  }

  private buildWhereConditions(conditions?: DatabaseQuery['conditions']): any {
    if (!conditions || conditions.length === 0) return {}

    const where: any = {}

    for (const condition of conditions) {
      const { field, operator, value } = condition

      switch (operator) {
        case '=':
          where[field] = value
          break
        case '!=':
          where[field] = { not: value }
          break
        case '>':
          where[field] = { gt: value }
          break
        case '>=':
          where[field] = { gte: value }
          break
        case '<':
          where[field] = { lt: value }
          break
        case '<=':
          where[field] = { lte: value }
          break
        case 'LIKE':
          where[field] = { contains: value }
          break
        case 'IN':
          where[field] = { in: Array.isArray(value) ? value : [value] }
          break
        case 'NOT IN':
          where[field] = { notIn: Array.isArray(value) ? value : [value] }
          break
        case 'IS NULL':
          where[field] = null
          break
        case 'IS NOT NULL':
          where[field] = { not: null }
          break
        default:
          throw new Error(`Unsupported operator: ${operator}`)
      }
    }

    return where
  }

  private buildSelectFields(fields: string[]): any {
    const select: any = {}
    for (const field of fields) {
      select[field] = true
    }
    return select
  }

  private buildOrderBy(orderBy: DatabaseQuery['orderBy']): any {
    if (!orderBy || orderBy.length === 0) return undefined

    return orderBy.map(order => ({
      [order.field]: order.direction?.toLowerCase() || 'asc'
    }))
  }

  async getHealth(): Promise<{ status: string; details?: any }> {
    if (!this.prisma || !this.isConnected) {
      return { status: 'unhealthy', details: { connected: false } }
    }

    try {
      // Simple health check query
      await this.prisma.$queryRaw`SELECT 1`

      return {
        status: 'healthy',
        details: {
          connected: true,
          database: this.config.type || 'sqlite'
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }
}
