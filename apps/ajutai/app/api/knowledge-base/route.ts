// AJUTAI Knowledge Base API Route
// Handles knowledge base article management and search

import { NextRequest, NextResponse } from 'next/server'
import { KnowledgeBaseService } from '../../../lib/knowledge-base-service'

const kbService = new KnowledgeBaseService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse search parameters
    const params: any = {
      query: searchParams.get('query') || '',
      categoryId: searchParams.get('categoryId') || undefined,
      status: searchParams.get('status') as any || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      language: searchParams.get('language') || undefined,
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    const result = await kbService.searchArticles(params)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Search knowledge base error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, categoryId, tags, authorId, status, language } = body

    if (!title || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { error: 'Title, content, categoryId, and authorId are required' },
        { status: 400 }
      )
    }

    const result = await kbService.createArticle({
      title,
      content,
      categoryId,
      tags,
      authorId,
      status,
      language
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create knowledge base article error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
