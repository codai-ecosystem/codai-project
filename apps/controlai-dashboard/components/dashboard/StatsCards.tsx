'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/types'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { TrendIndicator } from '../ui/TrendIndicator'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface StatsCardsProps {
  data?: DashboardMetrics
  loading?: boolean
  className?: string
}

interface StatCard {
  id: string
  title: string
  value: number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'stable'
    period: string
  }
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
}

export function StatsCards({ data, loading, className = '' }: StatsCardsProps) {
  // Generate mock trend data for demonstration
  const generateMockTrend = (current: number): { value: number; type: 'increase' | 'decrease' | 'stable' } => {
    const change = Math.floor(Math.random() * 20) - 10 // -10 to +10
    return {
      value: Math.abs(change),
      type: change > 2 ? 'increase' : change < -2 ? 'decrease' : 'stable'
    }
  }

  const stats: StatCard[] = [
    {
      id: 'total-projects',
      title: 'Total Projects',
      value: data?.totalProjects || 0,
      change: data?.totalProjects ? {
        ...generateMockTrend(data.totalProjects),
        period: 'this month'
      } : undefined,
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'completed-projects',
      title: 'Completed Projects',
      value: data?.completedProjects || 0,
      change: data?.completedProjects ? {
        ...generateMockTrend(data.completedProjects),
        period: 'this month'
      } : undefined,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'active-tasks',
      title: 'Active Tasks',
      value: data ? (data.totalTasks - data.completedTasks) : 0,
      change: data ? {
        ...generateMockTrend(data.totalTasks - data.completedTasks),
        period: 'this week'
      } : undefined,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'active-agents',
      title: 'Active Agents',
      value: data?.activeAgents || 0,
      change: data?.activeAgents ? {
        ...generateMockTrend(data.activeAgents),
        period: 'right now'
      } : undefined,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ]

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array(4).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.id}
          stat={stat}
          index={index}
        />
      ))}
    </div>
  )
}

interface StatCardProps {
  stat: StatCard
  index: number
}

function StatCard({ stat, index }: StatCardProps) {
  const { id, title, value, change, icon: Icon, color, bgColor, borderColor } = stat

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        transition: { duration: 0.2 }
      }}
      className={`
        bg-white dark:bg-gray-800 rounded-xl p-6 
        shadow-sm border ${borderColor}
        hover:shadow-lg transition-all duration-200
        cursor-pointer relative overflow-hidden
      `}
      data-testid={`stat-card-${id}`}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} rounded-full -translate-y-16 translate-x-16 opacity-50`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <AnimatedCounter
            value={value}
            className="text-2xl font-bold text-gray-900 dark:text-white"
            duration={1000}
            delay={index * 100}
          />
        </div>

        {/* Trend */}
        {change && (
          <div className="flex items-center space-x-2">
            <TrendIndicator
              value={change.value}
              type={change.type}
              period={change.period}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}

// Additional stats component for more detailed metrics
export function DetailedStatsCards({ data, loading }: StatsCardsProps) {
  const detailedStats = [
    {
      id: 'completion-rate',
      title: 'Project Completion Rate',
      value: data ? Math.round((data.completedProjects / data.totalProjects) * 100) : 0,
      suffix: '%',
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'task-completion-rate',
      title: 'Task Completion Rate',
      value: data ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0,
      suffix: '%',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'agent-utilization',
      title: 'Agent Utilization',
      value: data ? Math.round((data.activeAgents / data.totalAgents) * 100) : 0,
      suffix: '%',
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <LoadingSpinner size="sm" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {detailedStats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: index * 0.1,
            duration: 0.4,
            ease: 'easeOut'
          }}
          className={`
            bg-white dark:bg-gray-800 rounded-xl p-6 
            shadow-sm border ${stat.borderColor}
            hover:shadow-lg transition-all duration-200
          `}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </h3>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          
          <div className="flex items-baseline space-x-1">
            <AnimatedCounter
              value={stat.value}
              className={`text-3xl font-bold ${stat.color}`}
              duration={1200}
              delay={index * 150}
            />
            {stat.suffix && (
              <span className={`text-lg font-semibold ${stat.color}`}>
                {stat.suffix}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default StatsCards
