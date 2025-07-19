'use client'

import { AppRouting } from '@codai/shared-ui'
import { X, Zap, Star, Rocket, Sparkles, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <X className="w-8 h-8" />,
      title: 'Experimental Platform',
      description: 'Cutting-edge features and experimental technologies',
      status: 'active' as const
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Beta Testing',
      description: 'Early access to new features and innovations',
      status: 'active' as const
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Innovation Lab',
      description: 'Research and development of next-gen solutions',
      status: 'active' as const
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Future Tech',
      description: 'Preview tomorrow\'s technology today',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="X"
      appTagline="Experimental Innovation Platform"
      appDescription="Explore the future of technology with cutting-edge experimental features, beta testing opportunities, and innovation labs."
      features={features}
      brandColor="violet"
    />
  )
}
