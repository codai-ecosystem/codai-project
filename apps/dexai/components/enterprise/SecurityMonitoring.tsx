'use client'

import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, Lock, Key, Eye, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SecurityEvent {
  id: string
  type: 'login' | 'access' | 'threat' | 'violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  user?: string
  ip?: string
}

export function SecurityMonitoring({ theme }: { theme: string }) {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      severity: 'low',
      message: 'Successful authentication from trusted device',
      timestamp: new Date(Date.now() - 120000),
      user: 'admin@company.com',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      type: 'threat',
      severity: 'medium',
      message: 'Suspicious activity detected - multiple failed login attempts',
      timestamp: new Date(Date.now() - 300000),
      ip: '203.0.113.42'
    },
    {
      id: '3',
      type: 'access',
      severity: 'low',
      message: 'API key accessed from authorized application',
      timestamp: new Date(Date.now() - 600000),
      user: 'service@company.com'
    }
  ])
  
  const [securityMetrics, setSecurityMetrics] = useState({
    threatsBlocked: 127,
    activeUsers: 45,
    securityScore: 98.7,
    lastScan: new Date()
  })

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time security events
      if (Math.random() > 0.7) {
        const newEvent: SecurityEvent = {
          id: Date.now().toString(),
          type: ['login', 'access', 'threat'][Math.floor(Math.random() * 3)] as any,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          message: 'New security event detected',
          timestamp: new Date(),
          user: Math.random() > 0.5 ? 'user@company.com' : undefined,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`
        }
        
        setSecurityEvents(prev => [newEvent, ...prev.slice(0, 9)])
      }
      
      setSecurityMetrics(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 3),
        activeUsers: Math.max(20, prev.activeUsers + Math.floor(Math.random() * 10) - 5),
        securityScore: Math.min(100, Math.max(95, prev.securityScore + (Math.random() * 2) - 1))
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      default: return 'green'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return Key
      case 'access': return Eye
      case 'threat': return AlertTriangle
      case 'violation': return Shield
      default: return Activity
    }
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          className={`glassmorphism rounded-xl p-4 border border-${theme}-500/20`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Shield className={`w-6 h-6 text-${theme}-400`} />
            <span className="text-emerald-400 text-sm">Secure</span>
          </div>
          <div className="text-2xl font-bold">{securityMetrics.securityScore.toFixed(1)}%</div>
          <div className="text-sm text-slate-400">Security Score</div>
        </motion.div>
        
        <motion.div
          className="glassmorphism rounded-xl p-4 border border-red-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span className="text-red-400 text-sm">Blocked</span>
          </div>
          <div className="text-2xl font-bold">{securityMetrics.threatsBlocked}</div>
          <div className="text-sm text-slate-400">Threats Blocked</div>
        </motion.div>
        
        <motion.div
          className="glassmorphism rounded-xl p-4 border border-emerald-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span className="text-emerald-400 text-sm">Active</span>
          </div>
          <div className="text-2xl font-bold">{securityMetrics.activeUsers}</div>
          <div className="text-sm text-slate-400">Active Users</div>
        </motion.div>
        
        <motion.div
          className="glassmorphism rounded-xl p-4 border border-blue-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Lock className="w-6 h-6 text-blue-400" />
            <span className="text-blue-400 text-sm">Protected</span>
          </div>
          <div className="text-lg font-bold">24/7</div>
          <div className="text-sm text-slate-400">Monitoring</div>
        </motion.div>
      </div>

      {/* Security Events Feed */}
      <div className="glassmorphism rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">Security Events</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {securityEvents.map((event, index) => {
            const Icon = getTypeIcon(event.type)
            const severityColor = getSeverityColor(event.severity)
            
            return (
              <motion.div
                key={event.id}
                className={`bg-white/5 rounded-lg p-4 border border-${severityColor}-500/20`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`w-5 h-5 text-${severityColor}-400 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.message}</span>
                      <span className={`text-${severityColor}-400 text-sm px-2 py-1 bg-${severityColor}-400/20 rounded-full`}>
                        {event.severity}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {event.user && `User: ${event.user} • `}
                      {event.ip && `IP: ${event.ip} • `}
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}