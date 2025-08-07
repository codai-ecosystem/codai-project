'use client'

import React from 'react'

import { AppRouting } from '@codai/shared-ui'
import { Sun, Zap, Leaf, BarChart3, Calculator, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Sun className="w-8 h-8" />,
      title: 'Solar Energy Management',
      description: 'Optimize solar panel performance and energy generation',
      status: 'active' as const
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Smart Grid Integration',
      description: 'Seamless integration with smart energy grids',
      status: 'active' as const
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Energy Analytics',
      description: 'Comprehensive energy usage and efficiency analysis',
      status: 'active' as const
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: 'Cost Optimization',
      description: 'Maximize savings through intelligent energy management',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="SUNAI"
      appTagline="Smart Solar Energy Platform"
      appDescription="Harness the power of solar energy with AI-driven optimization, smart grid integration, and comprehensive analytics for maximum efficiency."
      features={features}
      brandColor="yellow"
    />
  )
}

