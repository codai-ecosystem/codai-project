'use client'

import { AppRouting } from '@codai/shared-ui'
import { Shield, Users, Settings, Database, Lock, Activity } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'System Administration',
      description: 'Complete system control and user management',
      status: 'active' as const
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'User Management',
      description: 'Advanced user roles, permissions, and access control',
      status: 'active' as const
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Data Management',
      description: 'Comprehensive data oversight and backup systems',
      status: 'active' as const
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'System Monitoring',
      description: 'Real-time system health and performance monitoring',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="ADMIN"
      appTagline="System Administration Center"
      appDescription="Comprehensive system administration with user management, security controls, and monitoring for enterprise-grade operations."
      features={features}
      brandColor="red"
    />
  )
}
