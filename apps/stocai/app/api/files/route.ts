import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url || '', 'http://localhost')
    const { searchParams } = url
    const folder = searchParams.get('folder') || ''
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    // Handle both page and offset parameters
    let offset = parseInt(searchParams.get('offset') || '0')
    const page = searchParams.get('page')
    if (page) {
      offset = (parseInt(page) - 1) * limit
    }

    // Get files from database instead of storage list (which may not exist)
    let query = supabase
      .from('file_metadata')
      .select('*')

    if (search) {
      query = query.or(`file_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (folder) {
      query = query.eq('folder', folder)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: files, error } = await query

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch files'
      }, { status: 500 })
    }

    // Return files with URLs
    const enrichedFiles = files?.map(file => ({
      ...file,
      url: supabase.storage.from('files').getPublicUrl(file.file_id).data.publicUrl
    })) || []

    return NextResponse.json({
      success: true,
      files: enrichedFiles,
      pagination: {
        total: files?.length || 0,
        page: Math.floor(offset / limit) + 1,
        limit: limit,
        hasMore: (files?.length || 0) === limit
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
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
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 50MB.'
      }, { status: 400 })
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
      return NextResponse.json({
        success: false,
        error: uploadError.message
      }, { status: 500 })
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

    return NextResponse.json({
      success: true,
      data: {
        id: uploadData.path,
        name: file.name,
        size: file.size,
        type: file.type,
        url: supabase.storage.from('files').getPublicUrl(uploadData.path).data.publicUrl,
        metadata: metadata
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'File ID required'
      }, { status: 400 })
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([fileId])

    if (storageError) {
      return NextResponse.json({
        success: false,
        error: storageError.message
      }, { status: 500 })
    }

    // Delete metadata from database
    const { error: metadataError } = await supabase
      .from('file_metadata')
      .delete()
      .eq('file_id', fileId)

    if (metadataError) {
      console.warn('Failed to delete metadata:', metadataError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
