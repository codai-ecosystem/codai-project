import { NextRequest, NextResponse } from 'next/server';
import { SimpleAuthService } from '@/services/simple-auth';

/**
 * Zero Trust Device Management API (Simplified)
 * POST /api/auth/zero-trust/devices - Register new device
 * GET /api/auth/zero-trust/devices - List user's trusted devices
 */

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get('codai_auth_token')?.value
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    const token = cookieToken || bearerToken

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize auth service and validate token
    const authService = new SimpleAuthService()
    await authService.ensureInitialized()

    const validationResult = await authService.validateToken(token)

    if (!validationResult.success || !validationResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { deviceContext } = await request.json();

    if (!deviceContext) {
      return NextResponse.json(
        { error: 'Device context is required' },
        { status: 400 }
      );
    }

    // Simple device registration (basic implementation)
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      deviceId,
      message: 'Device registered successfully.',
      requiresVerification: false
    });

  } catch (error) {
    console.error('Device registration error:', error);

    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get('codai_auth_token')?.value
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    const token = cookieToken || bearerToken

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize auth service and validate token
    const authService = new SimpleAuthService()
    await authService.ensureInitialized()

    const validationResult = await authService.validateToken(token)

    if (!validationResult.success || !validationResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Return empty devices array for now (basic implementation)
    return NextResponse.json({
      success: true,
      devices: []
    });

  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve devices' },
      { status: 500 }
    );
  }
}
