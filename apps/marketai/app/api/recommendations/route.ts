import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceSearchService } from '../../../lib/marketplace-service';

const marketplaceService = new MarketplaceSearchService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    // Get user context for personalized recommendations
    const context = userId ? {
      userId,
      // TODO: Fetch user interests, purchase history, etc. from database
      userInterests: ['Productivity', 'Development'],
      purchaseHistory: [],
      viewHistory: [],
    } : {};

    const recommendations = await marketplaceService.getRecommendations(context, limit);

    return NextResponse.json({
      recommendations,
      userId,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
