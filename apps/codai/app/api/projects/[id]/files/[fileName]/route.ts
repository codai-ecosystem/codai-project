import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Helper function to get workspace root
function getWorkspaceRoot(): string {
  let workspaceRoot = process.cwd()
  if (workspaceRoot.includes('apps')) {
    workspaceRoot = path.join(workspaceRoot, '..', '..')
  }
  return workspaceRoot
}

// Helper function to validate file access
function isValidFilePath(projectPath: string, fileName: string): boolean {
  const fullPath = path.join(projectPath, fileName)
  const normalizedPath = path.normalize(fullPath)

  // Ensure the file is within the project directory
  if (!normalizedPath.startsWith(path.normalize(projectPath))) {
    return false
  }

  // Block access to sensitive files and directories
  const blockedPaths = [
    'node_modules',
    '.git',
    '.env',
    '.env.local',
    '.env.production',
    '.env.development'
  ]

  return !blockedPaths.some(blocked =>
    normalizedPath.includes(path.sep + blocked + path.sep) ||
    normalizedPath.endsWith(path.sep + blocked) ||
    normalizedPath.includes(path.sep + blocked)
  )
}

// Helper function to detect if file is binary
function isBinaryFile(fileName: string): boolean {
  const binaryExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.rar', '.tar', '.gz', '.7z',
    '.exe', '.dll', '.so', '.dylib',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv',
    '.ttf', '.otf', '.woff', '.woff2'
  ]

  const ext = path.extname(fileName).toLowerCase()
  return binaryExtensions.includes(ext)
}

// GET: Read file content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; fileName: string } }
) {
  try {
    const projectId = params.id
    const fileName = decodeURIComponent(params.fileName)

    if (!projectId || !fileName) {
      return NextResponse.json(
        { error: 'Project ID and file name are required' },
        { status: 400 }
      )
    }

    // Parse project ID
    const [type, projectName] = projectId.split('-', 2)

    if (!type || !projectName) {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      )
    }

    const workspaceRoot = getWorkspaceRoot()
    const projectDir = type === 'app' ? path.join(workspaceRoot, 'apps') : path.join(workspaceRoot, 'packages')
    const projectPath = path.join(projectDir, projectName)

    // Validate file access
    if (!isValidFilePath(projectPath, fileName)) {
      return NextResponse.json(
        { error: 'Access to this file is not allowed' },
        { status: 403 }
      )
    }

    const filePath = path.join(projectPath, fileName)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if it's a binary file
    if (isBinaryFile(fileName)) {
      return NextResponse.json(
        { error: 'Binary files cannot be viewed in the editor' },
        { status: 400 }
      )
    }

    // Read file content
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const stats = await fs.stat(filePath)

      return NextResponse.json({
        content,
        fileName,
        size: stats.size,
        lastModified: stats.mtime,
        encoding: 'utf8'
      })

    } catch (error) {
      console.error('Error reading file:', error)
      return NextResponse.json(
        { error: 'Failed to read file content' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in GET /api/projects/[id]/files/[fileName]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update file content
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; fileName: string } }
) {
  try {
    const projectId = params.id
    const fileName = decodeURIComponent(params.fileName)
    const { content } = await request.json()

    if (!projectId || !fileName) {
      return NextResponse.json(
        { error: 'Project ID and file name are required' },
        { status: 400 }
      )
    }

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'File content must be a string' },
        { status: 400 }
      )
    }

    // Parse project ID
    const [type, projectName] = projectId.split('-', 2)

    if (!type || !projectName) {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      )
    }

    const workspaceRoot = getWorkspaceRoot()
    const projectDir = type === 'app' ? path.join(workspaceRoot, 'apps') : path.join(workspaceRoot, 'packages')
    const projectPath = path.join(projectDir, projectName)

    // Validate file access
    if (!isValidFilePath(projectPath, fileName)) {
      return NextResponse.json(
        { error: 'Access to this file is not allowed' },
        { status: 403 }
      )
    }

    const filePath = path.join(projectPath, fileName)

    // Check if it's a binary file
    if (isBinaryFile(fileName)) {
      return NextResponse.json(
        { error: 'Binary files cannot be edited' },
        { status: 400 }
      )
    }

    // Create backup of original file if it exists
    let backupContent: string | null = null
    try {
      backupContent = await fs.readFile(filePath, 'utf8')
    } catch {
      // File doesn't exist, which is fine for new files
    }

    // Write file content
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true })

      // Write the file
      await fs.writeFile(filePath, content, 'utf8')

      const stats = await fs.stat(filePath)

      return NextResponse.json({
        message: 'File saved successfully',
        fileName,
        size: stats.size,
        lastModified: stats.mtime
      })

    } catch (error) {
      console.error('Error writing file:', error)

      // Try to restore backup if write failed
      if (backupContent !== null) {
        try {
          await fs.writeFile(filePath, backupContent, 'utf8')
        } catch {
          // Backup restore failed, but we already logged the original error
        }
      }

      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in PUT /api/projects/[id]/files/[fileName]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileName: string } }
) {
  try {
    const projectId = params.id
    const fileName = decodeURIComponent(params.fileName)

    if (!projectId || !fileName) {
      return NextResponse.json(
        { error: 'Project ID and file name are required' },
        { status: 400 }
      )
    }

    // Parse project ID
    const [type, projectName] = projectId.split('-', 2)

    if (!type || !projectName) {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      )
    }

    const workspaceRoot = getWorkspaceRoot()
    const projectDir = type === 'app' ? path.join(workspaceRoot, 'apps') : path.join(workspaceRoot, 'packages')
    const projectPath = path.join(projectDir, projectName)

    // Validate file access
    if (!isValidFilePath(projectPath, fileName)) {
      return NextResponse.json(
        { error: 'Access to this file is not allowed' },
        { status: 403 }
      )
    }

    const filePath = path.join(projectPath, fileName)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete file
    try {
      await fs.unlink(filePath)

      return NextResponse.json({
        message: 'File deleted successfully',
        fileName
      })

    } catch (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]/files/[fileName]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
