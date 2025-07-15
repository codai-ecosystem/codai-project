import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock analytics data for now
    const mockAnalytics = {
      storage: {
        totalFiles: 15420,
        totalSize: 2.3 * 1024 * 1024 * 1024, // 2.3 GB
        categories: {
          'Documente': 4521,
          'Imagini': 3210,
          'Video': 876,
          'Audio': 1234,
          'Text': 5579
        },
        recentUploads: 234,
        vectorsStored: 8765,
        searchQueries: 12543,
        storageUsage: {
          used: 2.3 * 1024 * 1024 * 1024,
          total: 10 * 1024 * 1024 * 1024,
          percentage: 23
        }
      },
      performance: {
        averageUploadTime: 1.2,
        averageSearchTime: 0.8,
        successRate: 98.7,
        errorRate: 1.3
      },
      usage: {
        dailyActiveUsers: 542,
        totalOperations: 23456,
        topCategories: [
          { name: 'Text', count: 5579 },
          { name: 'Documente', count: 4521 },
          { name: 'Imagini', count: 3210 },
          { name: 'Audio', count: 1234 },
          { name: 'Video', count: 876 }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      data: mockAnalytics
    })
  } catch (error) {
    console.error('Error fetching storage analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
