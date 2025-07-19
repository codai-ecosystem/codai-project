'use client'

import { AppRouting } from '@codai/shared-ui'
import { Share2, Heart, MessageCircle, Users, TrendingUp, Calendar } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Share2 className="w-8 h-8" />,
      title: 'Social Media Management',
      description: 'AI-powered social media scheduling and content optimization',
      status: 'active' as const
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Engagement Analytics',
      description: 'Advanced engagement tracking and audience insights',
      status: 'active' as const
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Community Management',
      description: 'Intelligent community building and interaction management',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Viral Content Creation',
      description: 'AI-driven content creation for maximum social impact',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="SOCIAI"
      appTagline="AI-Powered Social Media Management"
      appDescription="Transform your social media presence with intelligent content creation, automated scheduling, and comprehensive engagement analytics."
      features={features}
      brandColor="pink"
    />
  )
}
