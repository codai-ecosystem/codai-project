'use client'

import { AppRouting } from '@codai/shared-ui'
import { Code, Bot, Cpu, Zap, Terminal, FileCode } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'AI Code Assistant',
      description: 'Intelligent code generation and programming assistance',
      status: 'active' as const
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Smart Development',
      description: 'AI-powered development tools and automation',
      status: 'active' as const
    },
    {
      icon: <Terminal className="w-8 h-8" />,
      title: 'Integrated Terminal',
      description: 'Full-featured development environment with terminal',
      status: 'active' as const
    },
    {
      icon: <FileCode className="w-8 h-8" />,
      title: 'Code Analysis',
      description: 'Advanced code analysis and optimization suggestions',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="CODAI"
      appTagline="AI-Powered Development Platform"
      appDescription="Revolutionary AI coding assistant with intelligent code generation, smart development tools, and comprehensive analysis capabilities."
      features={features}
      brandColor="blue"
    />
  )
}
