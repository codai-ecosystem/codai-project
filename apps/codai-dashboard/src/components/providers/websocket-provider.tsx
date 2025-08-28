'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/components/auth/auth-provider'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback?: (data: any) => void) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to WebSocket server
      const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:8110', {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
      })

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error)
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      return () => {
        newSocket.close()
        setIsConnected(false)
        setSocket(null)
        socketRef.current = null
      }
    } else {
      // Clean up if not authenticated
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [isAuthenticated, token])

  const emit = (event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback)
    }
  }

  const contextValue: WebSocketContextType = {
    socket,
    isConnected,
    emit,
    on,
    off,
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}