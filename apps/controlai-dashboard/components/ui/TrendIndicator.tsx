'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendIndicatorProps {
  value: number
  type: 'increase' | 'decrease' | 'stable'
  period?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showValue?: boolean
  className?: string
  animate?: boolean
}

export function TrendIndicator({
  value,
  type,
  period,
  size = 'md',
  showIcon = true,
  showValue = true,
  className = '',
  animate = true
}: TrendIndicatorProps) {
  const getColorClasses = () => {
    switch (type) {
      case 'increase':
        return {
          text: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800'
        }
      case 'decrease':
        return {
          text: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800'
        }
      case 'stable':
        return {
          text: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-700'
        }
      default:
        return {
          text: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-700'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          spacing: 'space-x-1'
        }
      case 'md':
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
          spacing: 'space-x-1.5'
        }
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-5 h-5',
          spacing: 'space-x-2'
        }
      default:
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
          spacing: 'space-x-1.5'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'increase':
        return TrendingUp
      case 'decrease':
        return TrendingDown
      case 'stable':
        return Minus
      default:
        return Minus
    }
  }

  const formatValue = (val: number) => {
    if (val === 0) return '0'
    if (val < 1) return val.toFixed(1)
    if (val < 10) return val.toFixed(1)
    return Math.round(val).toString()
  }

  const colorClasses = getColorClasses()
  const sizeClasses = getSizeClasses()
  const Icon = getIcon()

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  }

  const iconVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: type === 'increase' ? 360 : type === 'decrease' ? -360 : 0,
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        delay: 0.2
      }
    }
  }

  return (
    <motion.div
      variants={animate ? containerVariants : undefined}
      initial={animate ? 'initial' : undefined}
      animate={animate ? 'animate' : undefined}
      className={`
        inline-flex items-center ${sizeClasses.spacing} ${sizeClasses.container}
        ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}
        border rounded-full font-medium
        ${className}
      `}
    >
      {showIcon && (
        <motion.div
          variants={animate ? iconVariants : undefined}
          className="flex-shrink-0"
        >
          <Icon className={sizeClasses.icon} />
        </motion.div>
      )}

      {showValue && (
        <span className="font-semibold">
          {type !== 'stable' && (type === 'increase' ? '+' : '-')}
          {formatValue(value)}
          {type !== 'stable' && '%'}
        </span>
      )}

      {period && (
        <span className="opacity-75">
          {period}
        </span>
      )}
    </motion.div>
  )
}

// Specialized trend indicators
export function SimpleTrendIndicator({
  value,
  type,
  className = ''
}: {
  value: number
  type: 'increase' | 'decrease' | 'stable'
  className?: string
}) {
  return (
    <TrendIndicator
      value={value}
      type={type}
      size="sm"
      showIcon={true}
      showValue={true}
      className={className}
    />
  )
}

export function TrendBadge({
  value,
  type,
  period,
  className = ''
}: {
  value: number
  type: 'increase' | 'decrease' | 'stable'
  period?: string
  className?: string
}) {
  return (
    <TrendIndicator
      value={value}
      type={type}
      period={period}
      size="sm"
      showIcon={true}
      showValue={true}
      className={`rounded-md ${className}`}
    />
  )
}

export function TrendIcon({
  type,
  size = 'md',
  className = ''
}: {
  type: 'increase' | 'decrease' | 'stable'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <TrendIndicator
      value={0}
      type={type}
      size={size}
      showIcon={true}
      showValue={false}
      className={`p-0 bg-transparent border-0 ${className}`}
    />
  )
}

// Animated trend line component
export function TrendLine({
  data,
  color = 'stroke-blue-500',
  strokeWidth = 2,
  className = ''
}: {
  data: { value: number; timestamp: Date }[]
  color?: string
  strokeWidth?: number
  className?: string
}) {
  if (!data || data.length < 2) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const width = 100
  const height = 20
  const padding = 2

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * (width - 2 * padding) + padding
    const y = height - ((point.value - minValue) / range) * (height - 2 * padding) - padding
    return `${x},${y}`
  }).join(' ')

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <motion.polyline
          points={points}
          fill="none"
          className={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1, ease: 'easeInOut' },
            opacity: { duration: 0.3 }
          }}
        />
        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * (width - 2 * padding) + padding
          const y = height - ((point.value - minValue) / range) * (height - 2 * padding) - padding
          return (
            <motion.circle
              key={index}
              cx={x}
              cy={y}
              r={1.5}
              className={color.replace('stroke-', 'fill-')}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.3,
                ease: 'easeOut'
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}

export default TrendIndicator
