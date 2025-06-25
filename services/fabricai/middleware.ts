/**
 * Authentication Middleware
 * Handles request authentication using LogAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLogAIService } from '@/lib/services';

export async function authMiddleware(request: NextRequest) {
  // Skip authentication for public routes
  const publicRoutes = [
    '/api/health',
    '/api/auth/validate',
    '/api/auth/refresh',
  ];
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Validate token with LogAI
    const logaiService = getLogAIService();
    const result = await logaiService.validateToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Add user info to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', result.user?.id || '');
    response.headers.set('x-user-email', result.user?.email || '');
    response.headers.set('x-user-role', result.user?.role || '');

    return response;
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 503 }
    );
  }
}

// Middleware configuration
export const config = {
  matcher: ['/api/(.*)', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
