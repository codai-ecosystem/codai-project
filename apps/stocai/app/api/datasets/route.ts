import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/database'
import { AIProcessor } from '../../../lib/ai'
import { randomBytes } from 'crypto'

interface DatasetCreateRequest {
  name: string
  description: string
  type: 'csv' | 'json' | 'parquet' | 'excel' | 'text'
  tags: string[]
  isPublic: boolean
  metadata?: Record<string, any>
}

interface DatasetUpdateRequest {
  name?: string
  description?: string
  tags?: string[]
  isPublic?: boolean
  metadata?: Record<string, any>
}

// GET /api/datasets - List datasets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const tag = searchParams.get('tag')
    const userId = searchParams.get('userId')

    let query = supabase
      .from('datasets')
      .select(`
        *,
        files:dataset_files(count)
      `)

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (userId) {
      query = query.eq('owner_id', userId)
    } else {
      // Only show public datasets if no specific user
      query = query.eq('is_public', true)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data: datasets, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch datasets' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      datasets: datasets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/datasets - Create new dataset
export async function POST(request: NextRequest) {
  try {
    const body: DatasetCreateRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.description || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, type' },
        { status: 400 }
      )
    }

    // Generate dataset ID
    const datasetId = randomBytes(16).toString('hex')

    // Create dataset with AI-generated insights
    const summary = await AIProcessor.generateSummary(`Dataset: ${body.name}. Description: ${body.description}`)
    const keywords = await AIProcessor.extractKeywords(`${body.name} ${body.description}`)

    const { data: dataset, error } = await supabase
      .from('datasets')
      .insert({
        id: datasetId,
        name: body.name,
        description: body.description,
        type: body.type,
        tags: body.tags || [],
        is_public: body.isPublic || false,
        metadata: body.metadata || {},
        file_count: 0,
        total_size: 0,
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
        { error: 'Failed to create dataset' },
        { status: 500 }
      )
    }

    return NextResponse.json(dataset, { status: 201 })
  } catch (error) {
    console.error('Error creating dataset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/datasets/[id] - Update dataset
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datasetId = params.id
    const body: DatasetUpdateRequest = await request.json()

    // Check if dataset exists
    const { data: existingDataset, error: fetchError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (fetchError || !existingDataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.name) updateData.name = body.name
    if (body.description) updateData.description = body.description
    if (body.tags) updateData.tags = body.tags
    if (body.isPublic !== undefined) updateData.is_public = body.isPublic
    if (body.metadata) updateData.metadata = { ...existingDataset.metadata, ...body.metadata }

    // Update AI insights if content changed
    if (body.name || body.description) {
      const content = `${body.name || existingDataset.name} ${body.description || existingDataset.description}`
      updateData.ai_summary = await AIProcessor.generateSummary(content)
      updateData.ai_keywords = await AIProcessor.extractKeywords(content)
    }

    const { data: dataset, error } = await supabase
      .from('datasets')
      .update(updateData)
      .eq('id', datasetId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update dataset' },
        { status: 500 }
      )
    }

    return NextResponse.json(dataset)
  } catch (error) {
    console.error('Error updating dataset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/datasets/[id] - Delete dataset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datasetId = params.id

    // Check if dataset exists
    const { data: existingDataset, error: fetchError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (fetchError || !existingDataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Delete associated files first
    const { error: filesError } = await supabase
      .from('dataset_files')
      .delete()
      .eq('dataset_id', datasetId)

    if (filesError) {
      console.error('Error deleting dataset files:', filesError)
      return NextResponse.json(
        { error: 'Failed to delete dataset files' },
        { status: 500 }
      )
    }

    // Delete the dataset
    const { error } = await supabase
      .from('datasets')
      .delete()
      .eq('id', datasetId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete dataset' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Dataset deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
