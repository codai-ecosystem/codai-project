'use client'

import { AppRouting } from '@codai/shared-ui'
import { ShoppingCart, CreditCard, Package, Truck, Star, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: 'E-Commerce Platform',
      description: 'AI-powered online store with intelligent product recommendations',
      status: 'active' as const
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Inventory Management',
      description: 'Smart inventory tracking and automated restocking',
      status: 'active' as const
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Order Fulfillment',
      description: 'Streamlined order processing and shipping optimization',
      status: 'active' as const
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Customer Experience',
      description: 'Personalized shopping experience with AI insights',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="CURTAI"
      appTagline="AI-Powered E-Commerce Platform"
      appDescription="Transform your online business with intelligent e-commerce solutions, automated inventory management, and personalized customer experiences."
      features={features}
      brandColor="emerald"
    />
  )
}
