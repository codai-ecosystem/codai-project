'use client'

import { AppRouting } from '@codai/shared-ui'
import { Users, Wrench, Brain, Calendar, CheckSquare, MessageSquare } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Assistant',
      description: 'Intelligent personal assistant for enhanced productivity',
      status: 'active' as const
    },
    {
      icon: <CheckSquare className="w-8 h-8" />,
      title: 'Task Management',
      description: 'Smart task organization and priority optimization',
      status: 'active' as const
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Schedule Optimization',
      description: 'AI-powered calendar management and meeting scheduling',
      status: 'active' as const
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Communication Hub',
      description: 'Centralized communication and collaboration tools',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="AIDE"
      appTagline="AI-Powered Personal Assistant"
      appDescription="Transform your productivity with intelligent task management, automated scheduling, and comprehensive personal assistance."
      features={features}
      brandColor="blue"
    />
  )
}
