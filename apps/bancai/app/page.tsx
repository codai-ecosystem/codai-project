'use client'

import { AppRouting } from '@codai/shared-ui'
import { Wallet, CreditCard, TrendingUp, Shield, PiggyBank, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: 'Smart Banking',
      description: 'AI-powered financial management with intelligent insights',
      status: 'active' as const
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Digital Payments',
      description: 'Seamless payment processing with advanced security',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Investment Intelligence',
      description: 'AI-driven investment recommendations and portfolio optimization',
      status: 'active' as const
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Bank-Grade Security',
      description: 'Enterprise-level security with biometric authentication',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="BANCAI"
      appTagline="AI-Powered Smart Banking Platform"
      appDescription="Transform your financial future with intelligent banking, investment insights, and seamless digital payment solutions."
      features={features}
      brandColor="green"
    />
  )
}
