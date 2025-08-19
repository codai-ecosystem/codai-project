import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, Users, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface MetricData {
  id: string
  title: string
  value: number
  unit: string
  change: number
  changeType: 'increase' | 'decrease' | 'stable'
  trend: number[]
  category: string
}

interface ImpactMetricsProps {
  metrics: MetricData[]
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
  compact?: boolean
}

export function ImpactMetrics({ metrics, timeframe = 'month', compact = false }: ImpactMetricsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const timeframeOptions = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' }
  ]

  const categories = ['all', ...Array.from(new Set(metrics.map(m => m.category)))]

  const filteredMetrics = selectedCategory === 'all'
    ? metrics
    : metrics.filter(m => m.category === selectedCategory)

  const displayMetrics = compact ? filteredMetrics.slice(0, 4) : filteredMetrics

  const formatValue = (value: number, unit: string) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON'
      }).format(value)
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`
    }

    return `${value.toLocaleString()} ${unit}`
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="h-3 w-3 text-green-500" />
      case 'decrease':
        return <ArrowDownRight className="h-3 w-3 text-red-500" />
      default:
        return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'donations':
        return '💰'
      case 'beneficiaries':
        return '👥'
      case 'campaigns':
        return '🎯'
      case 'impact':
        return '🌟'
      case 'efficiency':
        return '⚡'
      default:
        return '📊'
    }
  }

  const generateSparkline = (trend: number[]) => {
    const max = Math.max(...trend)
    const min = Math.min(...trend)
    const range = max - min

    return trend.map((value, index) => {
      const height = range > 0 ? ((value - min) / range) * 100 : 50
      return (
        <div
          key={index}
          className="bg-gradient-to-t from-green-400 to-green-500 rounded-sm opacity-70"
          style={{ height: `${height}%` }}
        />
      )
    })
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Impact Metrics</h3>
            <p className="text-sm text-gray-600">Key performance indicators and trends</p>
          </div>
        </div>

        {!compact && (
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {displayMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(metric.category)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{metric.title}</h4>
                  <p className="text-xs text-gray-500 capitalize">{metric.category}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {getChangeIcon(metric.changeType)}
                <span className={`text-xs font-medium ${getChangeColor(metric.changeType)}`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-2xl font-bold text-gray-900">
                {formatValue(metric.value, metric.unit)}
              </div>
              <div className="text-xs text-gray-500">
                vs previous {selectedTimeframe}
              </div>
            </div>

            {/* Sparkline chart */}
            <div className="flex items-end space-x-1 h-8 mb-2">
              {generateSparkline(metric.trend)}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Trend</span>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600 font-medium">
                  {metric.trend.length > 1 && metric.trend[metric.trend.length - 1] > metric.trend[0] ? 'Growing' : 'Stable'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary statistics */}
      {!compact && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {filteredMetrics.filter(m => m.changeType === 'increase').length}
              </div>
              <div className="text-sm text-green-600">Improving</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {filteredMetrics.filter(m => m.changeType === 'stable').length}
              </div>
              <div className="text-sm text-gray-600">Stable</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {filteredMetrics.filter(m => m.changeType === 'decrease').length}
              </div>
              <div className="text-sm text-red-600">Declining</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {filteredMetrics.length}
              </div>
              <div className="text-sm text-gray-600">Total Metrics</div>
            </div>
          </div>
        </div>
      )}

      {displayMetrics.length === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No metrics available</p>
          <p className="text-sm text-gray-500">Metrics will appear here as data is collected</p>
        </div>
      )}

      {compact && filteredMetrics.length > 4 && (
        <div className="text-center pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View {filteredMetrics.length - 4} more metrics
          </motion.button>
        </div>
      )}
    </div>
  )
}
