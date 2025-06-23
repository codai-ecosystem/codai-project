import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request, { requireAuth: true });

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
