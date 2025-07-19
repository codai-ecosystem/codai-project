'use client'

import { AppRouting } from '@codai/shared-ui'
import { GraduationCap, BookOpen, Brain, Users, Target, Award } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: 'AI Learning Platform',
      description: 'Personalized education with adaptive learning algorithms',
      status: 'active' as const
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Cognitive Enhancement',
      description: 'Advanced learning techniques and memory optimization',
      status: 'active' as const
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Course Management',
      description: 'Comprehensive course creation and progress tracking',
      status: 'active' as const
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Achievement System',
      description: 'Gamified learning with certificates and milestones',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="STUDIAI"
      appTagline="AI-Powered Learning Platform"
      appDescription="Transform your education with personalized learning, adaptive algorithms, and comprehensive course management for optimal learning outcomes."
      features={features}
      brandColor="indigo"
    />
  )
}
