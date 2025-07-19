'use client'

import { AppRouting } from '@codai/shared-ui'
import { Package, BarChart3, TrendingUp, Warehouse, AlertCircle, ShoppingCart } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Inventory Management',
      description: 'AI-powered stock tracking and automated inventory control',
      status: 'active' as const
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Real-time insights and predictive stock analytics',
      status: 'active' as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Demand Forecasting',
      description: 'AI-driven demand prediction and optimization',
      status: 'active' as const
    },
    {
      icon: <Warehouse className="w-8 h-8" />,
      title: 'Warehouse Integration',
      description: 'Seamless integration with warehouse management systems',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="STOCAI"
      appTagline="AI-Powered Inventory Management"
      appDescription="Transform your inventory management with intelligent stock tracking, demand forecasting, and automated supply chain optimization."
      features={features}
      brandColor="blue"
    />
  )
}
