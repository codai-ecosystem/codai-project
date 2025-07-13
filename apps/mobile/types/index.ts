export interface MobileStats {
  totalItems: number
  activeUsers: number
  efficiency: number
  performance: number
  processingSpeed: number
  uptime: number
}

import { LucideIcon } from 'lucide-react'

export interface MobileFeature {
  id: string
  title: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  icon: LucideIcon
  progress: number
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
}