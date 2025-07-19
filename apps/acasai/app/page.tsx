'use client'

import { AppRouting } from '@codai/shared-ui'
import { Home, Shield, Wifi, Zap, Users, Settings, Activity } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Smart Home Control',
      description: 'Complete control over your smart home devices with AI automation',
      status: 'active' as const
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'AI-Powered Automation',
      description: 'Intelligent automation that learns your habits and preferences',
      status: 'active' as const
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Advanced Security',
      description: '24/7 security monitoring with AI threat detection',
      status: 'active' as const
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: 'IoT Integration',
      description: 'Seamless integration with all your smart devices',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="ACASAI"
      appTagline="Smart Home Intelligence Platform"
      appDescription="Transform your living space with AI-powered automation, intelligent security, and seamless device integration. Experience the future of smart home technology."
      features={features}
      brandColor="blue"
    />
  )
}