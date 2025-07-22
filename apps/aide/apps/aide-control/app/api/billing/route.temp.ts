/**
 * Billing API
 * Manages Stripe billing, plans, and subscriptions
 * Currently disabled due to build issues
 */
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/billing
 * Get billing information for the authenticated user
 */
async function getUserBilling(request: NextRequest) {
	return NextResponse.json({
		message: 'Billing service temporarily disabled',
		currentPlan: 'free',
		usage: { requests: 0, limit: 1000 }
	});
}

/**
 * POST /api/billing
 * Create checkout session for subscription
 */
async function createCheckoutSession(request: NextRequest) {
	return NextResponse.json({
		error: 'Billing service temporarily disabled'
	}, { status: 503 });
}

/**
 * DELETE /api/billing
 * Cancel subscription
 */
async function cancelSubscription(request: NextRequest) {
	return NextResponse.json({
		error: 'Billing service temporarily disabled'
	}, { status: 503 });
}

export const GET = getUserBilling;
export const POST = createCheckoutSession;
export const DELETE = cancelSubscription;
