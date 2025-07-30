import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '../../../../lib/firebase-admin'

/**
 * Admin Users API Route
 * GET /api/admin/users - Get all users for admin management
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

		// Get users from Firestore
		const usersSnapshot = await adminDb.collection('users')
			.orderBy('createdAt', 'desc')
			.limit(100)
			.get()

		const users = usersSnapshot.docs.map((doc: any) => {
			const data = doc.data()
			return {
				uid: doc.id,
				email: data.email,
				displayName: data.displayName || '',
				plan: data.plan || 'free',
				status: data.status || 'active',
				createdAt: data.createdAt?.toDate() || new Date(),
				lastActive: data.lastActive?.toDate() || new Date()
			}
		})

		return NextResponse.json({ users })
	} catch (error) {
		console.error('Admin users error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch users' },
			{ status: 500 }
		)
	}
}
