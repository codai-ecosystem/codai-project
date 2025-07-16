import { NextRequest, NextResponse } from 'next/server'
import AjutAIService from '../../../services/ajutaiService'

const ajutaiService = AjutAIService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') as any
    const difficulty = searchParams.get('difficulty') as any
    const search = searchParams.get('search')

    const filters: any = {}
    if (category) filters.category = category
    if (status) filters.status = status
    if (difficulty) filters.difficulty = difficulty
    if (search) filters.search = search

    const articles = await ajutaiService.getArticles(filters)

    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length
    })
  } catch (error) {
    console.error('Error fetching knowledge articles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch knowledge articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['title', 'content', 'category', 'author']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const article = await ajutaiService.createArticle({
      title: body.title,
      content: body.content,
      summary: body.summary || body.content.substring(0, 200) + '...',
      category: body.category,
      subcategory: body.subcategory,
      tags: body.tags || [],
      status: body.status || 'draft',
      author: body.author,
      difficulty: body.difficulty || 'beginner',
      estimatedReadTime: body.estimatedReadTime || Math.ceil(body.content.length / 1000),
      relatedArticles: body.relatedArticles || [],
      attachments: body.attachments || [],
      versions: [],
      aiMetadata: {
        topics: body.aiMetadata?.topics || [],
        keywords: body.aiMetadata?.keywords || [],
        readabilityScore: body.aiMetadata?.readabilityScore || 80,
        completenessScore: body.aiMetadata?.completenessScore || 85,
        accuracyScore: body.aiMetadata?.accuracyScore || 90,
        lastAiReview: new Date().toISOString(),
        suggestedImprovements: body.aiMetadata?.suggestedImprovements || []
      }
    })

    return NextResponse.json({
      success: true,
      data: article
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating knowledge article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge article' },
      { status: 500 }
    )
  }
}
