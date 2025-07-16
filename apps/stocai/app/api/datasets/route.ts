import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { azureOpenAI } from '../../../lib/azure-openai'

// Simple ID generator without crypto dependency
const generateId = () => {
  return 'dataset-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface DatasetCreateRequest {
  name: string
  description?: string
  category?: string
  files?: any[]
  metadata?: Record<string, any>
}

// GET /api/datasets - List datasets or get specific dataset
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url || '', 'http://localhost')
    const { searchParams } = url
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const id = searchParams.get('id')

    // If requesting specific dataset by ID
    if (id) {
      const { data: dataset, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({
          success: false,
          error: 'Failed to retrieve dataset'
        }, { status: 500 })
      }

      if (!dataset) {
        return NextResponse.json({
          success: false,
          error: 'Dataset not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        dataset: dataset
      })
    }

    const offset = (page - 1) * limit

    // Build query for listing datasets
    let query = supabase
      .from('datasets')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: datasets, error, count } = await query

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve datasets'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      datasets: datasets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in datasets GET:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/datasets - Create new dataset
export async function POST(request: NextRequest) {
  try {
    const body: DatasetCreateRequest = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({
        success: false,
        error: 'Name is required'
      }, { status: 400 })
    }

    // Generate dataset ID
    const datasetId = generateId()

    // Generate AI analysis for the dataset
    let aiAnalysis = null
    try {
      const analysisPrompt = `Analyze this dataset:
Name: ${body.name}
Description: ${body.description || 'No description provided'}
Category: ${body.category || 'General'}
Files: ${body.files?.length || 0} files

Provide a brief analysis including:
1. Purpose and use cases
2. Data quality assessment
3. Potential insights
4. Recommendations

Respond in Romanian.`

      const completion = await azureOpenAI.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: analysisPrompt }],
        max_tokens: 500,
        temperature: 0.7
      })

      aiAnalysis = completion.choices[0]?.message?.content || null
    } catch (aiError) {
      console.warn('AI analysis failed:', aiError)
    }

    // Create dataset record
    const { data: dataset, error } = await supabase
      .from('datasets')
      .insert({
        id: datasetId,
        name: body.name,
        description: body.description || '',
        category: body.category || 'general',
        file_count: body.files?.length || 0,
        total_size: body.files?.reduce((sum: number, file: any) => sum + (file.size || 0), 0) || 0,
        ai_analysis: aiAnalysis,
        metadata: body.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create dataset'
      }, { status: 500 })
    }

    // Associate files with dataset if provided
    if (body.files && body.files.length > 0) {
      const fileAssociations = body.files.map((file: any) => ({
        dataset_id: dataset.id,
        file_id: file.id,
        file_path: file.path || file.name,
        created_at: new Date().toISOString()
      }))

      const { error: filesError } = await supabase
        .from('dataset_files')
        .insert(fileAssociations)

      if (filesError) {
        console.warn('Failed to associate files with dataset:', filesError)
      }
    }

    return NextResponse.json({
      success: true,
      dataset: dataset,
      aiAnalysis: aiAnalysis
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating dataset:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/datasets - Update dataset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, category, metadata } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Dataset ID is required'
      }, { status: 400 })
    }

    // Generate AI analysis for the updated dataset
    let aiAnalysis = null
    try {
      const analysisPrompt = `Analyze this updated dataset:
Name: ${name || 'Updated Dataset'}
Description: ${description || 'No description provided'}
Category: ${category || 'General'}

Provide a brief analysis including:
1. Purpose and use cases
2. Data quality assessment
3. Potential insights
4. Recommendations

Respond in Romanian.`

      const completion = await azureOpenAI.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: analysisPrompt }],
        max_tokens: 500,
        temperature: 0.7
      })

      aiAnalysis = completion.choices[0]?.message?.content || null
    } catch (aiError) {
      console.warn('AI analysis failed:', aiError)
    }

    const { data: dataset, error } = await supabase
      .from('datasets')
      .update({
        name,
        description,
        category,
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update dataset'
      }, { status: 500 })
    }

    if (!dataset) {
      return NextResponse.json({
        success: false,
        error: 'Dataset not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      dataset: dataset,
      aiAnalysis: aiAnalysis
    })
  } catch (error) {
    console.error('Error updating dataset:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/datasets - Delete dataset
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url || '', 'http://localhost')
    const { searchParams } = url
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Dataset ID is required'
      }, { status: 400 })
    }

    // Delete file associations first
    const { error: filesError } = await supabase
      .from('dataset_files')
      .delete()
      .eq('dataset_id', id)

    if (filesError) {
      console.warn('Failed to delete file associations:', filesError)
    }

    // Delete dataset
    const { error } = await supabase
      .from('datasets')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete dataset'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
