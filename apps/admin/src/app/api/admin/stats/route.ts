import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level') || 'all';
    const since = searchParams.get('since');

    // Mock system stats
    const stats = {
      totalServices: 29,
      onlineServices: 26,
      totalUsers: 2341,
      activeUsers: 1876,
      totalRequests: 8750432,
      errorRate: 0.2,
      avgResponseTime: 156,
      systemUptime: '99.7%',
    };

    return NextResponse.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
