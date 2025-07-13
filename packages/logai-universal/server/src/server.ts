import express from 'express'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { v4 as uuidv4 } from 'uuid'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'
  app: string
  message: string
  userId?: string
  metadata?: Record<string, any>
}

interface PerformanceMetric {
  id: string
  timestamp: Date
  app: string
  operation: string
  duration: number
  metadata?: Record<string, any>
}

interface SystemMetrics {
  timestamp: Date
  logsPerMinute: number
  errorsPerMinute: number
  avgResponseTime: number
  activeApps: number
  totalLogs: number
  errorRate: number
  activeUsers: number
  memoryUsage: number
  cpuUsage: number
}

interface ClientConnection {
  id: string
  ws: WebSocket
  subscriptions: string[]
  lastActivity: Date
}

class LogAIServer {
  private app: express.Application
  private server: any
  private wss!: WebSocketServer
  private clients: Map<string, ClientConnection> = new Map()
  private logs: LogEntry[] = []
  private metrics: PerformanceMetric[] = []
  private systemMetrics: SystemMetrics[] = []
  private port = parseInt(process.env.LOGAI_SERVER_PORT || '8080')

  constructor() {
    this.app = express()
    this.setupExpress()
    this.server = createServer(this.app)
    this.setupWebSocket()
    this.startMetricsCollection()
  }

  private setupExpress() {
    this.app.use(cors({
      origin: [
        'http://localhost:4036', // LogAI Dashboard
        'http://localhost:3394', // DexAI
        'http://localhost:4034', // ConversAI
        'http://localhost:4035', // DonAI
        'http://localhost:3000', // General development
      ],
      credentials: true
    }))

    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        version: '2.0.0',
        connections: this.clients.size,
        totalLogs: this.logs.length,
        uptime: process.uptime()
      })
    })

    // API endpoints
    this.app.post('/api/logai/log', this.handleLogEntry.bind(this))
    this.app.post('/api/logai/metric', this.handleMetric.bind(this))
    this.app.get('/api/logai/logs', this.getLogs.bind(this))
    this.app.get('/api/logai/metrics', this.getMetrics.bind(this))
    this.app.get('/api/logai/system-metrics', this.getSystemMetrics.bind(this))
  }

  private setupWebSocket() {
    this.wss = new WebSocketServer({
      server: this.server,
      path: '/logai'
    })

    this.wss.on('connection', (ws, _req) => {
      const clientId = uuidv4()
      const client: ClientConnection = {
        id: clientId,
        ws,
        subscriptions: ['logs', 'metrics', 'system'],
        lastActivity: new Date()
      }

      this.clients.set(clientId, client)
      console.log(`🔗 Client connected: ${clientId} (Total: ${this.clients.size})`)

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        clientId,
        timestamp: new Date(),
        message: 'Conectat la LogAI Universal Server'
      }))

      // Send recent logs and metrics
      this.sendRecentData(ws)

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleClientMessage(clientId, message)
        } catch (error) {
          console.error('❌ Invalid message from client:', error)
        }
      })

      ws.on('close', () => {
        this.clients.delete(clientId)
        console.log(`❌ Client disconnected: ${clientId} (Total: ${this.clients.size})`)
      })

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for client ${clientId}:`, error)
        this.clients.delete(clientId)
      })
    })
  }

  private handleLogEntry(req: express.Request, res: express.Response) {
    try {
      const logEntry: LogEntry = {
        id: uuidv4(),
        timestamp: new Date(),
        level: req.body.level || 'INFO',
        app: req.body.app || 'unknown',
        message: req.body.message || '',
        userId: req.body.userId,
        metadata: req.body.metadata
      }

      this.addLogEntry(logEntry)
      res.json({ success: true, id: logEntry.id })
    } catch (error) {
      console.error('❌ Error handling log entry:', error)
      res.status(500).json({ error: 'Failed to process log entry' })
    }
  }

  private handleMetric(req: express.Request, res: express.Response) {
    try {
      const metric: PerformanceMetric = {
        id: uuidv4(),
        timestamp: new Date(),
        app: req.body.app || 'unknown',
        operation: req.body.operation || '',
        duration: req.body.duration || 0,
        metadata: req.body.metadata
      }

      this.addMetric(metric)
      res.json({ success: true, id: metric.id })
    } catch (error) {
      console.error('❌ Error handling metric:', error)
      res.status(500).json({ error: 'Failed to process metric' })
    }
  }

  private getLogs(req: express.Request, res: express.Response) {
    const limit = parseInt(req.query.limit as string) || 100
    const app = req.query.app as string
    const level = req.query.level as string

    let filteredLogs = this.logs
    if (app) {
      filteredLogs = filteredLogs.filter(log => log.app === app)
    }
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level)
    }

    const result = filteredLogs
      .slice(-limit)
      .reverse()

    res.json({
      logs: result,
      total: filteredLogs.length,
      timestamp: new Date()
    })
  }

  private getMetrics(req: express.Request, res: express.Response) {
    const limit = parseInt(req.query.limit as string) || 100
    const app = req.query.app as string

    let filteredMetrics = this.metrics
    if (app) {
      filteredMetrics = filteredMetrics.filter(metric => metric.app === app)
    }

    const result = filteredMetrics
      .slice(-limit)
      .reverse()

    res.json({
      metrics: result,
      total: filteredMetrics.length,
      timestamp: new Date()
    })
  }

  private getSystemMetrics(req: express.Request, res: express.Response) {
    const limit = parseInt(req.query.limit as string) || 60

    const result = this.systemMetrics
      .slice(-limit)
      .reverse()

    res.json({
      metrics: result,
      timestamp: new Date()
    })
  }

  private addLogEntry(logEntry: LogEntry) {
    this.logs.push(logEntry)

    // Keep only last 10000 logs
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000)
    }

    // Broadcast to connected clients
    this.broadcast({
      type: 'log',
      data: logEntry
    })

    console.log(`📝 [${logEntry.level}] ${logEntry.app}: ${logEntry.message}`)
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)

    // Keep only last 10000 metrics
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-10000)
    }

    // Broadcast to connected clients
    this.broadcast({
      type: 'metric',
      data: metric
    })

    console.log(`📊 [${metric.app}] ${metric.operation}: ${metric.duration}ms`)
  }

  private sendRecentData(ws: WebSocket) {
    // Send recent logs
    const recentLogs = this.logs.slice(-20)
    if (recentLogs.length > 0) {
      ws.send(JSON.stringify({
        type: 'logs-batch',
        data: recentLogs
      }))
    }

    // Send recent system metrics
    const recentSystemMetrics = this.systemMetrics.slice(-1)
    if (recentSystemMetrics.length > 0) {
      ws.send(JSON.stringify({
        type: 'system-metrics',
        data: recentSystemMetrics[0]
      }))
    }
  }

  private handleClientMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client) return

    client.lastActivity = new Date()

    switch (message.type) {
      case 'subscribe':
        client.subscriptions = message.subscriptions || ['logs', 'metrics', 'system']
        break
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }))
        break
      default:
        console.log(`📨 Unknown message type from ${clientId}:`, message.type)
    }
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message)
    let sentCount = 0

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(data)
          sentCount++
        } catch (error) {
          console.error('❌ Error broadcasting to client:', error)
        }
      }
    })

    if (sentCount > 0) {
      console.log(`📡 Broadcasted ${message.type} to ${sentCount} clients`)
    }
  }

  private startMetricsCollection() {
    // Collect system metrics every 2 seconds
    setInterval(() => {
      const now = new Date()
      const lastMinuteLogs = this.logs.filter(
        log => now.getTime() - log.timestamp.getTime() < 60000
      )
      const lastMinuteErrors = lastMinuteLogs.filter(
        log => log.level === 'ERROR' || log.level === 'CRITICAL'
      )

      const recentMetrics = this.metrics.filter(
        metric => now.getTime() - metric.timestamp.getTime() < 60000
      )
      const avgResponseTime = recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
        : 0

      const activeApps = new Set(lastMinuteLogs.map(log => log.app)).size
      const activeUsers = new Set(lastMinuteLogs.map(log => log.userId).filter(Boolean)).size

      const systemMetric: SystemMetrics = {
        timestamp: now,
        logsPerMinute: lastMinuteLogs.length,
        errorsPerMinute: lastMinuteErrors.length,
        avgResponseTime: Math.round(avgResponseTime),
        activeApps,
        totalLogs: this.logs.length,
        errorRate: lastMinuteLogs.length > 0 ? (lastMinuteErrors.length / lastMinuteLogs.length) * 100 : 0,
        activeUsers,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        cpuUsage: Math.round(process.cpuUsage().user / 1000) // Simplified CPU usage
      }

      this.systemMetrics.push(systemMetric)

      // Keep only last hour of system metrics
      if (this.systemMetrics.length > 1800) { // 30 minutes * 60 seconds / 2 seconds
        this.systemMetrics = this.systemMetrics.slice(-1800)
      }

      // Broadcast system metrics
      this.broadcast({
        type: 'system-metrics',
        data: systemMetric
      })

    }, 2000) // Every 2 seconds

    // Generate some demo logs for testing
    this.generateDemoLogs()
  }

  private generateDemoLogs() {
    const apps = ['codai', 'romai', 'dexai', 'conversai', 'donai']
    const levels: LogEntry['level'][] = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    const operations = [
      'User authentication',
      'API request processed',
      'Database query executed',
      'Email sent',
      'File uploaded',
      'Cache updated',
      'AI processing completed',
      'Donation processed',
      'Dictionary lookup',
      'Translation completed'
    ]

    // Generate a demo log every 5-15 seconds
    const generateLog = () => {
      const app = apps[Math.floor(Math.random() * apps.length)]
      const level = levels[Math.floor(Math.random() * levels.length)]
      const operation = operations[Math.floor(Math.random() * operations.length)]

      const logEntry: LogEntry = {
        id: uuidv4(),
        timestamp: new Date(),
        level,
        app,
        message: `${operation} ${level === 'ERROR' ? 'failed' : 'successfully'}`,
        userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
        metadata: {
          demo: true,
          requestId: uuidv4().slice(0, 8)
        }
      }

      this.addLogEntry(logEntry)

      // Also generate a performance metric sometimes
      if (Math.random() > 0.7) {
        const metric: PerformanceMetric = {
          id: uuidv4(),
          timestamp: new Date(),
          app,
          operation: operation.toLowerCase().replace(/\s+/g, '-'),
          duration: Math.floor(Math.random() * 1000) + 50,
          metadata: {
            demo: true
          }
        }
        this.addMetric(metric)
      }

      // Schedule next log
      setTimeout(generateLog, Math.random() * 10000 + 5000) // 5-15 seconds
    }

    // Start generating demo logs
    setTimeout(generateLog, 2000)
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`
🚀 LogAI Universal Server started!

📊 Dashboard: http://localhost:4036
🔗 WebSocket: ws://localhost:${this.port}/logai
🌐 API: http://localhost:${this.port}/api/logai
💚 Health: http://localhost:${this.port}/health

Ready to receive logs from CODAI ecosystem...
      `)
    })
  }
}

// Start the server
const server = new LogAIServer()
server.start()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down LogAI Server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down LogAI Server...')
  process.exit(0)
})

export default LogAIServer
