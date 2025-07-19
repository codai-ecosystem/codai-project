'use client'

import { AppRouting } from '@codai/shared-ui'
import { MessageSquare, Phone, Video, Bot, Users, Globe } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Intelligent Messaging',
      description: 'AI-powered chat and messaging with smart conversations',
      status: 'active' as const
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'Conversational AI',
      description: 'Advanced chatbots and virtual assistants',
      status: 'active' as const
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Video Conferencing',
      description: 'Seamless video calls with AI-enhanced features',
      status: 'active' as const
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multi-Language Support',
      description: 'Real-time translation and global communication',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="CONVERSAI"
      appTagline="AI-Powered Communication Platform"
      appDescription="Transform your communications with intelligent messaging, advanced chatbots, and seamless multi-language conversations."
      features={features}
      brandColor="cyan"
    />
  )
}
