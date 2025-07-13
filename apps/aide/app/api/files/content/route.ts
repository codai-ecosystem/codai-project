import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 })
    }

    // Security check
    const safePath = path.resolve(filePath)
    if (!safePath.startsWith(process.cwd())) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    const content = await fs.readFile(safePath, 'utf-8')
    const stats = await fs.stat(safePath)

    return NextResponse.json({
      content,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      path: safePath
    })
  } catch (error) {
    console.error('File read error:', error)
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { path: filePath, content } = await request.json()

    if (!filePath || content === undefined) {
      return NextResponse.json(
        { error: 'File path and content required' },
        { status: 400 }
      )
    }

    // Security check
    const safePath = path.resolve(filePath)
    if (!safePath.startsWith(process.cwd())) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    // Ensure directory exists
    const dirPath = path.dirname(safePath)
    await fs.mkdir(dirPath, { recursive: true })

    // Write file
    await fs.writeFile(safePath, content, 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'File saved successfully',
      path: safePath
    })
  } catch (error) {
    console.error('File write error:', error)
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    )
  }
}
