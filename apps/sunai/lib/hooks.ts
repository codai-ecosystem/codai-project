'use client'

import { useState, useEffect } from 'react'

interface RealtimeStats {
  users: number
  processes: number
  uptime: number
  performance: number
  lastUpdated: Date
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<RealtimeStats>({
    users: 0,
    processes: 0,
    uptime: 99.9,
    performance: 97.5,
    lastUpdated: new Date()
  })

  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true)

    const interval = setInterval(() => {
      setStats(prev => ({
        users: Math.max(0, prev.users + Math.floor(Math.random() * 20) - 10),
        processes: Math.max(0, prev.processes + Math.floor(Math.random() * 10) - 5),
        uptime: Math.min(100, Math.max(95, prev.uptime + (Math.random() * 0.2) - 0.1)),
        performance: Math.min(100, Math.max(80, prev.performance + (Math.random() * 4) - 2)),
        lastUpdated: new Date()
      }))
    }, 2000)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [])

  return { stats, isConnected }
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: Array<{ name: string; status: string }>
  alerts: Array<{ id: string; type: string; message: string; timestamp: Date }>
}

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    services: [],
    alerts: []
  })

  useEffect(() => {
    // Simulate health checks
    const checkHealth = () => {
      const services = [
        { name: 'API', status: Math.random() > 0.1 ? 'healthy' : 'degraded' },
        { name: 'Database', status: Math.random() > 0.05 ? 'healthy' : 'unhealthy' },
        { name: 'Cache', status: Math.random() > 0.15 ? 'healthy' : 'degraded' },
        { name: 'Queue', status: Math.random() > 0.08 ? 'healthy' : 'degraded' }
      ]

      const alerts = services
        .filter(service => service.status !== 'healthy')
        .map(service => ({
          id: Math.random().toString(36),
          type: service.status === 'unhealthy' ? 'error' : 'warning',
          message: `${service.name} is ${service.status}`,
          timestamp: new Date()
        }))

      setHealth({
        status: alerts.some(alert => alert.type === 'error') ? 'unhealthy' :
          alerts.length > 0 ? 'degraded' : 'healthy',
        services,
        alerts
      })
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  return health
}