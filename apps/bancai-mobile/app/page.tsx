'use client'

import { AppRouting } from '@codai/shared-ui'
import { Smartphone, CreditCard, PiggyBank, TrendingUp, Shield, Banknote } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile Banking',
      description: 'Complete mobile banking experience with touch optimization',
      status: 'active' as const
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Mobile Payments',
      description: 'Secure mobile payments and contactless transactions',
      status: 'active' as const
    },
    {
      icon: <PiggyBank className="w-8 h-8" />,
      title: 'Savings Management',
      description: 'Mobile-first savings goals and financial planning',
      status: 'active' as const
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Mobile Security',
      description: 'Advanced mobile security with biometric authentication',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="BANCAI-MOBILE"
      appTagline="Mobile Banking Platform"
      appDescription="Advanced mobile banking with AI-powered financial insights, secure payments, and comprehensive mobile-first banking experience."
      features={features}
      brandColor="green"
    />
  )
}
