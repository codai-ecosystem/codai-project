'use client'

import { AppRouting } from '@codai/shared-ui'
import { BookOpen, FileText, Search, Edit, Share, Archive } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Documentation Hub',
      description: 'Comprehensive documentation management and creation',
      status: 'active' as const
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Smart Search',
      description: 'AI-powered search across all documentation',
      status: 'active' as const
    },
    {
      icon: <Edit className="w-8 h-8" />,
      title: 'Collaborative Editing',
      description: 'Real-time collaborative document editing',
      status: 'active' as const
    },
    {
      icon: <Share className="w-8 h-8" />,
      title: 'Knowledge Sharing',
      description: 'Share knowledge and documentation across teams',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="DOCS"
      appTagline="Documentation Platform"
      appDescription="Advanced documentation platform with AI-powered search, collaborative editing, and comprehensive knowledge management."
      features={features}
      brandColor="slate"
    />
  )
}
