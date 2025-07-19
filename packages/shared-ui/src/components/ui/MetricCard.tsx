'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from './Card'
import { cn } from '../../lib/utils'

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'yellow' | 'red'
  delay?: number
  className?: string
}

const colorMap = {
  indigo: 'bg-indigo-500/20 text-indigo-400',
  green: 'bg-green-500/20 text-green-400',
  blue: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  red: 'bg-red-500/20 text-red-400'
}

const trendMap = {
  up: 'bg-green-500/20 text-green-400',
  down: 'bg-red-500/20 text-red-400',
  stable: 'bg-gray-500/20 text-gray-400'
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  color = 'indigo',
  delay = 0,
  className
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />
      case 'down':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      <Card variant="glass" className="hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={cn('p-3 rounded-xl', colorMap[color])}>
            {icon}
          </div>
          <div className={cn(
            'flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium',
            trendMap[trend]
          )}>
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
          <p className="text-gray-300 font-medium">{title}</p>
        </div>
      </Card>
    </motion.div>
  )
}

export default MetricCard
