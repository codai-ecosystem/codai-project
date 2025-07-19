import { NextRequest, NextResponse } from 'next/server'
import { memorySearch } from '../../../../../lib/search/AdvancedMemorySearch'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [],
          message: 'Query too short for suggestions'
        }
      })
    }

    // Get search suggestions based on history (mock implementation)
    const suggestions: string[] = []

    // Add popular search terms if not enough suggestions
    const popularTerms = [
      'memory management',
      'search functionality',
      'collaboration features',
      'analytics dashboard',
      'performance optimization',
      'security measures',
      'export import',
      'vector embeddings',
      'semantic search',
      'real-time updates'
    ]

    const allSuggestions = [...suggestions]

    // Add popular terms that match the query
    if (allSuggestions.length < limit) {
      const matchingPopular = popularTerms
        .filter(term =>
          term.toLowerCase().includes(query.toLowerCase()) &&
          !allSuggestions.includes(term)
        )
        .slice(0, limit - allSuggestions.length)

      allSuggestions.push(...matchingPopular)
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestions: allSuggestions.slice(0, limit),
        query,
        historyCount: suggestions.length
      }
    })

  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}
