import { NextRequest, NextResponse } from 'next/server'
import { StripeConnectService } from '../../../../../lib/services/stripe-connect-service'

/**
 * GET /api/payments/transactions/[accountId]
 * Get transaction history for a Stripe Connect account
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { accountId: string } }
) {
	try {
		const { searchParams } = new URL(request.url)
		const limit = parseInt(searchParams.get('limit') || '20')

		const stripeConnect = StripeConnectService.getInstance()
		const transactions = await stripeConnect.getUserTransactions(params.accountId, { limit })

		return NextResponse.json(transactions)
	} catch (error) {
		console.error('Failed to get transactions:', error)
		return NextResponse.json(
			{ error: 'Failed to get transaction data' },
			{ status: 500 }
		)
	}
}
