'use client'

import { AppRouting } from '@codai/shared-ui'
import { HelpCircle, BookOpen, Users, MessageCircle, LifeBuoy, Phone } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <HelpCircle className="w-8 h-8" />,
      title: 'AI Help Desk',
      description: 'Intelligent customer support and automated assistance',
      status: 'active' as const
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Knowledge Base',
      description: 'Comprehensive documentation and self-service resources',
      status: 'active' as const
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Live Chat Support',
      description: 'Real-time customer support with AI enhancement',
      status: 'active' as const
    },
    {
      icon: <LifeBuoy className="w-8 h-8" />,
      title: 'Ticket Management',
      description: 'Automated ticket routing and resolution tracking',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="AJUTAI"
      appTagline="AI-Powered Customer Support Platform"
      appDescription="Transform your customer service with intelligent help desk automation, comprehensive knowledge management, and AI-enhanced support."
      features={features}
      brandColor="green"
    />
  )
}
