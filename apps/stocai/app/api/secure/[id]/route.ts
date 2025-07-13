import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/database'
import { SecurityManager } from '../../../../lib/security'

// GET /api/secure/[id] - Get secure document content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const ipAddress = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Retrieve and decrypt the document
    const { content, metadata } = await SecurityManager.getSecureDocument(
      documentId,
      userId,
      ipAddress
    )

    // Return the decrypted content as base64
    const base64Content = content.toString('base64')

    return NextResponse.json({
      content: base64Content,
      metadata
    })
  } catch (error) {
    console.error('Error retrieving secure document:', error)

    if (error instanceof Error && error.message === 'Access denied') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (error instanceof Error && error.message === 'Document has expired') {
      return NextResponse.json(
        { error: 'Document has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to retrieve secure document' },
      { status: 500 }
    )
  }
}

// DELETE /api/secure/[id] - Delete secure document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Check if user is the owner
    const { data: document, error: fetchError } = await supabase
      .from('secure_documents')
      .select('owner_id')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (document.owner_id !== userId) {
      return NextResponse.json(
        { error: 'Only document owner can delete' },
        { status: 403 }
      )
    }

    // Delete the document and associated data
    const { error: deleteError } = await supabase
      .from('secure_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete secure document' },
        { status: 500 }
      )
    }

    // Also delete encryption key
    await supabase
      .from('encryption_keys')
      .delete()
      .eq('owner_id', userId)

    // Log the deletion
    await SecurityManager.logAccess({
      documentId,
      userId,
      action: 'delete',
      timestamp: new Date(),
      success: true,
      details: { reason: 'Document deleted by owner' }
    })

    return NextResponse.json({
      message: 'Secure document deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting secure document:', error)
    return NextResponse.json(
      { error: 'Failed to delete secure document' },
      { status: 500 }
    )
  }
}
