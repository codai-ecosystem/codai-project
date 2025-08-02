import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.enterprise';
import { mfaService } from '@/lib/mfa';
import { auditLogger } from '@/lib/audit';

/**
 * Get user's MFA devices
 * GET /api/auth/mfa/devices
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const devices = await mfaService.getUserDevices(session.user.id);

    await auditLogger.logAuth('mfa_devices_viewed', {
      userId: session.user.id,
      outcome: 'success',
      details: { deviceCount: devices.length }
    });

    return NextResponse.json({
      success: true,
      devices: devices.map(device => ({
        id: device.id,
        type: device.type,
        name: device.name,
        isActive: device.isActive,
        isVerified: device.isVerified,
        // Don't expose sensitive data like secrets
      }))
    });
  } catch (error) {
    console.error('MFA devices fetch error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
