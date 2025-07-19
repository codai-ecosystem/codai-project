'use client'

import { AppRouting } from '@codai/shared-ui'
import { Gamepad2, Trophy, Users, Star, Target, Zap } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: 'Gaming Platform',
      description: 'Advanced gaming platform with AI-powered features',
      status: 'active' as const
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Achievements',
      description: 'Comprehensive achievement system and leaderboards',
      status: 'active' as const
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Multiplayer',
      description: 'Real-time multiplayer gaming experiences',
      status: 'active' as const
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Game Discovery',
      description: 'Discover new games with personalized recommendations',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="JUCAI"
      appTagline="AI-Powered Gaming Platform"
      appDescription="Revolutionary gaming platform with AI-enhanced gameplay, achievements, multiplayer experiences, and intelligent game discovery."
      features={features}
      brandColor="purple"
    />
  )
}
