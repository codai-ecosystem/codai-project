import { NextRequest, NextResponse } from 'next/server'
import { RealStorageService } from '@/services/RealStorageService'

const storageService = RealStorageService.getInstance()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id
    const body = await request.json()
    const { metadata } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }

    const updatedFile = await storageService.updateFileMetadata(id, metadata)

    if (!updatedFile) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedFile
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }

    await storageService.deleteFile(id)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
