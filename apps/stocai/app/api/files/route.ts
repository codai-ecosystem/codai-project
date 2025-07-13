import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || ''
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get files from Supabase Storage
    const { data: files, error } = await supabase.storage
      .from('files')
      .list(folder, {
        limit,
        offset,
        search
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get file metadata from database
    const fileIds = files?.map(file => file.id) || []
    const { data: metadata, error: metadataError } = await supabase
      .from('file_metadata')
      .select('*')
      .in('file_id', fileIds)

    if (metadataError) {
      console.warn('Failed to fetch metadata:', metadataError.message)
    }

    // Merge files with metadata
    const enrichedFiles = files?.map(file => {
      const meta = metadata?.find(m => m.file_id === file.id)
      return {
        ...file,
        tags: meta?.tags || [],
        description: meta?.description || '',
        ai_summary: meta?.ai_summary || '',
        custom_metadata: meta?.custom_metadata || {}
      }
    })

    return NextResponse.json({
      files: enrichedFiles,
      total: files?.length || 0,
      has_more: (files?.length || 0) >= limit
    })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || ''
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const description = formData.get('description') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${folder}${folder ? '/' : ''}${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Save metadata to database
    const { data: metadata, error: metadataError } = await supabase
      .from('file_metadata')
      .insert({
        file_id: uploadData.path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        folder: folder,
        tags: tags,
        description: description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (metadataError) {
      console.warn('Failed to save metadata:', metadataError.message)
    }

    // Generate AI summary for text files
    if (file.type.startsWith('text/') || file.type === 'application/pdf') {
      // TODO: Implement AI summarization
      // This would use OpenAI API to generate summaries
    }

    return NextResponse.json({
      file: {
        id: uploadData.path,
        name: file.name,
        size: file.size,
        type: file.type,
        url: supabase.storage.from('files').getPublicUrl(uploadData.path).data.publicUrl,
        metadata: metadata
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([fileId])

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 })
    }

    // Delete metadata from database
    const { error: metadataError } = await supabase
      .from('file_metadata')
      .delete()
      .eq('file_id', fileId)

    if (metadataError) {
      console.warn('Failed to delete metadata:', metadataError.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
