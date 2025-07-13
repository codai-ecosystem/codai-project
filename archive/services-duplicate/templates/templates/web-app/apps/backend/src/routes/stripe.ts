/**
 * Stripe Webhook Routes
 *
 * Handles Stripe webhook events that are not covered by the
 * "Run Payments with Stripe" Firebase Extension.
 */

import { getStripeBackendService, type StripeBackendService } from '../lib/stripe.js';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Stripe } from 'stripe';

interface WebhookRequest extends FastifyRequest {
  rawBody?: Buffer;
}

/**
 * Register Stripe webhook routes
 */
function registerStripeRoutes(fastify: FastifyInstance): void {
  const stripeService = getStripeBackendService();

  // Add raw body parser for webhook signature verification
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (req: FastifyRequest, body: Buffer, done) => {
      try {
        (req as WebhookRequest).rawBody = body;
        const parsed: unknown = JSON.parse(body.toString());
        done(null, parsed);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  );

  /**
   * Main webhook endpoint for additional Stripe events
   * POST /api/webhooks/stripe
   */ fastify.post<{
    Body: unknown;
  }>('/webhooks/stripe', async (request: WebhookRequest, reply: FastifyReply) => {
    try {
      const signature = request.headers['stripe-signature'];
      const rawBody = request.rawBody;

      if (signature == null || typeof signature !== 'string') {
        void reply.code(400).send({ error: 'Missing stripe-signature header' });
        return;
      }

      if (rawBody == null) {
        void reply.code(400).send({ error: 'Missing request body' });
        return;
      }

      // Verify webhook signature
      const event = stripeService.verifyWebhookSignature(rawBody, signature);

      // Log the event for debugging
      fastify.log.info(`Received Stripe webhook: ${event.type}`); // Route to appropriate handler based on event type
      routeWebhookEvent(event, stripeService);

      // Respond with success
      void reply.code(200).send({ received: true });
    } catch (error) {
      fastify.log.error(
        `Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      void reply.code(400).send({
        error: 'Webhook signature verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Health check endpoint for webhook
   * GET /api/webhooks/stripe/health
   */ fastify.get(
    '/webhooks/stripe/health',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      void reply.send({
        status: 'healthy',
        service: 'stripe-webhook',
        timestamp: new Date().toISOString(),
      });
    }
  );
}

/**
 * Route webhook events to appropriate handlers
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
function routeWebhookEvent(event: Stripe.Event, stripeService: StripeBackendService): void {
  // Invoice events (not fully covered by Firebase Extension)
  if (event.type.startsWith('invoice.')) {
    stripeService.handleInvoiceEvent(event);
    return;
  }

  // Customer events (additional handling beyond Firebase Extension)
  if (event.type.startsWith('customer.')) {
    // Only handle specific customer events not covered by the extension
    const handledCustomerEvents = [
      'customer.source.created',
      'customer.source.updated',
      'customer.source.deleted',
      'customer.discount.created',
      'customer.discount.updated',
      'customer.discount.deleted',
    ];
    if (handledCustomerEvents.includes(event.type)) {
      stripeService.handleCustomerEvent(event);
    }
    return;
  }
  // Payment method events
  if (event.type.startsWith('payment_method.')) {
    stripeService.handlePaymentMethodEvent(event);
    return;
  }

  // Dispute events
  if (event.type.startsWith('charge.dispute.')) {
    stripeService.handleDisputeEvent(event);
    return;
  } // Additional events that might need custom handling
  switch (event.type) {
    case 'account.updated':
    case 'account.external_account.created':
    case 'account.external_account.updated':
    case 'account.external_account.deleted':
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`Account event received: ${event.type}`);
      }
      // Add account-specific handling here if needed
      break;

    case 'application_fee.created':
    case 'application_fee.refunded':
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`Application fee event received: ${event.type}`);
      }
      // Add application fee handling here if needed
      break;

    case 'balance.available':
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`Balance event received: ${event.type}`);
      }
      // Add balance handling here if needed
      break;

    case 'payout.created':
    case 'payout.updated':
    case 'payout.paid':
    case 'payout.failed':
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`Payout event received: ${event.type}`);
      }
      // Add payout handling here if needed
      break;

    case 'review.opened':
    case 'review.closed':
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`Review event received: ${event.type}`);
      }
      // Add review handling here if needed
      break;

    case 'setup_intent.created':
    case 'setup_intent.setup_failed':
    case 'setup_intent.succeeded':
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`Setup intent event received: ${event.type}`);
      }
      // Add setup intent handling here if needed
      break;

    default:
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`Unhandled webhook event: ${event.type}`);
      }
  }
}

/**
 * Stripe routes plugin
 */
export default function stripeRoutes(fastify: FastifyInstance): Promise<void> {
  console.log('Stripe routes being registered');
  return Promise.resolve(registerStripeRoutes(fastify));
}
