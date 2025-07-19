'use client'

import { AppRouting } from '@codai/shared-ui'
import { Heart, Gift, Users, HandHeart, Coins, Target } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Donation Management',
      description: 'AI-powered fundraising and donation campaign optimization',
      status: 'active' as const
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: 'Charity Platform',
      description: 'Comprehensive platform for charitable organizations',
      status: 'active' as const
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Building',
      description: 'Connect donors and causes with intelligent matching',
      status: 'active' as const
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Impact Tracking',
      description: 'Real-time tracking of donation impact and outcomes',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="DONAI"
      appTagline="AI-Powered Donation & Fundraising Platform"
      appDescription="Transform charitable giving with intelligent donation management, optimized fundraising campaigns, and comprehensive impact tracking."
      features={features}
      brandColor="rose"
    />
  )
}
