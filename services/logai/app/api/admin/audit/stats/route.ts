// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic';

// Admin audit statistics API
import { NextRequest, NextResponse } from 'next/server';
import { withAPIMiddleware, getClientIP } from '@/lib/security';
import { auditLogger } from '@/lib/audit';

async function handleGetAuditStats(
  request: NextRequest,
  token: any
): Promise<NextResponse> {
  try {
    // Temporary: Return mock data during build
    const stats = {
      totalActions: 0,
      uniqueUsers: 0,
      topActions: [],
      actionsByHour: [],
      userActivity: [],
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

    // TODO: Re-enable after fixing database connection during build
    // const url = new URL(request.url);
    // const timeframe =
    //   (url.searchParams.get('timeframe') as '24h' | '7d' | '30d') || '24h';
    // const stats = await auditLogger.getStats(timeframe);

    // await auditLogger.log({
    //   userId: token.userId,
    //   action: 'admin_action',
    //   resource: 'audit_stats',
    //   ipAddress: getClientIP(request),
    //   success: true,
    //   details: { action: 'view_audit_stats', timeframe: 'mock' },
    // });

    // return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin get audit stats error:', error);

    await auditLogger.log({
      userId: token.userId,
      action: 'admin_action',
      resource: 'audit_stats',
      ipAddress: getClientIP(request),
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to fetch audit statistics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return withAPIMiddleware(request, handleGetAuditStats, {
    requireAuth: true,
    requireRole: 'admin',
  });
}
