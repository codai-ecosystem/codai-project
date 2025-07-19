'use client'

import { AppRouting } from '@codai/shared-ui'
import { Activity, Search, AlertTriangle, Cpu, Database, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Real-time Log Analysis',
      description: 'AI-powered real-time monitoring and analysis of system logs',
      status: 'active' as const
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Intelligent Search',
      description: 'Advanced search capabilities with natural language queries',
      status: 'active' as const
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: 'Anomaly Detection',
      description: 'Automated detection of unusual patterns and potential issues',
      status: 'active' as const
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Performance Analytics',
      description: 'Comprehensive analytics and performance insights',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="LOGAI"
      appTagline="AI-Powered Log Analysis Platform"
      appDescription="Transform your log management with intelligent real-time analysis, anomaly detection, and comprehensive monitoring capabilities."
      features={features}
      brandColor="blue"
    />
  )
}
