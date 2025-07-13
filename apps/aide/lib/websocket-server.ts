import { WebSocketServer } from 'ws'
import { watch } from 'fs'
import path from 'path'

interface WSMessage {
  type: 'file_changed' | 'git_status_updated' | 'project_opened' | 'terminal_output'
  data: any
  timestamp: string
}

class AideWebSocketServer {
  private wss: WebSocketServer | null = null
  private watchers: Map<string, any> = new Map()

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (typeof window !== 'undefined') return // Browser environment

    try {
      this.wss = new WebSocketServer({ port: 8080 })

      this.wss.on('connection', (ws) => {
        console.log('New WebSocket connection established')

        ws.on('message', (message) => {
          try {
            const { type, data } = JSON.parse(message.toString())
            this.handleMessage(type, data, ws)
          } catch (error) {
            console.error('Invalid WebSocket message:', error)
          }
        })

        ws.on('close', () => {
          console.log('WebSocket connection closed')
        })

        // Send welcome message
        this.sendMessage(ws, {
          type: 'connection_established',
          data: { message: 'AIDE WebSocket connected' },
          timestamp: new Date().toISOString()
        })
      })

      console.log('AIDE WebSocket server started on port 8080')
    } catch (error) {
      console.error('Failed to start WebSocket server:', error)
    }
  }

  private handleMessage(type: string, data: any, ws: any) {
    switch (type) {
      case 'watch_project':
        this.watchProject(data.projectPath, ws)
        break
      case 'unwatch_project':
        this.unwatchProject(data.projectPath)
        break
      case 'terminal_input':
        this.handleTerminalInput(data, ws)
        break
      default:
        console.log('Unknown message type:', type)
    }
  }

  private watchProject(projectPath: string, ws: any) {
    if (this.watchers.has(projectPath)) {
      this.watchers.get(projectPath).close()
    }

    try {
      const watcher = watch(projectPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          this.broadcastMessage({
            type: 'file_changed',
            data: {
              eventType,
              filename,
              projectPath,
              fullPath: path.join(projectPath, filename)
            },
            timestamp: new Date().toISOString()
          })
        }
      })

      this.watchers.set(projectPath, watcher)

      this.sendMessage(ws, {
        type: 'project_watch_started',
        data: { projectPath },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to watch project:', error)
      this.sendMessage(ws, {
        type: 'error',
        data: { message: 'Failed to watch project', error: error.message },
        timestamp: new Date().toISOString()
      })
    }
  }

  private unwatchProject(projectPath: string) {
    const watcher = this.watchers.get(projectPath)
    if (watcher) {
      watcher.close()
      this.watchers.delete(projectPath)
    }
  }

  private handleTerminalInput(data: any, ws: any) {
    // This would integrate with the terminal API
    // For now, just echo back
    this.sendMessage(ws, {
      type: 'terminal_output',
      data: {
        sessionId: data.sessionId,
        output: `Received: ${data.command}\n`
      },
      timestamp: new Date().toISOString()
    })
  }

  private sendMessage(ws: any, message: WSMessage) {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify(message))
    }
  }

  private broadcastMessage(message: WSMessage) {
    if (!this.wss) return

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(message))
      }
    })
  }

  public close() {
    this.watchers.forEach(watcher => watcher.close())
    this.watchers.clear()

    if (this.wss) {
      this.wss.close()
    }
  }
}

// Initialize WebSocket server
let wsServer: AideWebSocketServer | null = null

if (typeof window === 'undefined') {
  wsServer = new AideWebSocketServer()
}

export { AideWebSocketServer, wsServer }
