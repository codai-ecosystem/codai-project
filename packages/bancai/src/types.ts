/**
 * BANCAI Financial Services Types
 * Comprehensive type definitions for payment processing, transactions, and financial analytics
 */

import { Decimal } from 'decimal.js'

// Core Financial Types
export interface Money {
  amount: Decimal
  currency: Currency
  formatted?: string
}

export type Currency =
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'RON' | 'CAD' | 'AUD'
  | 'CHF' | 'CNY' | 'SEK' | 'NOK' | 'MXN' | 'BRL' | 'ZAR'

export interface ExchangeRate {
  from: Currency
  to: Currency
  rate: Decimal
  timestamp: Date
  source: 'ECB' | 'FIXER' | 'OPENEXCHANGE' | 'COINBASE'
}

// Payment Processing
export interface PaymentProvider {
  id: string
  name: 'stripe' | 'paypal' | 'square' | 'adyen' | 'mollie'
  enabled: boolean
  config: Record<string, any>
  supportedCurrencies: Currency[]
  supportedCountries: string[]
}

export interface PaymentMethod {
  id: string
  customerId: string
  type: 'card' | 'bank_account' | 'digital_wallet' | 'crypto' | 'wire_transfer'
  brand?: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  fingerprint: string
  isDefault: boolean
  isVerified: boolean
  billingAddress?: Address
  metadata: Record<string, any>
  createdAt: Date
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface PaymentIntent {
  id: string
  amount: Money
  currency: Currency
  status: PaymentIntentStatus
  paymentMethod?: PaymentMethod
  customerId?: string
  description?: string
  receiptEmail?: string
  metadata: Record<string, any>
  clientSecret?: string
  confirmationMethod: 'automatic' | 'manual'
  captureMethod: 'automatic' | 'manual'
  setupFutureUsage?: 'on_session' | 'off_session'
  createdAt: Date
  updatedAt: Date
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded'

// Transaction Management
export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: Money
  currency: Currency
  originalAmount?: Money // for multi-currency transactions
  exchangeRate?: ExchangeRate
  customerId?: string
  merchantId?: string
  paymentMethodId?: string
  paymentIntentId?: string
  subscriptionId?: string
  invoiceId?: string
  description: string
  reference?: string
  tags: string[]
  metadata: Record<string, any>
  fees: TransactionFee[]
  netAmount: Money
  settlementDate?: Date
  refunds: Refund[]
  disputes: Dispute[]
  riskScore?: number
  fraudFlags: FraudFlag[]
  createdAt: Date
  updatedAt: Date
}

export type TransactionType =
  | 'payment' | 'refund' | 'chargeback' | 'fee'
  | 'transfer' | 'payout' | 'adjustment' | 'subscription'

export type TransactionStatus =
  | 'pending' | 'processing' | 'succeeded' | 'failed'
  | 'canceled' | 'disputed' | 'refunded' | 'partially_refunded'

export interface TransactionFee {
  type: 'processing' | 'gateway' | 'network' | 'interchange' | 'platform'
  amount: Money
  description: string
}

export interface Refund {
  id: string
  transactionId: string
  amount: Money
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'expired_uncaptured_charge'
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  metadata: Record<string, any>
  createdAt: Date
}

export interface Dispute {
  id: string
  transactionId: string
  amount: Money
  reason: DisputeReason
  status: DisputeStatus
  evidence?: DisputeEvidence
  evidenceDueBy?: Date
  createdAt: Date
  updatedAt: Date
}

export type DisputeReason =
  | 'duplicate' | 'fraudulent' | 'subscription_canceled'
  | 'product_unacceptable' | 'product_not_received' | 'unrecognized'
  | 'credit_not_processed' | 'general' | 'incorrect_account_details'

export type DisputeStatus =
  | 'warning_needs_response' | 'warning_under_review' | 'warning_closed'
  | 'needs_response' | 'under_review' | 'charge_refunded' | 'won' | 'lost'

export interface DisputeEvidence {
  accessActivityLog?: string
  billingAddress?: string
  cancellationPolicy?: string
  cancellationPolicyDisclosure?: string
  cancellationRebuttal?: string
  customerCommunication?: string
  customerEmailAddress?: string
  customerName?: string
  customerPurchaseIp?: string
  customerSignature?: string
  duplicateChargeDocumentation?: string
  duplicateChargeExplanation?: string
  duplicateChargeId?: string
  productDescription?: string
  receipt?: string
  refundPolicy?: string
  refundPolicyDisclosure?: string
  refundRefusalExplanation?: string
  serviceDate?: string
  serviceDocumentation?: string
  shippingAddress?: string
  shippingCarrier?: string
  shippingDate?: string
  shippingDocumentation?: string
  shippingTrackingNumber?: string
  uncategorizedFile?: string
  uncategorizedText?: string
}

// Subscription Management
export interface Subscription {
  id: string
  customerId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAt?: Date
  canceledAt?: Date
  endedAt?: Date
  trialStart?: Date
  trialEnd?: Date
  items: SubscriptionItem[]
  defaultPaymentMethod?: string
  latestInvoice?: string
  collectionMethod: 'charge_automatically' | 'send_invoice'
  daysUntilDue?: number
  metadata: Record<string, any>
  discounts: Discount[]
  totalAmount: Money
  taxAmount?: Money
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionStatus =
  | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active'
  | 'past_due' | 'canceled' | 'unpaid' | 'paused'

export interface SubscriptionItem {
  id: string
  subscriptionId: string
  priceId: string
  quantity: number
  price: Price
  metadata: Record<string, any>
}

export interface Price {
  id: string
  productId: string
  active: boolean
  currency: Currency
  type: 'one_time' | 'recurring'
  unitAmount?: number
  unitAmountDecimal?: string
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    intervalCount: number
    usageType: 'licensed' | 'metered'
    aggregateUsage?: 'sum' | 'last_during_period' | 'last_ever' | 'max'
  }
  tiers?: PriceTier[]
  tiersMode?: 'graduated' | 'volume'
  billingScheme: 'per_unit' | 'tiered'
  metadata: Record<string, any>
  createdAt: Date
}

export interface PriceTier {
  flatAmount?: number
  flatAmountDecimal?: string
  unitAmount?: number
  unitAmountDecimal?: string
  upTo?: number
}

export interface Product {
  id: string
  name: string
  description?: string
  active: boolean
  defaultPrice?: string
  features: string[]
  images: string[]
  metadata: Record<string, any>
  packageDimensions?: {
    height: number
    length: number
    weight: number
    width: number
  }
  shippable?: boolean
  statementDescriptor?: string
  unitLabel?: string
  url?: string
  createdAt: Date
  updatedAt: Date
}

export interface Discount {
  id: string
  couponId?: string
  promotionCodeId?: string
  customer?: string
  subscription?: string
  start: Date
  end?: Date
  coupon?: Coupon
}

export interface Coupon {
  id: string
  name?: string
  amountOff?: number
  currency?: Currency
  percentOff?: number
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths?: number
  maxRedemptions?: number
  timesRedeemed: number
  valid: boolean
  metadata: Record<string, any>
  createdAt: Date
}

// Invoice Management
export interface Invoice {
  id: string
  customerId: string
  subscriptionId?: string
  status: InvoiceStatus
  currency: Currency
  subtotal: Money
  total: Money
  amountDue: Money
  amountPaid: Money
  amountRemaining: Money
  tax?: Money
  discounts: Discount[]
  lines: InvoiceLine[]
  dueDate?: Date
  paidAt?: Date
  periodStart: Date
  periodEnd: Date
  attemptCount: number
  attempted: boolean
  autoAdvance?: boolean
  billingReason: BillingReason
  collectionMethod: 'charge_automatically' | 'send_invoice'
  webhookDeliveredAt?: Date
  hostedInvoiceUrl?: string
  invoicePdf?: string
  metadata: Record<string, any>
  createdAt: Date
}

export type InvoiceStatus =
  | 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'

export type BillingReason =
  | 'subscription_cycle' | 'subscription_create' | 'subscription_update'
  | 'subscription' | 'manual' | 'upcoming' | 'subscription_threshold'

export interface InvoiceLine {
  id: string
  type: 'invoiceitem' | 'subscription'
  amount: Money
  currency: Currency
  description: string
  period: {
    start: Date
    end: Date
  }
  proration: boolean
  quantity?: number
  subscription?: string
  subscriptionItem?: string
  metadata: Record<string, any>
}

// Customer Management
export interface Customer {
  id: string
  email?: string
  name?: string
  phone?: string
  description?: string
  address?: Address
  shipping?: {
    name: string
    address: Address
    phone?: string
  }
  paymentMethods: PaymentMethod[]
  defaultSource?: string
  invoicePrefix?: string
  invoiceSettings: {
    customFields: Array<{
      name: string
      value: string
    }>
    defaultPaymentMethod?: string
    footer?: string
  }
  livemode: boolean
  metadata: Record<string, any>
  balance: Money
  delinquent: boolean
  taxExempt?: 'none' | 'exempt' | 'reverse'
  taxIds: Array<{
    type: string
    value: string
    country?: string
    verified?: boolean
  }>
  createdAt: Date
  updatedAt: Date
}

// Fraud Detection
export interface FraudFlag {
  type: FraudFlagType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  source: string
  createdAt: Date
}

export type FraudFlagType =
  | 'velocity' | 'geolocation' | 'device_fingerprint' | 'behavioral'
  | 'email_reputation' | 'ip_reputation' | 'card_testing'
  | 'account_takeover' | 'synthetic_identity'

export interface RiskAssessment {
  transactionId: string
  overallScore: number
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  factors: RiskFactor[]
  recommendation: 'approve' | 'review' | 'decline'
  confidence: number
  modelVersion: string
  processedAt: Date
}

export interface RiskFactor {
  name: string
  score: number
  weight: number
  description: string
  category: 'identity' | 'behavior' | 'transaction' | 'device' | 'network'
}

// Analytics and Reporting
export interface FinancialMetrics {
  period: {
    start: Date
    end: Date
  }
  revenue: {
    total: Money
    recurring: Money
    oneTime: Money
    growth: number
  }
  transactions: {
    count: number
    volume: Money
    successRate: number
    averageValue: Money
  }
  customers: {
    total: number
    new: number
    churn: number
    retention: number
    ltv: Money
  }
  subscriptions: {
    active: number
    canceled: number
    mrr: Money
    arr: Money
    churnRate: number
  }
  refunds: {
    count: number
    amount: Money
    rate: number
  }
  disputes: {
    count: number
    amount: Money
    winRate: number
  }
  fees: {
    processing: Money
    platform: Money
    total: Money
  }
}

export interface PaymentAnalytics {
  conversionRate: number
  abandonment: {
    checkout: number
    payment: number
  }
  paymentMethods: Array<{
    method: string
    usage: number
    successRate: number
  }>
  currencies: Array<{
    currency: Currency
    volume: Money
    transactions: number
  }>
  countries: Array<{
    country: string
    volume: Money
    transactions: number
  }>
  declineReasons: Array<{
    reason: string
    count: number
    percentage: number
  }>
}

// Configuration and Settings
export interface BancaiConfig {
  providers: {
    stripe?: {
      publicKey: string
      secretKey: string
      webhookSecret: string
      apiVersion: string
    }
    paypal?: {
      clientId: string
      clientSecret: string
      environment: 'sandbox' | 'live'
    }
  }
  currencies: {
    primary: Currency
    supported: Currency[]
    autoConversion: boolean
  }
  fraud: {
    enabled: boolean
    threshold: number
    autoDecline: boolean
    reviewQueue: boolean
  }
  compliance: {
    pci: boolean
    gdpr: boolean
    kyc: boolean
    aml: boolean
  }
  features: {
    subscriptions: boolean
    invoicing: boolean
    marketplace: boolean
    connect: boolean
  }
}

// API Response Types
export interface BancaiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: Date
    requestId: string
  }
}

// Event Types for Webhooks
export interface BancaiEvent {
  id: string
  type: BancaiEventType
  data: Record<string, any>
  createdAt: Date
  livemode: boolean
  pendingWebhooks: number
  request?: {
    id: string
    idempotencyKey?: string
  }
}

export type BancaiEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_method.attached'
  | 'customer.created'
  | 'customer.updated'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.deleted'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
