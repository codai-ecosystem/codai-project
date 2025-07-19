'use client'

import { AppRouting } from '@codai/shared-ui'
import { Code, Terminal, GitBranch, Cpu, FileCode, Layers } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: 'AI Code Generation',
      description: 'Intelligent code creation and automated programming',
      status: 'active' as const
    },
    {
      icon: <Terminal className="w-8 h-8" />,
      title: 'Development Environment',
      description: 'Comprehensive IDE with AI-enhanced development tools',
      status: 'active' as const
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: 'Version Control',
      description: 'Advanced Git integration with intelligent merge resolution',
      status: 'active' as const
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: 'Code Optimization',
      description: 'AI-powered performance optimization and refactoring',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="KODEX"
      appTagline="AI-Powered Development Platform"
      appDescription="Transform your coding experience with intelligent code generation, automated development tools, and AI-enhanced programming workflows."
      features={features}
      brandColor="sky"
    />
  )
}
