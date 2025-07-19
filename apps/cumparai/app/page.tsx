'use client'

import { AppRouting } from '@codai/shared-ui'
import { ShoppingBag, CreditCard, Star, Search, Truck, Percent } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Smart Shopping',
      description: 'AI-powered product discovery and intelligent recommendations',
      status: 'active' as const
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Price Comparison',
      description: 'Real-time price tracking and best deal identification',
      status: 'active' as const
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Review Analysis',
      description: 'AI analysis of product reviews and ratings',
      status: 'active' as const
    },
    {
      icon: <Percent className="w-8 h-8" />,
      title: 'Deal Alerts',
      description: 'Automated alerts for price drops and special offers',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="CUMPARAI"
      appTagline="AI-Powered Smart Shopping Platform"
      appDescription="Transform your shopping experience with intelligent product discovery, automated price comparison, and personalized deal recommendations."
      features={features}
      brandColor="lime"
    />
  )
}
