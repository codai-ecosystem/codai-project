'use client'

import { AppRouting } from '@codai/shared-ui'
import { User, Shield, Key, Fingerprint, Lock, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <User className="w-8 h-8" />,
      title: 'Identity Management',
      description: 'Comprehensive digital identity and profile management',
      status: 'active' as const
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Security & Authentication',
      description: 'Multi-factor authentication and security protocols',
      status: 'active' as const
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: 'Access Control',
      description: 'Fine-grained permissions and access management',
      status: 'active' as const
    },
    {
      icon: <Fingerprint className="w-8 h-8" />,
      title: 'Biometric Security',
      description: 'Advanced biometric authentication methods',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="ID"
      appTagline="Digital Identity Platform"
      appDescription="Secure digital identity management with advanced authentication, access control, and biometric security for the modern enterprise."
      features={features}
      brandColor="blue"
    />
  )
}
