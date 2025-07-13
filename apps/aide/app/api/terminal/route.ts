import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

interface TerminalCommand {
  command: string
  args?: string[]
  cwd?: string
  sessionId: string
}

// Store active terminal sessions
const terminalSessions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { command, args = [], cwd, sessionId }: TerminalCommand = await request.json()

    if (!command || !sessionId) {
      return NextResponse.json(
        { error: 'Command and sessionId required' },
        { status: 400 }
      )
    }

    // Security: Only allow safe commands
    const allowedCommands = [
      'ls', 'dir', 'pwd', 'cd', 'echo', 'cat', 'type',
      'npm', 'pnpm', 'yarn', 'node', 'git', 'help',
      'mkdir', 'touch', 'clear', 'cls'
    ]

    const baseCommand = command.split(' ')[0]
    if (!allowedCommands.includes(baseCommand)) {
      return NextResponse.json({
        output: `Command '${baseCommand}' is not allowed for security reasons.\nAllowed commands: ${allowedCommands.join(', ')}`,
        error: true,
        exitCode: 1
      })
    }

    // Set working directory
    const workingDir = cwd ? path.resolve(cwd) : process.cwd()

    // Security check for working directory
    if (!workingDir.startsWith(process.cwd())) {
      return NextResponse.json({
        output: 'Invalid working directory',
        error: true,
        exitCode: 1
      })
    }

    return new Promise((resolve) => {
      let output = ''
      let errorOutput = ''

      // Handle built-in commands
      if (baseCommand === 'clear' || baseCommand === 'cls') {
        resolve(NextResponse.json({
          output: '\x1b[2J\x1b[H', // ANSI clear screen
          error: false,
          exitCode: 0,
          sessionId
        }))
        return
      }

      if (baseCommand === 'pwd') {
        resolve(NextResponse.json({
          output: workingDir,
          error: false,
          exitCode: 0,
          sessionId
        }))
        return
      }

      // Parse command and arguments
      const fullCommand = command.trim()
      const [cmd, ...cmdArgs] = fullCommand.split(' ')

      // Execute command
      const process = spawn(cmd, cmdArgs, {
        cwd: workingDir,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      // Store session reference
      terminalSessions.set(sessionId, process)

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        errorOutput += data.toString()
      })

      process.on('close', (code) => {
        terminalSessions.delete(sessionId)

        resolve(NextResponse.json({
          output: output || errorOutput,
          error: code !== 0,
          exitCode: code,
          sessionId,
          command: fullCommand,
          cwd: workingDir
        }))
      })

      process.on('error', (err) => {
        terminalSessions.delete(sessionId)

        resolve(NextResponse.json({
          output: `Error executing command: ${err.message}`,
          error: true,
          exitCode: 1,
          sessionId
        }))
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        if (terminalSessions.has(sessionId)) {
          process.kill('SIGTERM')
          terminalSessions.delete(sessionId)

          resolve(NextResponse.json({
            output: output + '\nCommand timed out after 30 seconds',
            error: true,
            exitCode: 124,
            sessionId
          }))
        }
      }, 30000)
    })
  } catch (error) {
    console.error('Terminal API error:', error)
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    )
  }
}

// Get terminal session status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (sessionId) {
    const session = terminalSessions.get(sessionId)
    return NextResponse.json({
      sessionId,
      active: !!session,
      pid: session?.pid
    })
  }

  return NextResponse.json({
    activeSessions: Array.from(terminalSessions.keys()),
    totalSessions: terminalSessions.size
  })
}

// Kill terminal session
export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId required' },
        { status: 400 }
      )
    }

    const session = terminalSessions.get(sessionId)
    if (session) {
      session.kill('SIGTERM')
      terminalSessions.delete(sessionId)

      return NextResponse.json({
        success: true,
        message: 'Session terminated'
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Session not found'
    })
  } catch (error) {
    console.error('Terminal session termination error:', error)
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    )
  }
}
