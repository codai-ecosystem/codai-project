import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '../../../../lib/firebase-admin'

/**
 * Admin Stats API Route
 * GET /api/admin/stats
 * Returns admin dashboard statistics
 */
export async function GET(request: NextRequest) {
	try {
		// Verify admin access
		const authHeader = request.headers.get('Authorization')
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const token = authHeader.split('Bearer ')[1]
		const decodedToken = await adminAuth.verifyIdToken(token)
		// Check if user is admin
		const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
		const userData = userDoc.data()

		if (!userData?.isAdmin) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		// Get stats from Firestore
		const usersSnapshot = await adminDb.collection('users').get()
		const totalUsers = usersSnapshot.size

		// Count active users (logged in within last 30 days)
		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

		const activeUsersSnapshot = await adminDb.collection('users')
			.where('lastActive', '>=', thirtyDaysAgo)
			.get()
		const activeUsers = activeUsersSnapshot.size

		// Get revenue data (this would come from Stripe in production)
		const totalRevenue = 0 // Placeholder - would calculate from Stripe

		// Count active services
		const servicesSnapshot = await adminDb.collection('services')
			.where('status', '==', 'active')
			.get()
		const activeServices = servicesSnapshot.size

		// Count pending support tickets
		const ticketsSnapshot = await adminDb.collection('support_tickets')
			.where('status', '==', 'pending')
			.get()
		const pendingTickets = ticketsSnapshot.size

		const stats = {
			totalUsers,
			activeUsers,
			totalRevenue,
			activeServices,
			pendingTickets
		}

		return NextResponse.json(stats)
	} catch (error) {
		console.error('Admin stats error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch admin stats' },
			{ status: 500 }
		)
	}
}
