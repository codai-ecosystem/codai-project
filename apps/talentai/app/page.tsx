'use client'

import React from 'react'

import { AppRouting } from '@codai/shared-ui'
import { Users, Search, TrendingUp, Award, Briefcase, Target } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Talent Discovery',
      description: 'AI-powered candidate sourcing and intelligent talent matching',
      status: 'active' as const
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'HR Management',
      description: 'Comprehensive employee lifecycle and performance management',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Performance Analytics',
      description: 'Data-driven insights for workforce optimization',
      status: 'active' as const
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Skills Development',
      description: 'Personalized learning paths and career advancement',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="TALENTAI"
      appTagline="AI-Driven Talent Acquisition & HR Management"
      appDescription="Transform your human resources with intelligent talent discovery, performance analytics, and automated HR processes for optimal workforce management."
      features={features}
      brandColor="purple"
    />
  )
}

