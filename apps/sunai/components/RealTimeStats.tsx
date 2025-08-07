'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sun,
  Zap,
  TrendingUp,
  Globe,
  Battery,
  Gauge,
  Leaf,
  Activity
} from 'lucide-react'

interface SunaiStats {
  totalItems: number
  activeUsers: number
  efficiency: number
  performance: number
  processingSpeed: number
  uptime: number
}

interface RealTimeStatsProps {
  stats: SunaiStats
  colorScheme: {
    primary: string
    secondary: string
    accent: string
  }
}

export function RealTimeStats({ stats, colorScheme }: RealTimeStatsProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (isLoading) {
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-8 bg-white/20 rounded"></div>
          </div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div
        className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Activity className="w-6 h-6 text-yellow-400" />
          </div>
          <span className="text-xs text-white/60 font-medium">TOTAL ITEMS</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{formatNumber(stats.totalItems)}</p>
          <p className="text-sm text-yellow-300">Solar panels tracked</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-xs text-white/60 font-medium">ACTIVE USERS</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{formatNumber(stats.activeUsers)}</p>
          <p className="text-sm text-blue-300">Connected systems</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Gauge className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-xs text-white/60 font-medium">EFFICIENCY</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{stats.efficiency.toFixed(1)}%</p>
          <p className="text-sm text-green-300">Solar conversion</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-xs text-white/60 font-medium">PERFORMANCE</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{stats.performance.toFixed(1)}%</p>
          <p className="text-sm text-purple-300">System score</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Zap className="w-6 h-6 text-orange-400" />
          </div>
          <span className="text-xs text-white/60 font-medium">PROCESSING SPEED</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{stats.processingSpeed.toFixed(3)}s</p>
          <p className="text-sm text-orange-300">Response time</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-rose-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-rose-500/20 rounded-lg">
            <Sun className="w-6 h-6 text-rose-400" />
          </div>
          <span className="text-xs text-white/60 font-medium">UPTIME</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{stats.uptime.toFixed(1)}%</p>
          <p className="text-sm text-rose-300">System availability</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

