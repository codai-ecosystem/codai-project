'use client'

import { AppRouting } from '@codai/shared-ui'
import { Presentation, Slideshow, BarChart3, Users, Monitor, FileText } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Presentation className="w-8 h-8" />,
      title: 'AI Presentation Builder',
      description: 'Intelligent slide creation with automated design and content',
      status: 'active' as const
    },
    {
      icon: <Slideshow className="w-8 h-8" />,
      title: 'Interactive Presentations',
      description: 'Dynamic presentations with real-time audience engagement',
      status: 'active' as const
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Data Visualization',
      description: 'Automated charts and graphs from raw data',
      status: 'active' as const
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: 'Live Streaming',
      description: 'Professional presentation broadcasting and recording',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="PREZENTAI"
      appTagline="AI-Powered Presentation Platform"
      appDescription="Transform your presentations with intelligent slide creation, automated design, and interactive audience engagement features."
      features={features}
      brandColor="teal"
    />
  )
}
