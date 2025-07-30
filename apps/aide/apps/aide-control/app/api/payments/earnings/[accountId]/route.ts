import { NextRequest, NextResponse } from 'next/server'
// Import the local Stripe service
import { StripeConnectService } from '../../../../../lib/services/stripe-connect-service'

/**
 * GET /api/payments/earnings/[accountId]
 * Get earnings data for a Stripe Connect account
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { accountId: string } }
) {
	try {
		const { searchParams } = new URL(request.url)
		const period = searchParams.get('period') as 'week' | 'month' | 'year' | 'all' || 'month'

		const stripeConnect = StripeConnectService.getInstance()
		const earnings = await stripeConnect.getUserEarnings(params.accountId, period)

		return NextResponse.json(earnings)
	} catch (error) {
		console.error('Failed to get earnings:', error)
		return NextResponse.json(
			{ error: 'Failed to get earnings data' },
			{ status: 500 }
		)
	}
}
