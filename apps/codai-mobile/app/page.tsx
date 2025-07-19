'use client'

import { AppRouting } from '@codai/shared-ui'
import { Smartphone, Code, Bot, Zap, TouchIcon as Touch, Download } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile Development',
      description: 'AI-powered mobile app development on the go',
      status: 'active' as const
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'Mobile AI Assistant',
      description: 'Code assistance optimized for mobile interfaces',
      status: 'active' as const
    },
    {
      icon: <Touch className="w-8 h-8" />,
      title: 'Touch-Optimized',
      description: 'Intuitive touch interface for mobile coding',
      status: 'active' as const
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: 'Offline Support',
      description: 'Continue coding even without internet connection',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="CODAI-MOBILE"
      appTagline="Mobile AI Development"
      appDescription="AI-powered development platform optimized for mobile devices with touch interfaces and offline capabilities."
      features={features}
      brandColor="indigo"
    />
  )
}
