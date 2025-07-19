// Core service exports for @codai/bancai
export * from './services/BancaiService'
export * from './types'

// Default configuration
export const DEFAULT_BANCAI_CONFIG = {
  providers: {
    stripe: {
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      apiVersion: '2023-10-16'
    }
  },
  currencies: {
    primary: 'USD' as const,
    supported: ['USD', 'EUR', 'GBP', 'RON'] as const,
    autoConversion: true
  },
  fraud: {
    enabled: true,
    threshold: 0.7,
    autoDecline: false,
    reviewQueue: true
  },
  compliance: {
    pci: true,
    gdpr: true,
    kyc: false,
    aml: false
  },
  features: {
    subscriptions: true,
    invoicing: true,
    marketplace: false,
    connect: false
  }
}

// Export main service
export { BancaiService, createBancaiService } from './services/BancaiService'
