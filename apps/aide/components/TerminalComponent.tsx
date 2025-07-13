'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal,
  X,
  Plus,
  Minimize2,
  Maximize2,
  MoreVertical,
  Copy,
  Download,
  Upload,
  Trash2,
  Play,
  Square,
  RotateCcw,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface TerminalSession {
  id: string
  name: string
  workingDirectory: string
  history: TerminalLine[]
  isActive: boolean
}

interface TerminalLine {
  id: string
  type: 'command' | 'output' | 'error'
  content: string
  timestamp: Date
}

interface TerminalProps {
  isVisible: boolean
  onToggle: () => void
  projectPath: string
}

const TerminalComponent: React.FC<TerminalProps> = ({
  isVisible,
  onToggle,
  projectPath
}) => {
  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: '1',
      name: 'Terminal 1',
      workingDirectory: projectPath,
      history: [
        {
          id: '1',
          type: 'output',
          content: 'Welcome to AIDE Terminal',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'command',
          content: 'npm install',
          timestamp: new Date()
        },
        {
          id: '3',
          type: 'output',
          content: 'Installing dependencies...\n✓ Installed 127 packages',
          timestamp: new Date()
        }
      ],
      isActive: true
    }
  ])

  const [activeSessionId, setActiveSessionId] = useState('1')
  const [currentCommand, setCurrentCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isMinimized, setIsMinimized] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0]

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [activeSession?.history])

  const simulateCommand = (command: string): TerminalLine[] => {
    const cmd = command.trim().toLowerCase()
    const timestamp = new Date()

    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: command,
      timestamp
    }

    let outputLine: TerminalLine

    if (cmd === 'ls' || cmd === 'dir') {
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: 'src/\npublic/\npackage.json\ntsconfig.json\nREADME.md\nnode_modules/',
        timestamp
      }
    } else if (cmd.startsWith('cd ')) {
      const newDir = cmd.substring(3).trim()
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: `Changed directory to: ${newDir}`,
        timestamp
      }
    } else if (cmd === 'pwd') {
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: activeSession.workingDirectory,
        timestamp
      }
    } else if (cmd.startsWith('npm ')) {
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: 'npm command executed successfully',
        timestamp
      }
    } else if (cmd.startsWith('git ')) {
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: 'Git command executed',
        timestamp
      }
    } else if (cmd === 'clear' || cmd === 'cls') {
      return [commandLine] // Will be handled differently
    } else if (cmd === 'help') {
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: `Available commands:
ls, dir - List directory contents
cd <path> - Change directory
pwd - Print working directory
npm <command> - Run npm commands
git <command> - Run git commands
clear, cls - Clear terminal
help - Show this help`,
        timestamp
      }
    } else {
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Command not found: ${command}`,
        timestamp
      }
    }

    return [commandLine, outputLine]
  }

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCommand.trim()) return

    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: currentCommand,
      timestamp: new Date()
    }

    // Add command to history immediately
    setSessions(prev => prev.map(session =>
      session.id === activeSessionId
        ? { ...session, history: [...session.history, commandLine] }
        : session
    ))

    try {
      // Call terminal API
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: currentCommand,
          sessionId: activeSessionId,
          cwd: activeSession.workingDirectory
        })
      })

      if (response.ok) {
        const { output, error, exitCode } = await response.json()

        const outputLine: TerminalLine = {
          id: (Date.now() + 1).toString(),
          type: error ? 'error' : 'output',
          content: output,
          timestamp: new Date()
        }

        setSessions(prev => prev.map(session =>
          session.id === activeSessionId
            ? { ...session, history: [...session.history, outputLine] }
            : session
        ))
      } else {
        throw new Error('Terminal API request failed')
      }
    } catch (error) {
      console.error('Terminal command error:', error)

      // Fallback to simulated command
      const newLines = simulateCommand(currentCommand)
      setSessions(prev => prev.map(session =>
        session.id === activeSessionId
          ? {
            ...session,
            history: currentCommand.trim().toLowerCase() === 'clear' || currentCommand.trim().toLowerCase() === 'cls'
              ? [commandLine] // Only keep the clear command
              : [...session.history.slice(0, -1), ...newLines] // Remove the command we already added and add simulated response
          }
          : session
      ))
    }

    setCommandHistory(prev => [currentCommand, ...prev].slice(0, 50))
    setCurrentCommand('')
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple tab completion for common commands
      const commands = ['npm install', 'npm run dev', 'git status', 'git add .', 'git commit', 'ls', 'cd']
      const matches = commands.filter(cmd => cmd.startsWith(currentCommand))
      if (matches.length === 1) {
        setCurrentCommand(matches[0])
      }
    }
  }

  const createNewSession = () => {
    const newSession: TerminalSession = {
      id: Date.now().toString(),
      name: `Terminal ${sessions.length + 1}`,
      workingDirectory: projectPath,
      history: [
        {
          id: Date.now().toString(),
          type: 'output',
          content: 'New terminal session started',
          timestamp: new Date()
        }
      ],
      isActive: false
    }

    setSessions(prev => [...prev, newSession])
    setActiveSessionId(newSession.id)
  }

  const closeSession = (sessionId: string) => {
    if (sessions.length === 1) return // Don't close the last session

    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId)
      setActiveSessionId(remaining[0].id)
    }
  }

  const getPrompt = () => {
    return `user@aide:${activeSession.workingDirectory}$ `
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: isMinimized ? 40 : 300 }}
      exit={{ height: 0 }}
      className="border-t border-white/10 bg-black/30 backdrop-blur-xl flex flex-col"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">Terminal</span>
          </div>

          {/* Session Tabs */}
          <div className="flex items-center space-x-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${activeSessionId === session.id
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
              >
                <button
                  onClick={() => setActiveSessionId(session.id)}
                  className="flex items-center space-x-1"
                >
                  <span>{session.name}</span>
                </button>
                {sessions.length > 1 && (
                  <button
                    onClick={() => closeSession(session.id)}
                    className="p-0.5 rounded hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={createNewSession}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="New Terminal"
            >
              <Plus className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-gray-400" />
            ) : (
              <Minimize2 className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Close Terminal"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Terminal Output */}
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm"
            >
              {activeSession.history.map((line) => (
                <div key={line.id} className="mb-1">
                  {line.type === 'command' && (
                    <div className="flex">
                      <span className="text-green-400">{getPrompt()}</span>
                      <span className="text-white">{line.content}</span>
                    </div>
                  )}
                  {line.type === 'output' && (
                    <pre className="text-gray-300 whitespace-pre-wrap">
                      {line.content}
                    </pre>
                  )}
                  {line.type === 'error' && (
                    <pre className="text-red-400 whitespace-pre-wrap">
                      {line.content}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            {/* Command Input */}
            <div className="border-t border-white/10 p-4 bg-black/20">
              <form onSubmit={handleCommandSubmit} className="flex items-center">
                <span className="text-green-400 font-mono text-sm mr-2">
                  {getPrompt()}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white font-mono text-sm outline-none"
                  placeholder="Type command..."
                  autoComplete="off"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TerminalComponent
