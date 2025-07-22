/**
 * Admin status check API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/server/auth-middleware';
import { isUserAdmin } from '../../../../lib/firebase-admin';

async function handleCheckAdmin(req: NextRequest, context: { uid: string }) {
	try {
		const isAdmin = await isUserAdmin(context.uid);

		return NextResponse.json({ isAdmin });

	} catch (error) {
		console.error('Admin check error:', error);
		return NextResponse.json(
			{ error: 'Failed to check admin status' },
			{ status: 500 }
		);
	}
}

export const GET = withAuth(handleCheckAdmin);
