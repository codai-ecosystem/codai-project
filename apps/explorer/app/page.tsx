'use client'

import { AppRouting } from '@codai/shared-ui'
import { Search, Compass, Map, FolderOpen, Eye, Filter } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Advanced Search',
      description: 'Powerful search capabilities across all data sources',
      status: 'active' as const
    },
    {
      icon: <Compass className="w-8 h-8" />,
      title: 'Data Discovery',
      description: 'Explore and discover insights in your data',
      status: 'active' as const
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: 'Visual Navigation',
      description: 'Interactive maps and visual data exploration',
      status: 'active' as const
    },
    {
      icon: <FolderOpen className="w-8 h-8" />,
      title: 'File Management',
      description: 'Organize and manage files with smart categorization',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="EXPLORER"
      appTagline="Data Discovery Platform"
      appDescription="Explore, discover, and navigate your data with powerful search capabilities, visual tools, and intelligent file management."
      features={features}
      brandColor="emerald"
    />
  )
}
