/**
 * CND-Enhanced Login Route for ID Service
 * Phase 2 Implementation: Replace Prisma authentication with CND
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CNDAuthService } from '@/services/cnd-auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Initialize CND Auth Service
let cndAuthService: CNDAuthService | null = null;

async function getCNDAuthService(): Promise<CNDAuthService> {
  if (!cndAuthService) {
    cndAuthService = new CNDAuthService();
    await cndAuthService.initialize();
  }
  return cndAuthService;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Get CND Auth Service
    const authService = await getCNDAuthService();

    // Extract request metadata
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Authenticate user using CND
    const authResult = await authService.authenticateUser(
      { email, password },
      { ip, userAgent }
    );

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.message || 'Authentication failed'
        },
        { status: 401 }
      );
    }

    // Prepare response
    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      refreshToken: authResult.refreshToken,
      message: 'Login successful',
      cndEnhanced: true
    });

    // Set HTTP-only cookies for security
    if (authResult.token) {
      response.cookies.set('codai_auth_token', authResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 900, // 15 minutes
        domain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined,
        path: '/'
      });
    }

    if (authResult.refreshToken) {
      response.cookies.set('codai_refresh_token', authResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 7 days
        domain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined,
        path: '/'
      });
    }

    // Add security headers
    response.headers.set('X-Powered-By', 'CODAI CND Auth');
    response.headers.set('X-Auth-Provider', 'CND');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');

    return response;

  } catch (error: any) {
    console.error('CND Login error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0].message,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Handle CND initialization errors
    if (error.message?.includes('CND') || error.message?.includes('connect')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication service temporarily unavailable',
          code: 'SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for login status check
export async function GET(request: NextRequest) {
  try {
    const authService = await getCNDAuthService();

    // Get token from cookie or Authorization header
    const token = request.cookies.get('codai_auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No authentication token provided'
      }, { status: 401 });
    }

    // Validate token using CND
    const validation = await authService.validateToken(token);

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: validation.user,
      permissions: validation.permissions,
      cndEnhanced: true
    });

  } catch (error: any) {
    console.error('Token validation error:', error);

    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Token validation failed',
      code: 'VALIDATION_ERROR'
    }, { status: 500 });
  }
}
