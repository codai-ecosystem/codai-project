'use client'

import { AppRouting } from '@codai/shared-ui'
import { Grid, Layers, Link, Zap, Globe, Command } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Grid className="w-8 h-8" />,
      title: 'Central Hub',
      description: 'Unified access point for all CODAI applications',
      status: 'active' as const
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: 'Service Integration',
      description: 'Seamless integration across all ecosystem services',
      status: 'active' as const
    },
    {
      icon: <Link className="w-8 h-8" />,
      title: 'API Gateway',
      description: 'Centralized API management and routing',
      status: 'active' as const
    },
    {
      icon: <Command className="w-8 h-8" />,
      title: 'Quick Actions',
      description: 'Fast access to frequently used functions',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="HUB"
      appTagline="CODAI Ecosystem Hub"
      appDescription="Your central command center for the entire CODAI ecosystem with unified access, service integration, and management tools."
      features={features}
      brandColor="purple"
    />
  )
}
