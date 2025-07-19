'use client'

import { AppRouting } from '@codai/shared-ui'
import { Gauge, BarChart3, TrendingUp, Activity, Zap, Monitor } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Gauge className="w-8 h-8" />,
      title: 'Performance Metrics',
      description: 'Comprehensive performance monitoring and metrics',
      status: 'active' as const
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Real-time analytics and data visualization',
      status: 'active' as const
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'System Health',
      description: 'Monitor system health and performance indicators',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Trend Analysis',
      description: 'Advanced trend analysis and predictive insights',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="METU"
      appTagline="Metrics & Analytics Platform"
      appDescription="Advanced metrics and analytics platform with real-time monitoring, performance tracking, and predictive insights."
      features={features}
      brandColor="emerald"
    />
  )
}
