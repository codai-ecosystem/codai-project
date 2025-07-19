'use client'

import { AppRouting } from '@codai/shared-ui'
import { Palette, Brush, Layers, Sparkles, Image, Wand2 } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'AI Design Studio',
      description: 'Intelligent design creation with AI-powered creative tools',
      status: 'active' as const
    },
    {
      icon: <Brush className="w-8 h-8" />,
      title: 'Creative Generation',
      description: 'Automated graphic design and visual content creation',
      status: 'active' as const
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: 'Template Library',
      description: 'Extensive collection of customizable design templates',
      status: 'active' as const
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Style Enhancement',
      description: 'AI-driven style suggestions and design optimization',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="FABRICAI"
      appTagline="AI-Powered Creative Design Studio"
      appDescription="Transform your creative vision with intelligent design tools, automated content generation, and AI-enhanced creative workflows."
      features={features}
      brandColor="violet"
    />
  )
}
