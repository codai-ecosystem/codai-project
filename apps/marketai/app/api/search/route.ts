import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceSearchService } from '../../../lib/marketplace-service';

const marketplaceService = new MarketplaceSearchService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const rating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const author = searchParams.get('author') || undefined;
    const verified = searchParams.get('verified') ? searchParams.get('verified') === 'true' : undefined;
    const sortBy = searchParams.get('sortBy') as 'price' | 'rating' | 'downloads' | 'created' | 'updated' || undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    const filters = {
      category,
      priceRange: minPrice !== undefined || maxPrice !== undefined ? {
        min: minPrice || 0,
        max: maxPrice || Infinity,
      } : undefined,
      rating,
      tags: tags.length > 0 ? tags : undefined,
      author,
      verified,
      sortBy,
      sortOrder,
      page,
      limit,
    };

    const results = await marketplaceService.searchAgents(query, filters);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;

    const results = await marketplaceService.searchAgents(query, filters);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search agents' },
      { status: 500 }
    );
  }
}
