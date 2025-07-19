'use client'

import { AppRouting } from '@codai/shared-ui'
import { BarChart3, PieChart, TrendingUp, Database, Target, Brain } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Business Intelligence',
      description: 'Advanced analytics and data visualization for business insights',
      status: 'active' as const
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: 'Data Analytics',
      description: 'Comprehensive data analysis and reporting capabilities',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Predictive Modeling',
      description: 'AI-powered forecasting and trend analysis',
      status: 'active' as const
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Data Integration',
      description: 'Seamless connection to multiple data sources',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="ANALIZAI"
      appTagline="AI-Powered Business Analytics Platform"
      appDescription="Transform your data into actionable insights with advanced analytics, predictive modeling, and comprehensive business intelligence solutions."
      features={features}
      brandColor="indigo"
    />
  )
}
