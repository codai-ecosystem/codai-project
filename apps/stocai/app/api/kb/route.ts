import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/database'
import { AIProcessor } from '../../../lib/ai'
import { randomBytes } from 'crypto'

interface KnowledgeBaseCreateRequest {
  name: string
  description: string
  category: 'documentation' | 'research' | 'faq' | 'policies' | 'training' | 'general'
  isPublic: boolean
  settings: {
    aiEnabled: boolean
    autoSummarization: boolean
    semanticSearch: boolean
    multiLanguage: boolean
  }
  metadata?: Record<string, any>
}

interface KnowledgeBaseUpdateRequest {
  name?: string
  description?: string
  category?: 'documentation' | 'research' | 'faq' | 'policies' | 'training' | 'general'
  isPublic?: boolean
  settings?: {
    aiEnabled?: boolean
    autoSummarization?: boolean
    semanticSearch?: boolean
    multiLanguage?: boolean
  }
  metadata?: Record<string, any>
}

interface ArticleCreateRequest {
  title: string
  content: string
  tags: string[]
  category?: string
  isPublished: boolean
  metadata?: Record<string, any>
}

// GET /api/kb - List knowledge bases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')

    let query = supabase
      .from('knowledge_bases')
      .select(`
        *,
        articles:kb_articles(count)
      `)

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (userId) {
      query = query.eq('owner_id', userId)
    } else {
      // Only show public knowledge bases if no specific user
      query = query.eq('is_public', true)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data: knowledgeBases, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch knowledge bases' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      knowledgeBases: knowledgeBases || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching knowledge bases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/kb - Create new knowledge base
export async function POST(request: NextRequest) {
  try {
    const body: KnowledgeBaseCreateRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category' },
        { status: 400 }
      )
    }

    // Generate knowledge base ID
    const kbId = randomBytes(16).toString('hex')

    // Create knowledge base with AI-generated insights
    const summary = await AIProcessor.generateSummary(`Knowledge Base: ${body.name}. Description: ${body.description}`)
    const keywords = await AIProcessor.extractKeywords(`${body.name} ${body.description}`)

    const { data: knowledgeBase, error } = await supabase
      .from('knowledge_bases')
      .insert({
        id: kbId,
        name: body.name,
        description: body.description,
        category: body.category,
        is_public: body.isPublic || false,
        settings: body.settings || {
          aiEnabled: true,
          autoSummarization: true,
          semanticSearch: true,
          multiLanguage: false
        },
        metadata: body.metadata || {},
        article_count: 0,
        total_words: 0,
        ai_summary: summary,
        ai_keywords: keywords,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create knowledge base' },
        { status: 500 }
      )
    }

    return NextResponse.json(knowledgeBase, { status: 201 })
  } catch (error) {
    console.error('Error creating knowledge base:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/kb/[id] - Update knowledge base
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kbId = params.id
    const body: KnowledgeBaseUpdateRequest = await request.json()

    // Check if knowledge base exists
    const { data: existingKB, error: fetchError } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('id', kbId)
      .single()

    if (fetchError || !existingKB) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.name) updateData.name = body.name
    if (body.description) updateData.description = body.description
    if (body.category) updateData.category = body.category
    if (body.isPublic !== undefined) updateData.is_public = body.isPublic
    if (body.settings) updateData.settings = { ...existingKB.settings, ...body.settings }
    if (body.metadata) updateData.metadata = { ...existingKB.metadata, ...body.metadata }

    // Update AI insights if content changed
    if (body.name || body.description) {
      const content = `${body.name || existingKB.name} ${body.description || existingKB.description}`
      updateData.ai_summary = await AIProcessor.generateSummary(content)
      updateData.ai_keywords = await AIProcessor.extractKeywords(content)
    }

    const { data: knowledgeBase, error } = await supabase
      .from('knowledge_bases')
      .update(updateData)
      .eq('id', kbId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update knowledge base' },
        { status: 500 }
      )
    }

    return NextResponse.json(knowledgeBase)
  } catch (error) {
    console.error('Error updating knowledge base:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/kb/[id] - Delete knowledge base
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kbId = params.id

    // Check if knowledge base exists
    const { data: existingKB, error: fetchError } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('id', kbId)
      .single()

    if (fetchError || !existingKB) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      )
    }

    // Delete associated articles first
    const { error: articlesError } = await supabase
      .from('kb_articles')
      .delete()
      .eq('kb_id', kbId)

    if (articlesError) {
      console.error('Error deleting articles:', articlesError)
      return NextResponse.json(
        { error: 'Failed to delete knowledge base articles' },
        { status: 500 }
      )
    }

    // Delete the knowledge base
    const { error } = await supabase
      .from('knowledge_bases')
      .delete()
      .eq('id', kbId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete knowledge base' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Knowledge base deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting knowledge base:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
