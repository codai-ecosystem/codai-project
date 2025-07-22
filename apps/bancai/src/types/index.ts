// Bancai Banking Platform Types

// Core Banking Types
export interface BankAccount {
  id: string
  accountNumber: string
  accountName: string
  balance: number
  currency: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  status: 'active' | 'inactive' | 'frozen'
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  accountId: string
  type: 'debit' | 'credit'
  amount: number
  currency: string
  description: string
  category: string
  date: Date
  status: 'completed' | 'pending' | 'failed'
  reference?: string
  merchantName?: string
  location?: string
}

export interface Transfer {
  id: string
  fromAccountId: string
  toAccountId?: string
  toExternalAccount?: ExternalAccount
  amount: number
  currency: string
  description: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  scheduledDate?: Date
  executedDate?: Date
  fees: number
  exchangeRate?: number
}

export interface TransferRequest {
  fromAccountId: string
  toAccountId?: string
  toExternalAccount?: {
    accountNumber: string
    bankName: string
    bankCode: string
    accountHolderName: string
    country: string
  }
  amount: number
  currency: string
  description: string
  scheduledDate?: Date
}

export interface TransactionFilters {
  accountId?: string
  type?: 'debit' | 'credit'
  category?: string
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
  status?: 'completed' | 'pending' | 'failed'
  search?: string
}

export interface ExternalAccount {
  id: string
  accountNumber: string
  bankName: string
  bankCode: string
  accountHolderName: string
  country: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'digital_wallet'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  status: 'active' | 'inactive'
}

export interface FinancialInsight {
  id: string
  type: 'spending_trend' | 'saving_opportunity' | 'budget_alert' | 'investment_suggestion'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  metadata: Record<string, any>
  createdAt: Date
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: Date
  address?: Address
  kycStatus: 'pending' | 'verified' | 'rejected'
  twoFactorEnabled: boolean
  preferredCurrency: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Notification {
  id: string
  userId: string
  type: 'transaction' | 'security' | 'account' | 'promotion'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

// API Response Types
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Service Configuration
export interface BankingServiceConfig {
  apiUrl: string
  stripePublicKey: string
  enableSandbox: boolean
  defaultCurrency: string
}

// State Management Types  
export interface BancaiState {
  user: User | null
  accounts: BankAccount[]
  transactions: Transaction[]
  transfers: Transfer[]
  notifications: Notification[]
  insights: FinancialInsight[]
  isLoading: boolean
  error: string | null
}

// Legacy Common Types (for compatibility)
export interface AppConfig {
  name: string;
  version: string;
  description: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}