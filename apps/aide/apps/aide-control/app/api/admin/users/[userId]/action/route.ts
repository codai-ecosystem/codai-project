import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '../../../../../../lib/firebase-admin'

/**
 * Admin User Actions API Route
 * POST /api/admin/users/[userId]/action - Perform actions on users (suspend, ban, activate)
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { userId: string } }
) {
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

		const { action } = await request.json()
		const { userId } = params

		if (!['suspend', 'activate', 'ban'].includes(action)) {
			return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
		}

		// Update user status
		const newStatus = action === 'activate' ? 'active' : action === 'suspend' ? 'suspended' : 'banned'

		await adminDb.collection('users').doc(userId).update({
			status: newStatus,
			updatedAt: new Date(),
			updatedBy: decodedToken.uid
		})

		// Log the action
		await adminDb.collection('audit_logs').add({
			action: `user_${action}`,
			performedBy: decodedToken.uid,
			targetUser: userId,
			timestamp: new Date(),
			details: { newStatus }
		})

		// If banning or suspending, revoke refresh tokens
		if (action === 'ban' || action === 'suspend') {
			try {
				await adminAuth.revokeRefreshTokens(userId)
			} catch (error) {
				console.error('Error revoking tokens:', error)
			}
		}

		return NextResponse.json({ success: true, newStatus })
	} catch (error) {
		console.error('User action error:', error)
		return NextResponse.json(
			{ error: 'Failed to perform user action' },
			{ status: 500 }
		)
	}
}
