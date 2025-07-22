import { NextRequest, NextResponse } from 'next/server'
import { StripeConnectService } from '../../../../lib/services/stripe-connect-service'

/**
 * POST /api/payments/payouts
 * Create a payout for a Stripe Connect account
 */
export async function POST(request: NextRequest) {
	try {
		const { accountId, amount } = await request.json()

		if (!accountId || !amount) {
			return NextResponse.json(
				{ error: 'Missing required fields: accountId, amount' },
				{ status: 400 }
			)
		}

		const stripeConnect = StripeConnectService.getInstance()
		const payoutId = await stripeConnect.createPayout(accountId, amount)

		return NextResponse.json({ payoutId })
	} catch (error) {
		console.error('Failed to create payout:', error)
		return NextResponse.json(
			{ error: 'Failed to create payout' },
			{ status: 500 }
		)
	}
}
