import { NextRequest, NextResponse } from 'next/server'
import { logger } from '../../../../src/lib/logger'

// Only import these when needed for production mode
let Pinecone: any = null
let OpenAI: any = null

try {
  if (process.env.PINECONE_API_KEY && process.env.OPENAI_API_KEY) {
    const pineconeModule = require('@pinecone-database/pinecone')
    const openaiModule = require('openai')
    Pinecone = pineconeModule.Pinecone
    OpenAI = openaiModule.OpenAI
  }
} catch (error) {
  logger.debug('Vector search in mock mode - external dependencies not available', {
    module: 'VectorSearch',
    context: { dependencies: 'pinecone,openai' }
  })
}

const pinecone = Pinecone ? new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
}) : null

const openai = OpenAI ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
}) : null

interface SearchRequest {
  query: string
  limit?: number
  filter?: {
    fileType?: string
    tags?: string[]
    dateRange?: {
      start: string
      end: string
    }
  }
}

interface SearchResult {
  id: string
  fileName: string
  content: string
  metadata: {
    fileType: string
    size: number
    uploadDate: string
    tags: string[]
    userId: string
  }
  score: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SearchRequest
    const { query, limit = 10, filter } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Check if we have the required environment variables for full functionality
    const hasCredentials = process.env.PINECONE_API_KEY && process.env.OPENAI_API_KEY && pinecone && openai

    if (!hasCredentials) {
      // Return mock data for testing when credentials are not available
      logger.info('Vector search request processed in mock mode', {
        module: 'VectorSearch',
        context: { query, limit, mode: 'mock' }
      })

      const mockResults: SearchResult[] = [
        {
          id: 'mock_doc_1',
          fileName: 'sample-document.pdf',
          content: `Sample document content related to: ${query}`,
          metadata: {
            fileType: 'pdf',
            size: 1024,
            uploadDate: new Date().toISOString(),
            tags: ['sample', 'test'],
            userId: 'test-user'
          },
          score: 0.95
        },
        {
          id: 'mock_doc_2',
          fileName: 'test-file.txt',
          content: `Test file with content matching: ${query}`,
          metadata: {
            fileType: 'txt',
            size: 512,
            uploadDate: new Date().toISOString(),
            tags: ['test', 'demo'],
            userId: 'test-user'
          },
          score: 0.87
        }
      ].slice(0, limit)

      return NextResponse.json({
        success: true,
        results: mockResults,
        query,
        totalResults: mockResults.length,
        mode: 'mock' // Indicate this is mock data
      })
    }

    // Generate embedding for the search query
    const embeddingResponse = await openai!.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Build Pinecone filter
    const pineconeFilter: any = {}

    if (filter?.fileType) {
      pineconeFilter.fileType = { $eq: filter.fileType }
    }

    if (filter?.tags && filter.tags.length > 0) {
      pineconeFilter.tags = { $in: filter.tags }
    }

    if (filter?.dateRange) {
      pineconeFilter.uploadDate = {
        $gte: filter.dateRange.start,
        $lte: filter.dateRange.end
      }
    }

    // Search in Pinecone
    const index = pinecone!.index('stocai-vectors')
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined,
    })

    // Format results
    const results: SearchResult[] = searchResults.matches.map((match: any) => ({
      id: match.id,
      fileName: match.metadata?.fileName as string || 'Unknown',
      content: match.metadata?.content as string || '',
      metadata: {
        fileType: match.metadata?.fileType as string || '',
        size: match.metadata?.size as number || 0,
        uploadDate: match.metadata?.uploadDate as string || '',
        tags: (match.metadata?.tags as string[]) || [],
        userId: match.metadata?.userId as string || '',
      },
      score: match.score || 0,
    }))

    return NextResponse.json({
      success: true,
      results,
      query,
      totalResults: results.length,
    })

  } catch (error) {
    console.error('Vector search error:', error)
    return NextResponse.json(
      { error: 'Internal server error during vector search' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    const fileType = searchParams.get('fileType')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    const searchRequest: SearchRequest = {
      query,
      limit,
      filter: {
        ...(fileType && { fileType }),
        ...(tags && { tags }),
      }
    }

    // Reuse POST logic
    const response = await POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify(searchRequest),
      headers: { 'Content-Type': 'application/json' }
    }))

    return response

  } catch (error) {
    console.error('Vector search GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error during vector search' },
      { status: 500 }
    )
  }
}
