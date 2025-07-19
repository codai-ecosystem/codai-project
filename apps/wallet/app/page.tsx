'use client'

import { AppRouting } from '@codai/shared-ui'
import { Wallet, CreditCard, TrendingUp, Shield, DollarSign, PiggyBank } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: 'Digital Wallet',
      description: 'Secure digital wallet for all your financial needs',
      status: 'active' as const
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Payment Processing',
      description: 'Fast and secure payment processing worldwide',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Investment Tracking',
      description: 'Track investments and portfolio performance',
      status: 'active' as const
    },
    {
      icon: <PiggyBank className="w-8 h-8" />,
      title: 'Savings Management',
      description: 'Smart savings goals and automated transfers',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="WALLET"
      appTagline="Digital Financial Platform"
      appDescription="Complete digital wallet solution with secure payments, investment tracking, and smart savings management for modern finance."
      features={features}
      brandColor="green"
    />
  )
}
