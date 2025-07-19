'use client'

import { AppRouting } from '@codai/shared-ui'
import { Globe, Monitor, TrendingUp, BarChart3, Wifi, Server } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Web Analytics',
      description: 'Comprehensive web performance and user analytics',
      status: 'active' as const
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: 'Real-time Monitoring',
      description: 'Live monitoring of web applications and services',
      status: 'active' as const
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: 'Infrastructure Metrics',
      description: 'Monitor server performance and infrastructure health',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Performance Optimization',
      description: 'Optimize web performance with actionable insights',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="METU-WEB"
      appTagline="Web Metrics & Analytics"
      appDescription="Advanced web analytics platform with real-time monitoring, infrastructure metrics, and performance optimization tools."
      features={features}
      brandColor="teal"
    />
  )
}
