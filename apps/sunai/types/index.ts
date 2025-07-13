export interface SunaiStats {
  totalItems: number
  activeUsers: number
  efficiency: number
  performance: number
  processingSpeed: number
  uptime: number
}

export interface SunaiFeature {
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