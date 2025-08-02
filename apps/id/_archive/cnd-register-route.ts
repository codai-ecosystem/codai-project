/**
 * CND-Enhanced Registration Route for ID Service
 * Phase 2 Implementation: User registration with CND integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CNDAuthService } from '@/services/cnd-auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.string().optional().default('user')
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
    const validatedData = registerSchema.parse(body);
    const { name, email, password, role } = validatedData;

    // Get CND Auth Service
    const authService = await getCNDAuthService();

    // Create user using CND
    const user = await authService.createUser({
      name,
      email,
      password,
      role: role || 'user'
    });

    // Prepare response (without password)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      },
      message: 'User registered successfully',
      cndEnhanced: true
    }, { status: 201 });

    // Add security headers
    response.headers.set('X-Powered-By', 'CODAI CND Auth');
    response.headers.set('X-Auth-Provider', 'CND');
    response.headers.set('Location', `/api/users/${user.id}`);

    return response;

  } catch (error: any) {
    console.error('CND Registration error:', error);

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

    // Handle duplicate user errors
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      );
    }

    // Handle CND service errors
    if (error.message?.includes('CND') || error.message?.includes('connect')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration service temporarily unavailable',
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

// GET endpoint for registration validation/checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 });
    }

    const authService = await getCNDAuthService();

    // Check if user exists
    const existingUser = await authService.findUserByEmail(email);

    return NextResponse.json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'Email is already registered' : 'Email is available'
    });

  } catch (error: any) {
    console.error('Email check error:', error);

    return NextResponse.json({
      success: false,
      error: 'Email validation failed',
      code: 'VALIDATION_ERROR'
    }, { status: 500 });
  }
}
