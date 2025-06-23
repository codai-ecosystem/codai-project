import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // Clear session cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    SessionManager.clearSession(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
