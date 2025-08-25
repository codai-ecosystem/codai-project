'use client'

import React from 'react'
/**
 * Advanced Analytics Chart Components
 * Phase 2 Dashboard Enhancement - Interactive Recharts Components
 */

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

// Color palette for consistent theming
const colors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  gray: '#6B7280'
}

const chartColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger, colors.info]

// Project Trends Chart Component
export function ProjectTrendsChart({
  data,
  height = 300,
  showLegend = true,
  interactive = true
}: {
  data: any[]
  height?: number
  showLegend?: boolean
  interactive?: boolean
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No project trend data available
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31 41 55)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: any, name: string) => [
              `${Math.round(value)}${name === 'completion' ? '%' : ''}`,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
          />
          {showLegend && <Legend />}

          <Bar
            dataKey="completion"
            fill={colors.primary}
            name="Completion %"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke={colors.success}
            strokeWidth={3}
            name="Velocity"
            dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="risk"
            stroke={colors.danger}
            strokeWidth={3}
            strokeDasharray="5 5"
            name="Risk Score"
            dot={{ fill: colors.danger, strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Agent Performance Radar Chart
export function AgentPerformanceRadar({
  data,
  height = 400
}: {
  data: any[]
  height?: number
}) {
  // Transform data for radar chart
  const radarData = data.map(agent => ({
    agent: agent.name,
    efficiency: agent.efficiency || 0,
    workload: agent.workload || 0,
    tasks: Math.min(agent.tasksCompleted * 10, 100), // Normalize to 0-100
    specialization: (agent.specialization?.length || 0) * 20 // Normalize to 0-100
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid className="opacity-30" />
          <PolarAngleAxis
            dataKey="agent"
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            className="text-gray-500 dark:text-gray-500"
          />
          <Radar
            name="Efficiency"
            dataKey="efficiency"
            stroke={colors.primary}
            fill={colors.primary}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Workload"
            dataKey="workload"
            stroke={colors.warning}
            fill={colors.warning}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31 41 55)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Resource Utilization Gauge
export function ResourceUtilizationGauge({
  utilization,
  size = 200
}: {
  utilization: number
  size?: number
}) {
  const data = [
    { name: 'Used', value: utilization, fill: colors.primary },
    { name: 'Available', value: 100 - utilization, fill: '#E5E7EB' }
  ]

  const getUtilizationColor = (value: number) => {
    if (value >= 90) return colors.danger
    if (value >= 70) return colors.warning
    return colors.success
  }

  const getUtilizationIcon = (value: number) => {
    if (value >= 90) return AlertTriangle
    if (value >= 70) return Activity
    return CheckCircle2
  }

  const Icon = getUtilizationIcon(utilization)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <div className="relative">
        <ResponsiveContainer width={size} height={size}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            data={[{ value: utilization }]}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="value"
              fill={getUtilizationColor(utilization)}
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Icon className={`w-6 h-6 mx-auto mb-1`} style={{ color: getUtilizationColor(utilization) }} />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(utilization)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Utilized
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Timeline Chart for Project Progress
export function ProjectTimelineChart({
  data,
  height = 300
}: {
  data: any[]
  height?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31 41 55)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: any) => [`${Math.round(value)}%`, 'Completion']}
          />
          <Area
            type="monotone"
            dataKey="completion"
            stroke={colors.primary}
            fillOpacity={1}
            fill="url(#completionGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Risk Assessment Chart
export function RiskAssessmentChart({
  data,
  height = 250
}: {
  data: any[]
  height?: number
}) {
  const riskColors = {
    low: colors.success,
    medium: colors.warning,
    high: colors.danger,
    critical: '#7C2D12'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="project"
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31 41 55)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: any, name: string) => [
              `${Math.round(value)}`,
              'Risk Score'
            ]}
          />
          <Bar
            dataKey="riskScore"
            fill={colors.danger}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Predictive Analytics Chart
export function PredictiveAnalyticsChart({
  data,
  height = 300
}: {
  data: any[]
  height?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31 41 55)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />

          <Line
            type="monotone"
            dataKey="actual"
            stroke={colors.primary}
            strokeWidth={3}
            name="Actual Progress"
            dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={colors.secondary}
            strokeWidth={3}
            strokeDasharray="8 8"
            name="Predicted Progress"
            dot={{ fill: colors.secondary, strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="optimistic"
            stroke={colors.success}
            strokeWidth={2}
            strokeDasharray="4 4"
            name="Optimistic Scenario"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="pessimistic"
            stroke={colors.danger}
            strokeWidth={2}
            strokeDasharray="4 4"
            name="Pessimistic Scenario"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Task Distribution Pie Chart
export function TaskDistributionChart({
  data,
  height = 300
}: {
  data: any[]
  height?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31 41 55)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Metric Card with Trend
export function MetricCard({
  title,
  value,
  trend,
  format = 'number',
  icon: Icon,
  color = 'blue'
}: {
  title: string
  value: number
  trend?: { value: number; positive: boolean }
  format?: 'number' | 'percentage' | 'currency'
  icon?: any
  color?: string
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${Math.round(val)}%`
      case 'currency':
        return `$${val.toLocaleString()}`
      default:
        return val.toLocaleString()
    }
  }

  const TrendIcon = trend?.positive ? TrendingUp : TrendingDown

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatValue(value)}
          </p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'
              }`}>
              <TrendIcon className="w-4 h-4 mr-1" />
              {Math.abs(trend.value)}% from last period
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
            <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Loading skeleton for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"
      style={{ height }}
    >
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
        <Clock className="w-8 h-8" />
      </div>
    </div>
  )
}


