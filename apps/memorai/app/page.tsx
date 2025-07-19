'use client'

import { AppRouting } from '@codai/shared-ui'
import { Brain, Database, Search, BookOpen, Users, Lightbulb } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Memory Enhancement',
      description: 'Advanced AI algorithms to boost your cognitive memory capabilities',
      status: 'active' as const
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Knowledge Storage',
      description: 'Secure and organized storage for all your important memories and data',
      status: 'active' as const
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Smart Search',
      description: 'Intelligent search through your memories with AI-powered indexing',
      status: 'active' as const
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Learning Optimization',
      description: 'Personalized learning paths to enhance memory retention',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="MEMORAI"
      appTagline="AI-Powered Memory Enhancement Platform"
      appDescription="Transform your cognitive abilities with AI-driven memory enhancement, intelligent knowledge storage, and personalized learning optimization."
      features={features}
      brandColor="purple"
    />
  )
}
