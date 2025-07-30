export interface AppStats {
  totalUsers: number
  activeNow: number
  performance: number
  uptime: number
  dataProcessed: number
  efficiency: number
  responseTime: number
  throughput: number
}

export interface FeatureData {
  id: string
  title: string
  description: string
  icon: string
  status: 'active' | 'inactive' | 'pending'
  progress: number
  color: string
}

export interface LiveMetric {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  color: string
}

// Banking types
export interface Account {
  id: string
  userId: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  status: 'active' | 'inactive' | 'frozen'
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  accountId: string
  amount: number
  currency: string
  type: 'debit' | 'credit'
  category: string
  description: string
  merchantName?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  createdAt: Date
  processedAt?: Date
  metadata?: Record<string, any>
}

export interface PaymentMethod {
  id: string
  userId: string
  type: 'card' | 'bank_account' | 'digital_wallet'
  provider: string
  last4: string
  expiryMonth?: number
  expiryYear?: number
  status: 'active' | 'inactive' | 'expired'
  isDefault: boolean
  createdAt: Date
}