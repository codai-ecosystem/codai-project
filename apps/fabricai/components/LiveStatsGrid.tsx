'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Database, Zap, Clock, Activity } from 'lucide-react'
import type { AppStats } from '../types'

interface LiveStatsGridProps {
  stats: AppStats
  theme: string
}

export function LiveStatsGrid({ stats, theme }: LiveStatsGridProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: theme,
      trend: '+12%',
      subtitle: 'Growing daily'
    },
    {
      title: 'Active Now',
      value: stats.activeNow.toLocaleString(),
      icon: Activity,
      color: 'emerald',
      trend: 'Live',
      subtitle: 'Real-time'
    },
    {
      title: 'Performance',
      value: `${stats.performance.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'blue',
      trend: '+8%',
      subtitle: 'Optimized'
    },
    {
      title: 'Data Processed',
      value: `${(stats.dataProcessed / 1000000).toFixed(2)}TB`,
      icon: Database,
      color: 'purple',
      trend: '+24%',
      subtitle: 'This month'
    },
    {
      title: 'Response Time',
      value: `${stats.responseTime.toFixed(1)}ms`,
      icon: Clock,
      color: 'orange',
      trend: '-15%',
      subtitle: 'Improved'
    },
    {
      title: 'Throughput',
      value: `${stats.throughput.toFixed(0)} MB/s`,
      icon: Zap,
      color: 'yellow',
      trend: '+31%',
      subtitle: 'High speed'
    }
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          className={`glassmorphism rounded-2xl p-6 border border-white/20 bg-gradient-to-br from-${card.color}-500/10 to-${card.color}-600/5`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`w-12 h-12 bg-${card.color}-500/20 rounded-xl flex items-center justify-center`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <card.icon className={`w-6 h-6 text-${card.color}-400`} />
            </motion.div>
            <motion.span
              className={`text-${card.color}-400 text-sm font-medium bg-${card.color}-400/20 px-3 py-1 rounded-full`}
              whileHover={{ scale: 1.1 }}
            >
              {card.trend}
            </motion.span>
          </div>
          <div className="text-3xl font-bold mb-2">{card.value}</div>
          <div className="text-slate-400 text-sm mb-1">{card.title}</div>
          <div className={`text-${card.color}-400 text-xs`}>{card.subtitle}</div>
          
          {/* Progress bar for some stats */}
          {(card.title === 'Performance' || card.title === 'Total Users') && (
            <div className="w-full bg-white/10 rounded-full h-2 mt-4">
              <motion.div
                className={`bg-gradient-to-r from-${card.color}-500 to-${card.color}-400 h-2 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: card.title === 'Performance' ? `${stats.performance}%` : '78%' }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
