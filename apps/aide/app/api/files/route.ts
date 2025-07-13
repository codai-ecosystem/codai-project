import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dirPath = searchParams.get('path') || process.cwd()

    // Security check - prevent directory traversal
    const safePath = path.resolve(dirPath)
    if (!safePath.startsWith(process.cwd())) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    const entries = await fs.readdir(safePath, { withFileTypes: true })

    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(safePath, entry.name)
        const stats = await fs.stat(fullPath)

        return {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          permissions: stats.mode
        }
      })
    )

    return NextResponse.json({ files })
  } catch (error) {
    console.error('File system error:', error)
    return NextResponse.json(
      { error: 'Failed to read directory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, path: filePath, content, newPath } = await request.json()

    // Security check
    const safePath = path.resolve(filePath)
    if (!safePath.startsWith(process.cwd())) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    switch (action) {
      case 'create_file':
        await fs.writeFile(safePath, content || '')
        return NextResponse.json({ success: true, message: 'File created' })

      case 'create_directory':
        await fs.mkdir(safePath, { recursive: true })
        return NextResponse.json({ success: true, message: 'Directory created' })

      case 'delete':
        const stats = await fs.stat(safePath)
        if (stats.isDirectory()) {
          await fs.rmdir(safePath, { recursive: true })
        } else {
          await fs.unlink(safePath)
        }
        return NextResponse.json({ success: true, message: 'Deleted successfully' })

      case 'rename':
        if (!newPath) {
          return NextResponse.json({ error: 'New path required' }, { status: 400 })
        }
        const safeNewPath = path.resolve(newPath)
        if (!safeNewPath.startsWith(process.cwd())) {
          return NextResponse.json({ error: 'Invalid new path' }, { status: 403 })
        }
        await fs.rename(safePath, safeNewPath)
        return NextResponse.json({ success: true, message: 'Renamed successfully' })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('File operation error:', error)
    return NextResponse.json(
      { error: 'File operation failed' },
      { status: 500 }
    )
  }
}
