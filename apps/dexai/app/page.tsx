'use client'

import { AppRouting } from '@codai/shared-ui'
import { Zap, Users, Settings, BarChart3, Plus, Shield } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'AI-Powered',
      description: 'Advanced AI capabilities for decentralized AI automation',
      status: 'active' as const
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Collaboration',
      description: 'Built for teams and enterprise workflows',
      status: 'active' as const
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your data',
      status: 'active' as const
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics & Insights',
      description: 'Comprehensive analytics for AI performance optimization',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="DEXAI"
      appTagline="Decentralized AI Platform"
      appDescription="Advanced decentralized AI platform for distributed computing, team collaboration, and secure AI automation."
      features={features}
      brandColor="blue"
    />
  )
}
