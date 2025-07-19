'use client'

import { AppRouting } from '@codai/shared-ui'
import { Megaphone, PenTool, Share2, Globe, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Megaphone className="w-8 h-8" />,
      title: 'Public Relations',
      description: 'AI-powered PR campaigns and media relationship management',
      status: 'active' as const
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: 'Content Creation',
      description: 'Intelligent content generation and brand storytelling',
      status: 'active' as const
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: 'Media Distribution',
      description: 'Automated press release and content distribution',
      status: 'active' as const
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Reputation Management',
      description: 'Real-time brand monitoring and crisis management',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="PUBLICAI"
      appTagline="AI-Powered Public Relations Platform"
      appDescription="Transform your public relations with intelligent PR campaigns, automated content creation, and comprehensive brand reputation management."
      features={features}
      brandColor="red"
    />
  )
}
