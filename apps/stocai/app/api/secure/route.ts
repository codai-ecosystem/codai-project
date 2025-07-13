import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/database'
import { SecurityManager } from '../../../lib/security'

interface SecureDocumentCreateRequest {
  name: string
  content: string // Base64 encoded content
  type: string
  accessLevel: 'personal' | 'shared' | 'restricted'
  sharedWith?: string[]
  expiresAt?: string // ISO string
  metadata?: Record<string, any>
}

// GET /api/secure - List secure documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const accessLevel = searchParams.get('accessLevel')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('secure_documents')
      .select(`
        id,
        name,
        type,
        size,
        access_level,
        owner_id,
        shared_with,
        expires_at,
        created_at,
        updated_at,
        last_accessed
      `)

    // Only show documents user has access to
    query = query.or(`owner_id.eq.${userId},shared_with.cs.{${userId}}`)

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (accessLevel) {
      query = query.eq('access_level', accessLevel)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data: documents, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch secure documents' },
        { status: 500 }
      )
    }

    // Filter out expired documents
    const validDocuments = (documents || []).filter(doc => {
      if (!doc.expires_at) return true
      return new Date(doc.expires_at) > new Date()
    })

    return NextResponse.json({
      documents: validDocuments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching secure documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/secure - Create new secure document
export async function POST(request: NextRequest) {
  try {
    const body: SecureDocumentCreateRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.content || !body.type || !body.accessLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: name, content, type, accessLevel' },
        { status: 400 }
      )
    }

    // Get user ID from request (in production, this would come from authentication)
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Decode the content
    const content = Buffer.from(body.content, 'base64')

    // Create secure document with encryption
    const { documentId, encryptionKeyId, fileHash } = await SecurityManager.createSecureDocument(
      content,
      {
        name: body.name,
        type: body.type,
        ownerId: userId,
        accessLevel: body.accessLevel,
        sharedWith: body.sharedWith,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined
      }
    )

    return NextResponse.json({
      id: documentId,
      name: body.name,
      type: body.type,
      size: content.length,
      encryptionKeyId,
      fileHash,
      accessLevel: body.accessLevel,
      message: 'Secure document created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating secure document:', error)
    return NextResponse.json(
      { error: 'Failed to create secure document' },
      { status: 500 }
    )
  }
}
