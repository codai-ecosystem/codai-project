/**
 * Service configurations API endpoint
 * Provides service management for admins
 */
import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '../../../../lib/server/auth-middleware';
import { getAdminApp } from '../../../../lib/firebase-admin';

interface ServiceConfig {
	id: string;
	type: 'github' | 'firebase' | 'openai' | 'stripe';
	name: string;
	status: 'pending' | 'provisioning' | 'active' | 'failed' | 'suspended';
	config: any;
	createdAt: Date;
	lastUpdated: Date;
	error?: string;
}

async function handleGetServices(req: NextRequest, context: { uid: string }) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json(
				{ error: 'userId parameter is required' },
				{ status: 400 }
			);
		}

		const admin = getAdminApp();
		const db = (admin as any).firestore();

		// Get user's services
		const servicesSnapshot = await db
			.collection('users')
			.doc(userId)
			.collection('services')
			.orderBy('createdAt', 'desc')
			.get();

		const services: ServiceConfig[] = [];

		servicesSnapshot.forEach((doc: any) => {
			const data = doc.data();
			services.push({
				id: doc.id,
				...data,
				createdAt: data.createdAt?.toDate() || new Date(),
				lastUpdated: data.lastUpdated?.toDate() || new Date()
			});
		});

		return NextResponse.json({ services });

	} catch (error) {
		console.error('Services fetch error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch services' },
			{ status: 500 }
		);
	}
}

export const GET = withAdmin(handleGetServices);
