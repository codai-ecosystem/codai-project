'use client'

import { AppRouting } from '@codai/shared-ui'
import { Wrench, Settings, Hammer, Package, Cog, Cpu } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Developer Tools',
      description: 'Essential tools for developers and productivity',
      status: 'active' as const
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'System Configuration',
      description: 'Advanced system configuration and optimization',
      status: 'active' as const
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Utility Collection',
      description: 'Comprehensive collection of useful utilities',
      status: 'active' as const
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: 'Performance Tools',
      description: 'Monitor and optimize system performance',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="TOOLS"
      appTagline="Developer & System Tools"
      appDescription="Essential tools and utilities for developers, system administrators, and power users with advanced configuration options."
      features={features}
      brandColor="orange"
    />
  )
}
