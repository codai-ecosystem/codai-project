import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/lib/services/dashboardService';

export async function GET(request: NextRequest) {
  try {
    // Skip authentication for development
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const stats = await dashboardService.getDashboardStats();

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
