'use client'

import { AppRouting } from '@codai/shared-ui'
import { BarChart3, Monitor, Settings, Activity, Target, Zap } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Real-time Analytics',
      description: 'Live dashboard with real-time data visualization',
      status: 'active' as const
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: 'Custom Dashboards',
      description: 'Create personalized dashboards for your needs',
      status: 'active' as const
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Performance Monitoring',
      description: 'Monitor system performance and key metrics',
      status: 'active' as const
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Goal Tracking',
      description: 'Set and track goals with visual progress indicators',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="DASH"
      appTagline="Smart Dashboard Platform"
      appDescription="Create powerful dashboards with real-time analytics, custom visualizations, and comprehensive monitoring for data-driven decisions."
      features={features}
      brandColor="slate"
    />
  )
}
