import { NextRequest, NextResponse } from 'next/server'
import { RealStorageService } from '../../../services/RealStorageService'

const storageService = RealStorageService.getInstance()

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url || '', 'http://localhost')
    const { searchParams } = url
    const query = searchParams.get('query')
    const id = searchParams.get('id')
    const threshold = parseFloat(searchParams.get('threshold') || '0.7')
    const limit = parseInt(searchParams.get('limit') || '10')
    const metadata = searchParams.get('metadata')

    // If requesting specific vector by ID
    if (id) {
      try {
        const vector = await storageService.getVectorById?.(id)
        if (!vector) {
          return NextResponse.json({
            success: false,
            error: 'Vector not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          vector: vector
        }, { status: 200 })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Failed to retrieve vector'
        }, { status: 500 })
      }
    }

    // Require query for search
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query or ID parameter required'
      }, { status: 400 })
    }

    // Parse metadata filter if provided
    let metadataFilter = undefined
    if (metadata) {
      try {
        metadataFilter = JSON.parse(metadata)
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: 'Invalid metadata filter format'
        }, { status: 400 })
      }
    }

    // Perform similarity search
    const results = await storageService.searchSimilar(query, {
      threshold,
      limit,
      metadataFilter
    })

    return NextResponse.json({
      success: true,
      vectors: results,
      meta: {
        query,
        threshold,
        limit,
        resultsCount: results.length
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Error in vectors GET:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { text, metadata, namespace, batch, vectors } = body

    // Handle batch operation
    if (batch && vectors) {
      if (!Array.isArray(vectors) || vectors.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Vectors array is required for batch operation'
        }, { status: 400 })
      }

      const results = []
      for (const vectorData of vectors) {
        try {
          const result = await storageService.generateEmbedding(
            vectorData.text,
            vectorData.metadata || {},
            namespace
          )
          results.push(result)
        } catch (error) {
          console.error('Batch vector creation error:', error)
          // Continue with other vectors even if one fails
        }
      }

      return NextResponse.json({
        success: true,
        vectors: results
      }, { status: 201 })
    }

    // Validate required fields for single vector
    if (!text) {
      return NextResponse.json({
        success: false,
        error: 'Text is required'
      }, { status: 400 })
    }

    // Check if this is a batch operation (legacy format)
    if (Array.isArray(text)) {
      // Handle batch vector creation
      const vectorsToCreate = []
      for (const item of text) {
        if (typeof item === 'string') {
          vectorsToCreate.push({ text: item, metadata: metadata || {} })
        } else if (item.text) {
          vectorsToCreate.push({ text: item.text, metadata: item.metadata || metadata || {} })
        }
      }

      if (vectorsToCreate.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No valid text items provided'
        }, { status: 400 })
      }

      try {
        const results = await Promise.all(
          vectorsToCreate.map(vector =>
            storageService.generateEmbedding(vector.text, vector.metadata, namespace)
          )
        )

        return NextResponse.json({
          success: true,
          vectors: results,
          count: results.length
        }, { status: 201 })
      } catch (error) {
        console.error('Batch vector creation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create vectors'
        }, { status: 500 })
      }
    }

    // Single vector creation
    try {
      const result = await storageService.generateEmbedding(text, metadata || {}, namespace)

      return NextResponse.json({
        success: true,
        vector: result
      }, { status: 201 }) // Fix: tests expect 201 for creation
    } catch (error) {
      console.error('Vector creation failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create vector'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in vectors POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url || '', 'http://localhost')
    const { searchParams } = url
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Vector ID is required'
      }, { status: 400 })
    }

    try {
      await storageService.deleteVector?.(id)

      return NextResponse.json({
        success: true,
        message: 'Vector deleted successfully'
      }, { status: 200 })
    } catch (error) {
      console.error('Vector deletion failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete vector'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in vectors DELETE:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
