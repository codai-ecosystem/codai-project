/**
 * Stripe Service for Backend Operations
 *
 * This service handles server-side Stripe operations and webhook processing
 * for events not covered by the Firebase Extension.
 */

import Stripe from 'stripe';

import { env } from './env.js';

/**
 * Stripe Service Class
 * Provides server-side Stripe operations and webhook handling
 */
export class StripeBackendService {
  private readonly stripe: Stripe | null = null;

  constructor() {
    if (env.STRIPE_SECRET_KEY != null && env.STRIPE_SECRET_KEY.trim() !== '') {
      this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-05-28.basil',
        typescript: true,
      });
    }
  }

  /**
   * Get Stripe instance
   */
  getStripe(): Stripe {
    if (!this.stripe) {
      throw new Error('Stripe not initialized. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return this.stripe;
  }

  /**
   * Verify webhook signature
   */ verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    if (env.STRIPE_WEBHOOK_SECRET == null || env.STRIPE_WEBHOOK_SECRET.trim() === '') {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    try {
      return this.getStripe().webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      throw new Error(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  } /**
   * Handle invoice events (not covered by Firebase Extension)
   */
  handleInvoiceEvent(event: Stripe.Event): void {
    const invoice = event.data.object as Stripe.Invoice;

    switch (event.type) {
      case 'invoice.created':
        this.handleInvoiceCreated(invoice);
        break;
      case 'invoice.finalized':
        this.handleInvoiceFinalized(invoice);
        break;
      case 'invoice.payment_succeeded':
        this.handleInvoicePaymentSucceeded(invoice);
        break;
      case 'invoice.payment_failed':
        this.handleInvoicePaymentFailed(invoice);
        break;
      case 'invoice.upcoming':
        this.handleInvoiceUpcoming(invoice);
        break;
      default:
        console.log(`Unhandled invoice event: ${event.type}`);
    }
  } /**
   * Handle customer events (additional to Firebase Extension)
   */
  handleCustomerEvent(event: Stripe.Event): void {
    switch (event.type) {
      case 'customer.source.created':
      case 'customer.source.updated':
      case 'customer.source.deleted':
        this.handleCustomerSourceChanged(event);
        break;
      case 'customer.discount.created':
      case 'customer.discount.updated':
      case 'customer.discount.deleted':
        this.handleCustomerDiscountChanged(event);
        break;
      default:
        console.log(`Unhandled customer event: ${event.type}`);
    }
  } /**
   * Handle payment method events
   */
  handlePaymentMethodEvent(event: Stripe.Event): void {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;

    switch (event.type) {
      case 'payment_method.attached':
        this.handlePaymentMethodAttached(paymentMethod);
        break;
      case 'payment_method.detached':
        this.handlePaymentMethodDetached(paymentMethod);
        break;
      case 'payment_method.updated':
        this.handlePaymentMethodUpdated(paymentMethod);
        break;
      default:
        console.log(`Unhandled payment method event: ${event.type}`);
    }
  } /**
   * Handle dispute events
   */
  handleDisputeEvent(event: Stripe.Event): void {
    const dispute = event.data.object as Stripe.Dispute;

    switch (event.type) {
      case 'charge.dispute.created':
        this.handleDisputeCreated(dispute);
        break;
      case 'charge.dispute.updated':
        this.handleDisputeUpdated(dispute);
        break;
      case 'charge.dispute.closed':
        this.handleDisputeClosed(dispute);
        break;
      default:
        console.log(`Unhandled dispute event: ${event.type}`);
    }
  }

  // Private methods for specific event handling

  private handleInvoiceCreated(invoice: Stripe.Invoice): void {
    console.log(`Invoice created: ${invoice.id}`);
    // Add your business logic here
    // Example: Send notification to customer, update internal records, etc.
  }

  private handleInvoiceFinalized(invoice: Stripe.Invoice): void {
    console.log(`Invoice finalized: ${invoice.id}`);
    // Add your business logic here
    // Example: Send invoice to customer, update billing status, etc.
  }

  private handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): void {
    console.log(`Invoice payment succeeded: ${invoice.id}`);
    // Add your business logic here
    // Example: Activate services, send receipt, update user status, etc.
  }

  private handleInvoicePaymentFailed(invoice: Stripe.Invoice): void {
    console.log(`Invoice payment failed: ${invoice.id}`);
    // Add your business logic here
    // Example: Send payment failure notification, attempt retry, etc.
  }

  private handleInvoiceUpcoming(invoice: Stripe.Invoice): void {
    console.log(`Upcoming invoice: ${invoice.id}`);
    // Add your business logic here
    // Example: Send reminder email, prepare for upcoming charge, etc.
  }

  private handleCustomerSourceChanged(event: Stripe.Event): void {
    console.log(`Customer source changed: ${event.type}`);
    // Add your business logic here
    // Example: Update payment method preferences, validate new source, etc.
  }
  private handleCustomerDiscountChanged(event: Stripe.Event): void {
    console.log(`Customer discount changed: ${event.type}`);
    // Add your business logic here
    // Example: Update pricing display, recalculate totals, etc.
  }

  private handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): void {
    console.log(`Payment method attached: ${paymentMethod.id}`);
    // Add your business logic here
    // Example: Update user preferences, validate payment method, etc.
  }

  private handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): void {
    console.log(`Payment method detached: ${paymentMethod.id}`);
    // Add your business logic here
    // Example: Update default payment method, notify user, etc.
  }

  private handlePaymentMethodUpdated(paymentMethod: Stripe.PaymentMethod): void {
    console.log(`Payment method updated: ${paymentMethod.id}`);
    // Add your business logic here
    // Example: Sync payment method changes, validate updates, etc.
  }

  private handleDisputeCreated(dispute: Stripe.Dispute): void {
    console.log(`Dispute created: ${dispute.id}`);
    // Add your business logic here
    // Example: Send notification to admin, gather evidence, etc.
  }

  private handleDisputeUpdated(dispute: Stripe.Dispute): void {
    console.log(`Dispute updated: ${dispute.id}`);
    // Add your business logic here
    // Example: Update dispute status, notify relevant parties, etc.
  }

  private handleDisputeClosed(dispute: Stripe.Dispute): void {
    console.log(`Dispute closed: ${dispute.id}`);
    // Add your business logic here
    // Example: Update records, process resolution, notify stakeholders, etc.
  }
}

// Singleton instance
let stripeBackendService: StripeBackendService | null = null;

/**
 * Get the Stripe backend service instance
 */
export function getStripeBackendService(): StripeBackendService {
  if (!stripeBackendService) {
    stripeBackendService = new StripeBackendService();
  }
  return stripeBackendService;
}
