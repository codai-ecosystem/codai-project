'use client'

import { AppRouting } from '@codai/shared-ui'
import { Settings, Wrench, Package, Puzzle, Code, Layers } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'System Modifications',
      description: 'Advanced system customization and modifications',
      status: 'active' as const
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Module Management',
      description: 'Install, manage, and configure system modules',
      status: 'active' as const
    },
    {
      icon: <Puzzle className="w-8 h-8" />,
      title: 'Plugin System',
      description: 'Extensible plugin architecture for custom functionality',
      status: 'active' as const
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Custom Scripts',
      description: 'Create and manage custom automation scripts',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="MOD"
      appTagline="System Modification Platform"
      appDescription="Powerful system modification tools with module management, plugin architecture, and custom scripting for advanced users."
      features={features}
      brandColor="amber"
    />
  )
}
