import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '../../../lib/payment-service';

const paymentService = new PaymentService({
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  infuraProjectId: process.env.INFURA_PROJECT_ID,
  privateKey: process.env.PRIVATE_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, userId, amount, currency = 'usd', paymentMethod } = body;

    if (!agentId || !userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, userId, amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const result = await paymentService.createPaymentIntent(
      amount,
      currency,
      {
        agentId,
        userId,
        paymentMethod: paymentMethod || 'stripe',
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Calculate revenue sharing
    const revenueShare = paymentService.calculateRevenueShare(amount);

    return NextResponse.json({
      paymentId: result.paymentId,
      clientSecret: result.clientSecret,
      amount,
      currency,
      revenueShare,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    // TODO: Get payment status from database
    // For now, return mock status
    return NextResponse.json({
      paymentId,
      status: 'succeeded',
      amount: 29.99,
      currency: 'usd',
      agentId: 'agent_123',
      userId: 'user_456',
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
