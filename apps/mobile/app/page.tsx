'use client'

import { AppRouting } from '@codai/shared-ui'
import { Smartphone, Wifi, Battery, Download, Share, Zap } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile Experience',
      description: 'Optimized mobile interface and native app experience',
      status: 'active' as const
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: 'App Distribution',
      description: 'Mobile app deployment and distribution platform',
      status: 'active' as const
    },
    {
      icon: <Share className="w-8 h-8" />,
      title: 'Cross-Platform',
      description: 'Seamless experience across all mobile platforms',
      status: 'active' as const
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Performance',
      description: 'Optimized for mobile performance and battery life',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="MOBILE"
      appTagline="Mobile Platform Hub"
      appDescription="Complete mobile platform solution with optimized interfaces, app distribution, and cross-platform compatibility."
      features={features}
      brandColor="pink"
    />
  )
}
