'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  Users,
  TrendingUp,
  Clock,
  Smartphone,
  Download,
  Star,
  Globe,
  Database,
  Zap
} from 'lucide-react'
import type { MobileStats, ColorScheme } from '../types'

interface RealTimeStatsProps {
  stats: MobileStats
  colorScheme: ColorScheme
}

export function RealTimeStats({ stats, colorScheme }: RealTimeStatsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="glassmorphism rounded-xl p-6 group hover:bg-white/15 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -5, scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-emerald-400 text-sm font-medium">↗ +12%</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-medium">Total Items</h3>
          <p className="text-3xl font-bold text-white">{formatNumber(stats.totalItems)}</p>
          <p className="text-sm text-blue-300">Managed applications</p>
        </div>
      </motion.div>

      <motion.div
        className="glassmorphism rounded-xl p-6 group hover:bg-white/15 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -5, scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-emerald-400 text-sm font-medium">↗ +8%</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-medium">Active Users</h3>
          <p className="text-3xl font-bold text-white">{formatNumber(stats.activeUsers)}</p>
          <p className="text-sm text-emerald-300">Online now</p>
        </div>
      </motion.div>

      <motion.div
        className="glassmorphism rounded-xl p-6 group hover:bg-white/15 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ y: -5, scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-emerald-400 text-sm font-medium">↗ +15%</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-medium">Efficiency</h3>
          <p className="text-3xl font-bold text-white">{stats.efficiency.toFixed(1)}%</p>
          <p className="text-sm text-indigo-300">System performance</p>
        </div>
      </motion.div>

      <motion.div
        className="glassmorphism rounded-xl p-6 group hover:bg-white/15 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ y: -5, scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-emerald-400 text-sm font-medium">Stable</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-medium">Performance</h3>
          <p className="text-3xl font-bold text-white">{stats.performance.toFixed(1)}%</p>
          <p className="text-sm text-cyan-300">Overall score</p>
        </div>
      </motion.div>

      <motion.div
        className="glassmorphism rounded-xl p-6 group hover:bg-white/15 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ y: -5, scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20">
            <Zap className="w-6 h-6 text-orange-400" />
          </div>
          <span className="text-emerald-400 text-sm font-medium">Fast</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-medium">Processing Speed</h3>
          <p className="text-3xl font-bold text-white">{stats.processingSpeed.toFixed(3)}s</p>
          <p className="text-sm text-orange-300">Average response</p>
        </div>
      </motion.div>

      <motion.div
        className="glassmorphism rounded-xl p-6 group hover:bg-white/15 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ y: -5, scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20">
            <Globe className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-emerald-400 text-sm font-medium">Excellent</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-medium">Uptime</h3>
          <p className="text-3xl font-bold text-white">{stats.uptime}%</p>
          <p className="text-sm text-green-300">30-day average</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
