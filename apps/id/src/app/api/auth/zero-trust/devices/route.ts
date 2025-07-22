import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.enterprise';
import { zeroTrustService } from '@/lib/zero-trust';
import { auditLogger } from '@/lib/audit';

/**
 * Zero Trust Device Management API
 * POST /api/auth/zero-trust/devices - Register new device
 * GET /api/auth/zero-trust/devices - List user's trusted devices
 * PUT /api/auth/zero-trust/devices/[id]/verify - Verify device
 * DELETE /api/auth/zero-trust/devices/[id] - Remove trusted device
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    // Add client IP and user agent from request headers
    const clientIP = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const enhancedContext = {
      ...deviceContext,
      userAgent,
      deviceId: deviceContext.deviceId || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const deviceId = await zeroTrustService.registerDevice(
      session.user.id,
      enhancedContext
    );

    await auditLogger.log({
      userId: session.user.id,
      action: 'zero_trust_device_registration',
      outcome: 'success',
      ipAddress: clientIP,
      userAgent: userAgent,
      details: { deviceId, requiresVerification: true }
    });

    return NextResponse.json({
      success: true,
      deviceId,
      message: 'Device registered successfully. Verification required.',
      requiresVerification: true
    });

  } catch (error) {
    console.error('Device registration error:', error);

    const session = await getServerSession(authOptions);

    await auditLogger.log({
      userId: session?.user?.id,
      action: 'zero_trust_device_registration_failed',
      outcome: 'error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's trusted devices from database
    const { prisma } = await import('@/lib/prisma');

    const devices = await prisma.trustedDevice.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        deviceId: true,
        name: true,
        platform: true,
        isVerified: true,
        lastSeenAt: true,
        createdAt: true,
        ipAddress: true,
        location: true
      },
      orderBy: {
        lastSeenAt: 'desc'
      }
    });

    const formattedDevices = devices.map((device: any) => ({
      ...device,
      location: device.location ? JSON.parse(device.location as string) : null
    }));

    return NextResponse.json({
      success: true,
      devices: formattedDevices
    });

  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve devices' },
      { status: 500 }
    );
  }
}
