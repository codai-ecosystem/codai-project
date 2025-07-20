import { NextRequest, NextResponse } from 'next/server'
import { memorySearch } from '../../../../../lib/search/AdvancedMemorySearch'

export async function GET(_request: NextRequest) {
  try {
    // Get comprehensive search analytics
    const analytics = memorySearch.getSearchAnalytics()

    // Get search history
    const searchHistory = memorySearch.getSearchHistory()

    // Calculate additional metrics
    const now = new Date()
    const last24Hours = searchHistory.filter(search =>
      now.getTime() - search.timestamp.getTime() < 24 * 60 * 60 * 1000
    )

    const lastWeek = searchHistory.filter(search =>
      now.getTime() - search.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    )

    // Calculate performance metrics
    const performanceMetrics = {
      searchesLast24Hours: last24Hours.length,
      searchesLastWeek: lastWeek.length,
      averageSearchesPerDay: lastWeek.length / 7,
      peakSearchHour: calculatePeakSearchHour(searchHistory),
      searchSuccessRate: calculateSearchSuccessRate(searchHistory),
      mostActiveAgents: calculateMostActiveAgents(searchHistory)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        performance: performanceMetrics,
        recentSearches: searchHistory.slice(0, 10), // Last 10 searches
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Search analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    // Clear search history
    memorySearch.clearSearchHistory()

    return NextResponse.json({
      success: true,
      message: 'Search history cleared successfully'
    })

  } catch (error) {
    console.error('Clear search history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear history' },
      { status: 500 }
    )
  }
}

function calculatePeakSearchHour(searchHistory: any[]): number {
  const hourCounts = new Array(24).fill(0)

  searchHistory.forEach(search => {
    const hour = search.timestamp.getHours()
    hourCounts[hour]++
  })

  let peakHour = 0
  let maxCount = hourCounts[0]

  for (let i = 1; i < 24; i++) {
    if (hourCounts[i] > maxCount) {
      maxCount = hourCounts[i]
      peakHour = i
    }
  }

  return peakHour
}

function calculateSearchSuccessRate(searchHistory: any[]): number {
  if (searchHistory.length === 0) return 100

  const successfulSearches = searchHistory.filter(search => search.results > 0).length
  return Math.round((successfulSearches / searchHistory.length) * 100)
}

function calculateMostActiveAgents(searchHistory: any[]): Array<{ agent: string; searches: number }> {
  // This would normally extract agent info from search context
  // For now, return simulated data based on search patterns
  const agentData = [
    { agent: 'codai_ecosystem_analyst', searches: Math.floor(searchHistory.length * 0.4) },
    { agent: 'memorai_system', searches: Math.floor(searchHistory.length * 0.3) },
    { agent: 'collaboration_system', searches: Math.floor(searchHistory.length * 0.2) },
    { agent: 'ai_system', searches: Math.floor(searchHistory.length * 0.1) }
  ]

  return agentData.filter(agent => agent.searches > 0)
}
