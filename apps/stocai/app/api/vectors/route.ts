import { NextRequest, NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const indexName = searchParams.get('index') || 'default'
    const query = searchParams.get('query')
    const topK = parseInt(searchParams.get('topK') || '10')
    const namespace = searchParams.get('namespace') || ''

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    // Generate embedding for query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search in Pinecone
    const index = pinecone.index(indexName)
    const searchResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      includeValues: false
    })

    return NextResponse.json({
      query,
      results: searchResponse.matches?.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata
      })) || [],
      total: searchResponse.matches?.length || 0
    })
  } catch (error) {
    console.error('Error searching vectors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { text, metadata, indexName = 'default', namespace = '' } = body

    if (!text) {
      return NextResponse.json({ error: 'Text content required' }, { status: 400 })
    }

    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })

    const embedding = embeddingResponse.data[0].embedding
    const vectorId = `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store in Pinecone
    const index = pinecone.index(indexName)
    await index.upsert([{
      id: vectorId,
      values: embedding,
      metadata: {
        text,
        namespace,
        created_at: new Date().toISOString(),
        ...metadata
      }
    }])

    return NextResponse.json({
      id: vectorId,
      dimension: embedding.length,
      namespace,
      metadata: {
        text,
        created_at: new Date().toISOString(),
        ...metadata
      }
    })
  } catch (error) {
    console.error('Error creating vector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const indexName = searchParams.get('index') || 'default'
    const vectorId = searchParams.get('id')
    const namespace = searchParams.get('namespace') || ''

    if (!vectorId) {
      return NextResponse.json({ error: 'Vector ID required' }, { status: 400 })
    }

    // Delete from Pinecone
    const index = pinecone.index(indexName)
    await index.deleteOne(vectorId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
