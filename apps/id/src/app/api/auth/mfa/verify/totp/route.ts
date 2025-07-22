import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.enterprise';
import { mfaService } from '@/lib/mfa';
import { auditLogger } from '@/lib/audit';

/**
 * Verify TOTP and activate device
 * POST /api/auth/mfa/verify/totp
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

    const { token, deviceName } = await request.json();

    if (!token || !deviceName) {
      return NextResponse.json(
        { error: 'Token and device name are required' },
        { status: 400 }
      );
    }

    const isValid = await mfaService.verifyAndActivateTOTP(
      session.user.id,
      token,
      deviceName
    );

    if (isValid) {
      await auditLogger.logAuth('mfa_totp_verified', {
        userId: session.user.id,
        outcome: 'success',
        details: { deviceName }
      });

      return NextResponse.json({
        success: true,
        message: 'TOTP verified and activated successfully'
      });
    } else {
      await auditLogger.logAuth('mfa_totp_verification_failed', {
        userId: session.user.id,
        outcome: 'failure',
        details: { deviceName }
      });

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('TOTP verification error:', error);

    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
