'use client'

import { AppRouting } from '@codai/shared-ui'
import { Target, TrendingUp, Users, Mail, BarChart3, Megaphone } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Campaign Management',
      description: 'AI-powered marketing campaigns with automated optimization',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Performance Analytics',
      description: 'Real-time campaign performance and ROI tracking',
      status: 'active' as const
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Audience Targeting',
      description: 'Advanced customer segmentation and personalization',
      status: 'active' as const
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: 'Multi-Channel Marketing',
      description: 'Unified marketing across email, social, and digital channels',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="MARKETAI"
      appTagline="AI-Powered Marketing Automation"
      appDescription="Transform your marketing strategy with intelligent campaign management, advanced analytics, and automated customer engagement across all channels."
      features={features}
      brandColor="orange"
    />
  )
}
