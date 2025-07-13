export interface MobileStats {
  totalItems: number
  activeUsers: number
  efficiency: number
  performance: number
  processingSpeed: number
  uptime: number
}

export interface MobileFeature {
  id: string
  title: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  icon: string
  progress: number
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
}