import { NextRequest, NextResponse } from 'next/server'
import { StripeConnectService } from '../../../../../lib/services/stripe-connect-service'

/**
 * GET /api/payments/payouts/[accountId]
 * Get payout history for a Stripe Connect account
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { accountId: string } }
) {
	try {
		const { searchParams } = new URL(request.url)
		const limit = parseInt(searchParams.get('limit') || '10')

		const stripeConnect = StripeConnectService.getInstance()
		const payouts = await stripeConnect.getUserPayouts(params.accountId, { limit })

		return NextResponse.json(payouts)
	} catch (error) {
		console.error('Failed to get payouts:', error)
		return NextResponse.json(
			{ error: 'Failed to get payout data' },
			{ status: 500 }
		)
	}
}
