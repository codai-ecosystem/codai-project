import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.enterprise';
import { mfaService } from '@/lib/mfa';
import { auditLogger } from '@/lib/audit';

/**
 * Verify MFA token (TOTP, SMS, Hardware)
 * POST /api/auth/mfa/verify
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

    const { token, deviceId } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const isValid = await mfaService.verifyToken(
      session.user.id,
      token,
      deviceId
    );

    if (isValid) {
      await auditLogger.logAuth('mfa_token_verified', {
        userId: session.user.id,
        outcome: 'success',
        details: { deviceId }
      });

      return NextResponse.json({
        success: true,
        message: 'MFA token verified successfully'
      });
    } else {
      await auditLogger.logAuth('mfa_token_verification_failed', {
        userId: session.user.id,
        outcome: 'failure',
        details: { deviceId }
      });

      return NextResponse.json(
        { error: 'Invalid MFA token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('MFA verification error:', error);

    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
