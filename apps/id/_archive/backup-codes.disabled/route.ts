import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.enterprise';
import { mfaService } from '@/lib/mfa';
import { auditLogger } from '@/lib/audit';

/**
 * Generate backup codes for MFA
 * POST /api/auth/mfa/backup-codes
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

    const backupCodes = await mfaService.generateBackupCodes(session.user.id);

    await auditLogger.logAuth('mfa_backup_codes_generated', {
      userId: session.user.id,
      outcome: 'success'
    });

    return NextResponse.json({
      success: true,
      backupCodes: backupCodes
    });
  } catch (error) {
    console.error('Backup codes generation error:', error);

    return NextResponse.json(
      { error: 'Failed to generate backup codes' },
      { status: 500 }
    );
  }
}

/**
 * Get existing backup codes count
 * GET /api/auth/mfa/backup-codes
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

    const codesCount = await mfaService.getBackupCodesCount(session.user.id);

    return NextResponse.json({
      success: true,
      count: codesCount
    });
  } catch (error) {
    console.error('Backup codes count error:', error);

    return NextResponse.json(
      { error: 'Failed to get backup codes count' },
      { status: 500 }
    );
  }
}
