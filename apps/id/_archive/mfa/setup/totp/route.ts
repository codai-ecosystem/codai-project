import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.enterprise';
import { mfaService } from '@/lib/mfa-placeholder';
import { auditLogger } from '@/lib/audit-placeholder';

/**
 * Setup TOTP MFA device
 * POST /api/auth/mfa/setup/totp
 */
export async function POST(request: NextRequest) {
  let session: any = null;
  
  try {
    session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { deviceName } = await request.json();

    if (!deviceName) {
      return NextResponse.json(
        { error: 'Device name is required' },
        { status: 400 }
      );
    }

    const setupData = await mfaService.setupTOTP(session.user.id, deviceName);

    await auditLogger.logAuth('mfa_totp_setup_started', {
      userId: session.user.id,
      outcome: 'success',
      details: { deviceName }
    });

    return NextResponse.json({
      success: true,
      ...setupData
    });
  } catch (error) {
    console.error('TOTP setup error:', error);

    await auditLogger.logAuth('mfa_totp_setup_failed', {
      userId: session?.user?.id,
      outcome: 'error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json(
      { error: 'Failed to setup TOTP' },
      { status: 500 }
    );
  }
}
