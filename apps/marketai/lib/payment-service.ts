import Stripe from 'stripe';
import { ethers } from 'ethers';

interface PaymentConfig {
  stripeSecretKey: string;
  stripePublishableKey: string;
  webhookSecret: string;
  revenueShareContract?: string;
  privateKey?: string;
  infuraProjectId?: string;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  error?: string;
  transactionHash?: string;
}

interface RevenueShare {
  authorAmount: number;
  platformAmount: number;
  authorAddress?: string;
}

export class PaymentService {
  private stripe: Stripe;
  private config: PaymentConfig;
  private provider?: ethers.JsonRpcProvider;
  private wallet?: ethers.Wallet;

  constructor(config: PaymentConfig) {
    this.config = config;
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    // Initialize blockchain if configured
    if (config.infuraProjectId && config.privateKey) {
      this.provider = new ethers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/${config.infuraProjectId}`
      );
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  /**
   * Create a payment intent for purchasing an agent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Create a subscription for premium features
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata: Record<string, string> = {}
  ): Promise<PaymentResult> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

      return {
        success: true,
        paymentId: subscription.id,
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error) {
      console.error('Subscription creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed',
      };
    }
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createCustomer(email: string, name?: string): Promise<{ customerId?: string; error?: string }> {
    try {
      // Check if customer already exists
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return { customerId: existingCustomers.data[0].id };
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name,
      });

      return { customerId: customer.id };
    } catch (error) {
      console.error('Customer creation failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Customer creation failed',
      };
    }
  }

  /**
   * Process revenue sharing (80% to author, 20% to platform)
   */
  calculateRevenueShare(totalAmount: number): RevenueShare {
    const platformAmount = Math.round(totalAmount * 0.2 * 100) / 100; // 20% to platform
    const authorAmount = Math.round(totalAmount * 0.8 * 100) / 100;   // 80% to author

    return {
      authorAmount,
      platformAmount,
    };
  }

  /**
   * Transfer funds to agent author via Stripe Connect (if configured)
   */
  async transferToAuthor(
    amount: number,
    authorStripeAccountId: string,
    transferMetadata: Record<string, string> = {}
  ): Promise<PaymentResult> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        destination: authorStripeAccountId,
        metadata: transferMetadata,
      });

      return {
        success: true,
        paymentId: transfer.id,
      };
    } catch (error) {
      console.error('Transfer to author failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed',
      };
    }
  }

  /**
   * Process cryptocurrency payment (if blockchain is configured)
   */
  async processCryptoPayment(
    toAddress: string,
    amount: string, // Amount in ETH
    metadata: Record<string, any> = {}
  ): Promise<PaymentResult> {
    if (!this.wallet || !this.provider) {
      return {
        success: false,
        error: 'Blockchain not configured',
      };
    }

    try {
      const tx = await this.wallet.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount),
        data: ethers.toUtf8Bytes(JSON.stringify(metadata)),
      });

      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
      };
    } catch (error) {
      console.error('Crypto payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Crypto payment failed',
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
      return true;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(payload: string, signature: string): Promise<{ success: boolean; error?: string }> {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook handling failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook handling failed',
      };
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment succeeded:', paymentIntent.id);
    // TODO: Update database with successful payment
    // TODO: Trigger agent download availability
    // TODO: Send confirmation email
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment failed:', paymentIntent.id);
    // TODO: Update database with failed payment
    // TODO: Send failure notification
  }

  private async handleSubscriptionPayment(invoice: Stripe.Invoice): Promise<void> {
    console.log('Subscription payment succeeded:', invoice.id);
    // TODO: Update subscription status in database
    // TODO: Grant premium access
  }

  private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription cancelled:', subscription.id);
    // TODO: Update subscription status in database
    // TODO: Revoke premium access
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    topAgents: Array<{ agentId: string; revenue: number; transactions: number }>;
  }> {
    try {
      const charges = await this.stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
        limit: 100,
      });

      const totalRevenue = charges.data.reduce((sum, charge) => sum + charge.amount, 0) / 100;
      const totalTransactions = charges.data.length;
      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // TODO: Implement top agents calculation from database
      const topAgents: Array<{ agentId: string; revenue: number; transactions: number }> = [];

      return {
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        topAgents,
      };
    } catch (error) {
      console.error('Analytics retrieval failed:', error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageOrderValue: 0,
        topAgents: [],
      };
    }
  }
}
