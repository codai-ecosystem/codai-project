'use client'

import { AppRouting } from '@codai/shared-ui'
import { Flag, MapPin, Users, Globe, BookOpen, Star } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Flag className="w-8 h-8" />,
      title: 'Romanian Market Intelligence',
      description: 'Comprehensive insights into Romanian business landscape',
      status: 'active' as const
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Local Business Network',
      description: 'Connect with Romanian businesses and opportunities',
      status: 'active' as const
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Cultural Integration',
      description: 'Navigate Romanian business culture and regulations',
      status: 'active' as const
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Legal Compliance',
      description: 'Romanian legal framework and compliance guidance',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="ROMAI"
      appTagline="Romanian Business Intelligence"
      appDescription="Your gateway to the Romanian market with comprehensive business intelligence, local insights, and cultural integration for successful operations."
      features={features}
      brandColor="red"
    />
  )
}
