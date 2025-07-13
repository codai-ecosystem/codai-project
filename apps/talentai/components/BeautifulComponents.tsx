'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card ${className} ${hover ? 'hover:bg-white/20 transition-all duration-300' : ''}`}
      whileHover={hover ? { scale: 1.02 } : undefined}
    >
      {children}
    </motion.div>
  )
}

interface GradientTextProps {
  children: ReactNode
  className?: string
  colors?: string
}

export function GradientText({ children, className = '', colors = 'from-blue-400 to-purple-400' }: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r ${colors} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

interface AnimatedBackgroundProps {
  children: ReactNode
  colorScheme?: {
    primary: string
    secondary: string
    accent: string
  }
}

export function AnimatedBackground({ children, colorScheme = { primary: 'blue', secondary: 'purple', accent: 'cyan' } }: AnimatedBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute -inset-[10px] opacity-30">
          <motion.div
            className={`absolute top-1/4 left-1/4 w-96 h-96 bg-${colorScheme.primary}-500 rounded-full mix-blend-multiply filter blur-xl opacity-70`}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className={`absolute top-1/3 right-1/4 w-96 h-96 bg-${colorScheme.secondary}-500 rounded-full mix-blend-multiply filter blur-xl opacity-70`}
            animate={{
              x: [0, -50, 100, 0],
              y: [0, 50, -100, 0],
              scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          />
          <motion.div
            className={`absolute bottom-1/4 left-1/3 w-96 h-96 bg-${colorScheme.accent}-500 rounded-full mix-blend-multiply filter blur-xl opacity-70`}
            animate={{
              x: [0, -100, 50, 0],
              y: [0, 100, -50, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, delay: 10 }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading'
  label?: string
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-emerald-400'
      case 'offline': return 'bg-red-400'
      case 'loading': return 'bg-yellow-400'
      default: return 'bg-slate-400'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </div>
  )
}

interface StatsCardProps {
  value: string | number
  label: string
  color?: string
  trend?: 'up' | 'down' | 'stable'
}

export function StatsCard({ value, label, color = 'blue', trend }: StatsCardProps) {
  return (
    <GlassCard className="p-6 text-center">
      <div className={`text-3xl font-bold text-${color}-400`}>{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {trend && (
        <div className={`text-xs mt-1 ${
          trend === 'up' ? 'text-emerald-400' : 
          trend === 'down' ? 'text-red-400' : 
          'text-slate-400'
        }`}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </div>
      )}
    </GlassCard>
  )
}