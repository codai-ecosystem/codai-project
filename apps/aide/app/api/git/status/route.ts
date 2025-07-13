import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dirPath = searchParams.get('path') || process.cwd()

    // Security check
    const safePath = path.resolve(dirPath)
    if (!safePath.startsWith(process.cwd())) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    try {
      const gitStatus = await getGitStatus(safePath)
      return NextResponse.json({ gitStatus })
    } catch (error) {
      // Not a git repository or git not available
      return NextResponse.json({ gitStatus: {} })
    }
  } catch (error) {
    console.error('Git status error:', error)
    return NextResponse.json(
      { error: 'Failed to get git status' },
      { status: 500 }
    )
  }
}

async function getGitStatus(projectPath: string): Promise<Record<string, string>> {
  const { exec } = require('child_process')
  const { promisify } = require('util')
  const execAsync = promisify(exec)

  try {
    // Get git status in porcelain format
    const { stdout } = await execAsync('git status --porcelain', {
      cwd: projectPath
    })

    const statusMap: Record<string, string> = {}

    if (stdout) {
      const lines = stdout.split('\n').filter((line: string) => line.trim())

      for (const line of lines) {
        const status = line.substring(0, 2)
        const filePath = line.substring(3)

        let gitStatus = 'untracked'

        if (status === 'M ') gitStatus = 'modified'
        else if (status === 'A ') gitStatus = 'staged'
        else if (status === 'D ') gitStatus = 'deleted'
        else if (status === 'R ') gitStatus = 'renamed'
        else if (status === '??') gitStatus = 'untracked'
        else if (status === 'MM') gitStatus = 'modified'
        else if (status === 'AM') gitStatus = 'staged'

        statusMap[path.join(projectPath, filePath)] = gitStatus
      }
    }

    return statusMap
  } catch (error) {
    console.error('Git command failed:', error)
    return {}
  }
}
