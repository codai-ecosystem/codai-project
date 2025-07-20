/**
 * BancaiService - Universal Financial Services Integration
 * 
 * Main service class that orchestrates all BANCAI functionality:
 * - Payment processing (Stripe, PayPal, etc.)
 * - Transaction management
 * - Subscription handling
 * - Financial analytics and reporting
 * - Fraud detection
 * - Multi-currency support
 * - Compliance reporting
 */

import { EventEmitter } from 'events'
import Stripe from 'stripe'
import type {
  BancaiConfig,
  Money,
  Currency,
  PaymentIntent,
  PaymentMethod,
  Transaction,
  Customer,
  Subscription,
  Invoice,
  FinancialMetrics,
  PaymentAnalytics,
  BancaiResponse,
  RiskAssessment,
  ExchangeRate
} from '../types'
import { PaymentService, TransactionService, SubscriptionService, CustomerService, FraudService, AnalyticsService, CurrencyService } from './index'

export class BancaiService extends EventEmitter {
  private static instance: BancaiService
  private config: BancaiConfig
  private _isInitialized = false

  // Core Services
  public readonly payments: PaymentService
  public readonly transactions: TransactionService
  public readonly subscriptions: SubscriptionService
  public readonly customers: CustomerService
  public readonly fraud: FraudService
  public readonly analytics: AnalyticsService
  public readonly currency: CurrencyService

  // Provider Instances
  private stripe?: Stripe

  private constructor(config: BancaiConfig) {
    super()
    this.config = config

    // Initialize services
    this.payments = new PaymentService(this)
    this.transactions = new TransactionService(this)
    this.subscriptions = new SubscriptionService(this)
    this.customers = new CustomerService(this)
    this.fraud = new FraudService(this)
    this.analytics = new AnalyticsService(this)
    this.currency = new CurrencyService(this)

    this.setMaxListeners(50)
  }

  static getInstance(config?: BancaiConfig): BancaiService {
    if (!BancaiService.instance) {
      if (!config) {
        throw new Error('BancaiService configuration required for first initialization')
      }
      BancaiService.instance = new BancaiService(config)
    }
    return BancaiService.instance
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) return

    try {
      console.log('🏦 Initializing BancaiService...')

      // Initialize payment providers
      await this.initializeProviders()

      // Initialize core services
      await Promise.all([
        this.payments.initialize(),
        this.transactions.initialize(),
        this.subscriptions.initialize(),
        this.customers.initialize(),
        this.fraud.initialize(),
        this.analytics.initialize(),
        this.currency.initialize()
      ])

      this._isInitialized = true
      this.emit('initialized', { service: 'bancai', timestamp: new Date() })

      console.log('✅ BancaiService initialized successfully')
    } catch (error) {
      console.error('❌ BancaiService initialization failed:', error)
      this.emit('error', { service: 'bancai', error, operation: 'initialize' })
      throw error
    }
  }

  private async initializeProviders(): Promise<void> {
    // Initialize Stripe
    if (this.config.providers.stripe) {
      this.stripe = new Stripe(this.config.providers.stripe.secretKey, {
        apiVersion: this.config.providers.stripe.apiVersion as any,
      })
      console.log('🔷 Stripe provider initialized')
    }

    // Initialize other providers (PayPal, Square, etc.)
    // TODO: Add other payment provider initializations
  }

  // Payment Methods
  async createPaymentIntent(params: {
    amount: number
    currency: Currency
    customerId?: string
    paymentMethodId?: string
    description?: string
    metadata?: Record<string, any>
    confirmationMethod?: 'automatic' | 'manual'
    captureMethod?: 'automatic' | 'manual'
  }): Promise<BancaiResponse<PaymentIntent>> {
    return this.payments.createPaymentIntent(params)
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<BancaiResponse<PaymentIntent>> {
    return this.payments.confirmPaymentIntent(paymentIntentId, paymentMethodId)
  }

  async capturePaymentIntent(
    paymentIntentId: string,
    amountToCapture?: number
  ): Promise<BancaiResponse<PaymentIntent>> {
    return this.payments.capturePaymentIntent(paymentIntentId, amountToCapture)
  }

  async createRefund(params: {
    transactionId: string
    amount?: number
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
    metadata?: Record<string, any>
  }): Promise<BancaiResponse<any>> {
    return this.payments.createRefund(params)
  }

  // Customer Management
  async createCustomer(params: {
    email?: string
    name?: string
    phone?: string
    description?: string
    metadata?: Record<string, any>
  }): Promise<BancaiResponse<Customer>> {
    return this.customers.createCustomer(params)
  }

  async updateCustomer(
    customerId: string,
    updates: Partial<Customer>
  ): Promise<BancaiResponse<Customer>> {
    return this.customers.updateCustomer(customerId, updates)
  }

  async getCustomer(customerId: string): Promise<BancaiResponse<Customer>> {
    return this.customers.getCustomer(customerId)
  }

  async deleteCustomer(customerId: string): Promise<BancaiResponse<void>> {
    return this.customers.deleteCustomer(customerId)
  }

  // Payment Method Management
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<BancaiResponse<PaymentMethod>> {
    return this.payments.attachPaymentMethod(paymentMethodId, customerId)
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<BancaiResponse<PaymentMethod>> {
    return this.payments.detachPaymentMethod(paymentMethodId)
  }

  async listPaymentMethods(
    customerId: string,
    type?: 'card' | 'bank_account'
  ): Promise<BancaiResponse<PaymentMethod[]>> {
    return this.payments.listPaymentMethods(customerId, type)
  }

  // Subscription Management
  async createSubscription(params: {
    customerId: string
    priceId: string
    quantity?: number
    trialEnd?: Date
    defaultPaymentMethod?: string
    metadata?: Record<string, any>
  }): Promise<BancaiResponse<Subscription>> {
    return this.subscriptions.createSubscription(params)
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<BancaiResponse<Subscription>> {
    return this.subscriptions.updateSubscription(subscriptionId, updates)
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAt?: Date
  ): Promise<BancaiResponse<Subscription>> {
    return this.subscriptions.cancelSubscription(subscriptionId, cancelAt)
  }

  async getSubscription(subscriptionId: string): Promise<BancaiResponse<Subscription>> {
    return this.subscriptions.getSubscription(subscriptionId)
  }

  // Transaction Management
  async getTransaction(transactionId: string): Promise<BancaiResponse<Transaction>> {
    return this.transactions.getTransaction(transactionId)
  }

  async listTransactions(params: {
    customerId?: string
    status?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<BancaiResponse<Transaction[]>> {
    return this.transactions.listTransactions(params)
  }

  // Financial Analytics
  async getFinancialMetrics(params: {
    startDate: Date
    endDate: Date
    currency?: Currency
    breakdown?: 'day' | 'week' | 'month'
  }): Promise<BancaiResponse<FinancialMetrics>> {
    return this.analytics.getFinancialMetrics(params)
  }

  async getPaymentAnalytics(params: {
    startDate: Date
    endDate: Date
    filters?: Record<string, any>
  }): Promise<BancaiResponse<PaymentAnalytics>> {
    return this.analytics.getPaymentAnalytics(params)
  }

  // Fraud Detection
  async assessRisk(transactionData: {
    amount: Money
    customerId?: string
    paymentMethodId?: string
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, any>
  }): Promise<BancaiResponse<RiskAssessment>> {
    return this.fraud.assessRisk(transactionData)
  }

  // Currency Services
  async convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<BancaiResponse<{ convertedAmount: number; rate: ExchangeRate }>> {
    return this.currency.convert(amount, fromCurrency, toCurrency)
  }

  async getExchangeRates(baseCurrency?: Currency): Promise<BancaiResponse<ExchangeRate[]>> {
    return this.currency.getExchangeRates(baseCurrency)
  }

  // Webhook Handling
  constructEvent(payload: string, signature: string, secret: string): any {
    if (this.stripe) {
      return this.stripe.webhooks.constructEvent(payload, signature, secret)
    }
    throw new Error('Stripe not initialized')
  }

  async handleWebhook(event: any): Promise<void> {
    try {
      console.log(`📨 Handling webhook: ${event.type}`)

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object)
          break
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object)
          break
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object)
          break
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object)
          break
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object)
          break
        default:
          console.log(`⚠️ Unhandled webhook event type: ${event.type}`)
      }

      this.emit('webhook', { type: event.type, data: event.data })
    } catch (error) {
      console.error('❌ Webhook handling error:', error)
      this.emit('error', { service: 'bancai', error, operation: 'webhook' })
      throw error
    }
  }

  private async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    // Update transaction status
    await this.transactions.updateTransactionStatus(paymentIntent.id, 'succeeded')

    // Trigger analytics update
    this.emit('payment.succeeded', { paymentIntent })
  }

  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    // Update transaction status
    await this.transactions.updateTransactionStatus(paymentIntent.id, 'failed')

    // Trigger fraud analysis
    await this.fraud.analyzeFailed
  }

  private async handleSubscriptionCreated(subscription: any): Promise<void> {
    // Store subscription data
    await this.subscriptions.storeSubscription(subscription)

    this.emit('subscription.created', { subscription })
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    // Update subscription data
    await this.subscriptions.updateStoredSubscription(subscription.id, subscription)

    this.emit('subscription.updated', { subscription })
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    // Mark subscription as deleted
    await this.subscriptions.markSubscriptionDeleted(subscription.id)

    this.emit('subscription.deleted', { subscription })
  }

  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    // Process successful invoice payment
    this.emit('invoice.payment_succeeded', { invoice })
  }

  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    // Handle failed invoice payment
    this.emit('invoice.payment_failed', { invoice })
  }

  // Health and Status
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    services: Record<string, boolean>
    providers: Record<string, boolean>
    lastCheck: Date
  }> {
    const services = {
      payments: await this.payments.healthCheck(),
      transactions: await this.transactions.healthCheck(),
      subscriptions: await this.subscriptions.healthCheck(),
      customers: await this.customers.healthCheck(),
      fraud: await this.fraud.healthCheck(),
      analytics: await this.analytics.healthCheck(),
      currency: await this.currency.healthCheck()
    }

    const providers = {
      stripe: !!this.stripe && await this.testStripeConnection()
    }

    const allHealthy = Object.values(services).every(Boolean) && Object.values(providers).every(Boolean)
    const someHealthy = Object.values(services).some(Boolean) || Object.values(providers).some(Boolean)

    return {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      services,
      providers,
      lastCheck: new Date()
    }
  }

  private async testStripeConnection(): Promise<boolean> {
    try {
      if (!this.stripe) return false
      await this.stripe.balance.retrieve()
      return true
    } catch (error) {
      console.error('Stripe connection test failed:', error)
      return false
    }
  }

  // Utility Methods
  getConfig(): BancaiConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<BancaiConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  isInitialized(): boolean {
    return this._isInitialized
  }

  getStripeInstance(): Stripe | undefined {
    return this.stripe
  }
}

// Export singleton instance factory
export const createBancaiService = (config: BancaiConfig): BancaiService => {
  return BancaiService.getInstance(config)
}

export default BancaiService
