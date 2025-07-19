'use client'

import { LandingPage } from '@codai/shared-ui'
import { Music, Play, Headphones, Mic, Users, Sparkles } from 'lucide-react'

'use client'

import { AppRouting } from '@codai/shared-ui'
import { Music, Headphones, Mic, Radio, PlayCircle, Volume2 } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Music className="w-8 h-8" />,
      title: 'AI Music Creation',
      description: 'Intelligent music composition and AI-generated soundtracks',
      status: 'active' as const
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Audio Processing',
      description: 'Advanced audio editing and enhancement capabilities',
      status: 'active' as const
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: 'Voice Synthesis',
      description: 'AI-powered voice generation and vocal processing',
      status: 'active' as const
    },
    {
      icon: <Radio className="w-8 h-8" />,
      title: 'Music Distribution',
      description: 'Seamless publishing and streaming platform integration',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="MUZICAI"
      appTagline="AI-Powered Music Creation Platform"
      appDescription="Transform your musical creativity with intelligent composition tools, advanced audio processing, and AI-enhanced music production workflows."
      features={features}
      brandColor="amber"
    />
  )
}