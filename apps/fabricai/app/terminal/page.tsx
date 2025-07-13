'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FabricAILayout from '../../components/layout/FabricAILayout'
import FabricAIService from '../../services/fabricaiService'
import {
    Terminal as TerminalIcon,
    Send,
    History,
    Save,
    Download,
    Upload,
    Settings,
    Maximize2,
    Minimize2,
    X,
    Play,
    Square,
    RotateCcw,
    Copy,
    Folder,
    FileText,
    Zap,
    Brain,
    Code,
    Database,
    Cloud,
    GitBranch,
    Package,
    Cpu,
    HardDrive,
    Network,
    Monitor
} from 'lucide-react'

interface TerminalSession {
    id: string
    name: string
    commands: TerminalCommand[]
    isActive: boolean
    created: string
}

interface TerminalCommand {
    id: string
    input: string
    output: string
    timestamp: string
    type: 'command' | 'ai_suggestion' | 'error' | 'success'
    executionTime?: number
}

interface AIContext {
    currentDirectory: string
    projectType: string
    lastCommand: string
    suggestedCommands: string[]
}

export default function TerminalPage() {
    const [sessions, setSessions] = useState<TerminalSession[]>([])
    const [activeSession, setActiveSession] = useState<string>('')
    const [currentCommand, setCurrentCommand] = useState('')
    const [isExecuting, setIsExecuting] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [showAISuggestions, setShowAISuggestions] = useState(true)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [aiContext, setAiContext] = useState<AIContext>({
        currentDirectory: '/workspace/fabricai',
        projectType: 'Next.js TypeScript',
        lastCommand: '',
        suggestedCommands: []
    })

    const terminalRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fabricaiService = FabricAIService.getInstance()

    const commonCommands = [
        'npm install',
        'npm run dev',
        'npm run build',
        'git status',
        'git add .',
        'git commit -m ""',
        'git push',
        'ls -la',
        'pwd',
        'clear'
    ]

    const aiSuggestions = [
        'Generate React component boilerplate',
        'Create API endpoint',
        'Setup database migration',
        'Configure deployment',
        'Run tests',
        'Generate documentation'
    ]

    useEffect(() => {
        initializeTerminal()
    }, [])

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
    }, [sessions])

    useEffect(() => {
        // Focus input when component mounts or active session changes
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [activeSession])

    const initializeTerminal = () => {
        const initialSession: TerminalSession = {
            id: 'session-1',
            name: 'Main Terminal',
            isActive: true,
            created: new Date().toISOString(),
            commands: [
                {
                    id: 'welcome',
                    input: '',
                    output: `Welcome to FabricAI Terminal 🚀

Current Directory: ${aiContext.currentDirectory}
Project Type: ${aiContext.projectType}
Node Version: v18.17.0
NPM Version: 9.6.7

Type 'help' for available commands or use AI suggestions below.`,
                    timestamp: new Date().toISOString(),
                    type: 'success'
                }
            ]
        }

        setSessions([initialSession])
        setActiveSession(initialSession.id)
        updateAISuggestions()
    }

    const updateAISuggestions = () => {
        setAiContext(prev => ({
            ...prev,
            suggestedCommands: [
                'npm run dev',
                'git status',
                'npm test',
                'npm run build'
            ]
        }))
    }

    const executeCommand = async (command: string) => {
        if (!command.trim()) return

        setIsExecuting(true)
        const timestamp = new Date().toISOString()
        const commandId = `cmd-${Date.now()}`

        // Add command to current session
        setSessions(prev => prev.map(session =>
            session.id === activeSession
                ? {
                    ...session,
                    commands: [
                        ...session.commands,
                        {
                            id: commandId,
                            input: command,
                            output: '',
                            timestamp,
                            type: 'command'
                        }
                    ]
                }
                : session
        ))

        // Simulate command execution
        setTimeout(() => {
            const output = generateCommandOutput(command)
            const executionTime = Math.floor(Math.random() * 1000) + 100

            setSessions(prev => prev.map(session =>
                session.id === activeSession
                    ? {
                        ...session,
                        commands: session.commands.map(cmd =>
                            cmd.id === commandId
                                ? {
                                    ...cmd,
                                    output,
                                    executionTime,
                                    type: getCommandType(command, output)
                                }
                                : cmd
                        )
                    }
                    : session
            ))

            setAiContext(prev => ({ ...prev, lastCommand: command }))
            updateAISuggestions()
            setIsExecuting(false)
        }, Math.random() * 2000 + 500)

        setCurrentCommand('')
    }

    const generateCommandOutput = (command: string): string => {
        const cmd = command.toLowerCase().trim()

        if (cmd === 'help') {
            return `Available commands:
  help          - Show this help message
  ls            - List directory contents
  pwd           - Show current directory
  cd <dir>      - Change directory
  npm <command> - Run npm commands
  git <command> - Run git commands
  clear         - Clear terminal
  ai <query>    - Ask AI assistant

Use AI suggestions for smart command recommendations.`
        }

        if (cmd === 'pwd') {
            return aiContext.currentDirectory
        }

        if (cmd === 'ls' || cmd === 'ls -la') {
            return `total 42
drwxr-xr-x  12 user  staff   384 Oct 25 10:30 .
drwxr-xr-x   5 user  staff   160 Oct 20 14:15 ..
-rw-r--r--   1 user  staff   123 Oct 25 10:30 .gitignore
-rw-r--r--   1 user  staff  1234 Oct 25 10:30 README.md
-rw-r--r--   1 user  staff  2345 Oct 25 10:30 package.json
drwxr-xr-x   8 user  staff   256 Oct 25 10:30 app
drwxr-xr-x   4 user  staff   128 Oct 25 10:30 components
drwxr-xr-x   3 user  staff    96 Oct 25 10:30 lib
drwxr-xr-x  15 user  staff   480 Oct 25 10:30 node_modules
-rw-r--r--   1 user  staff   567 Oct 25 10:30 tailwind.config.js
-rw-r--r--   1 user  staff   890 Oct 25 10:30 tsconfig.json`
        }

        if (cmd.startsWith('npm ')) {
            const npmCommand = cmd.substring(4)
            if (npmCommand === 'install') {
                return `npm WARN deprecated package@1.0.0: Package deprecated
added 1234 packages, and audited 5678 packages in 15s
found 0 vulnerabilities`
            }
            if (npmCommand === 'run dev') {
                return `> fabricai@1.0.0 dev
> next dev

▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000

✓ Ready in 2.1s`
            }
            if (npmCommand === 'run build') {
                return `> fabricai@1.0.0 build
> next build

Route (app)                              Size     First Load JS
┌ ○ /                                    142 B          87.2 kB
├ ○ /codegen                             1.2 kB         88.3 kB
├ ○ /models                              1.1 kB         88.2 kB
├ ○ /projects                            1.3 kB         88.4 kB
└ ○ /templates                           1.4 kB         88.5 kB

○  (Static)  automatically rendered as static HTML (uses no initial props)

✓ Compiled successfully`
            }
        }

        if (cmd.startsWith('git ')) {
            const gitCommand = cmd.substring(4)
            if (gitCommand === 'status') {
                return `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   app/terminal/page.tsx
        modified:   components/layout/FabricAILayout.tsx

no changes added to commit (use "git add" to stage changes)`
            }
            if (gitCommand === 'add .') {
                return 'Changes staged for commit.'
            }
        }

        if (cmd === 'clear') {
            // Handle clear separately
            return '[CLEAR]'
        }

        if (cmd.startsWith('ai ')) {
            const query = cmd.substring(3)
            return `🤖 AI Assistant: Based on your query "${query}", here are some suggestions:

1. For component creation: npx create-component MyComponent
2. For API endpoint: mkdir -p app/api/${query} && touch app/api/${query}/route.ts
3. For database setup: npm install prisma && npx prisma init

Would you like me to execute any of these commands?`
        }

        return `Command '${command}' executed successfully.
Output would appear here in a real terminal environment.
Execution time: ${Math.floor(Math.random() * 1000)}ms`
    }

    const getCommandType = (command: string, output: string): 'command' | 'ai_suggestion' | 'error' | 'success' => {
        if (command.startsWith('ai ')) return 'ai_suggestion'
        if (output.includes('error') || output.includes('Error')) return 'error'
        if (output.includes('✓') || output.includes('successfully')) return 'success'
        return 'command'
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            executeCommand(currentCommand)
        }
    }

    const createNewSession = () => {
        const newSession: TerminalSession = {
            id: `session-${Date.now()}`,
            name: `Terminal ${sessions.length + 1}`,
            isActive: false,
            created: new Date().toISOString(),
            commands: []
        }

        setSessions(prev => [...prev, newSession])
        setActiveSession(newSession.id)
    }

    const closeSession = (sessionId: string) => {
        if (sessions.length === 1) return // Don't close last session

        setSessions(prev => prev.filter(s => s.id !== sessionId))
        if (activeSession === sessionId) {
            setActiveSession(sessions.find(s => s.id !== sessionId)?.id || '')
        }
    }

    const clearTerminal = () => {
        setSessions(prev => prev.map(session =>
            session.id === activeSession
                ? { ...session, commands: [] }
                : session
        ))
    }

    const getCurrentSession = () => sessions.find(s => s.id === activeSession)

    const getCommandIcon = (type: string) => {
        switch (type) {
            case 'ai_suggestion':
                return Brain
            case 'error':
                return X
            case 'success':
                return Play
            default:
                return TerminalIcon
        }
    }

    const getCommandColor = (type: string) => {
        switch (type) {
            case 'ai_suggestion':
                return 'text-purple-400'
            case 'error':
                return 'text-red-400'
            case 'success':
                return 'text-emerald-400'
            default:
                return 'text-blue-400'
        }
    }

    return (
        <FabricAILayout>
            <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-slate-900' : 'p-6'}`}>
                <div className="h-full flex flex-col space-y-6">
                    {/* Header */}
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <TerminalIcon className="w-8 h-8 text-emerald-400" />
                                <div>
                                    <h1 className="text-3xl font-bold text-white">AI Terminal</h1>
                                    <p className="text-slate-300">AI-powered development terminal</p>
                                </div>
                            </div>

                            {/* Session Tabs */}
                            <div className="flex space-x-2 ml-8">
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${session.id === activeSession
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-white/10 text-slate-400 hover:bg-white/15'
                                            }`}
                                        onClick={() => setActiveSession(session.id)}
                                    >
                                        <span className="text-sm">{session.name}</span>
                                        {sessions.length > 1 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    closeSession(session.id)
                                                }}
                                                className="p-1 hover:bg-red-500/20 rounded"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={createNewSession}
                                    className="p-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                                >
                                    <Play className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <motion.button
                                className="p-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowHistory(!showHistory)}
                            >
                                <History className="w-5 h-5 text-slate-400" />
                            </motion.button>

                            <motion.button
                                className="p-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={clearTerminal}
                            >
                                <RotateCcw className="w-5 h-5 text-slate-400" />
                            </motion.button>

                            <motion.button
                                className="p-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsFullScreen(!isFullScreen)}
                            >
                                {isFullScreen ? (
                                    <Minimize2 className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <Maximize2 className="w-5 h-5 text-slate-400" />
                                )}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Main Terminal Area */}
                    <div className="flex-1 flex space-x-6">
                        {/* Terminal Window */}
                        <motion.div
                            className="flex-1 bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-mono">
                                        {getCurrentSession()?.name || 'Terminal'}
                                    </span>
                                </div>

                                <div className="text-slate-400 text-sm font-mono">
                                    {aiContext.currentDirectory}
                                </div>
                            </div>

                            {/* Terminal Content */}
                            <div
                                ref={terminalRef}
                                className="flex-1 p-4 font-mono text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                                style={{ minHeight: '400px' }}
                            >
                                {getCurrentSession()?.commands.map((command, index) => {
                                    const CommandIcon = getCommandIcon(command.type)

                                    return (
                                        <motion.div
                                            key={command.id}
                                            className="mb-4"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            {command.input && (
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-emerald-400">→</span>
                                                    <span className="text-white">{command.input}</span>
                                                    {command.executionTime && (
                                                        <span className="text-slate-500 text-xs">
                                                            ({command.executionTime}ms)
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {command.output && command.output !== '[CLEAR]' && (
                                                <div className={`pl-6 whitespace-pre-wrap ${getCommandColor(command.type)}`}>
                                                    {command.output}
                                                </div>
                                            )}
                                        </motion.div>
                                    )
                                })}

                                {isExecuting && (
                                    <motion.div
                                        className="flex items-center space-x-3 text-yellow-400"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <motion.div
                                            className="w-2 h-2 bg-yellow-400 rounded-full"
                                            animate={{ scale: [1, 1.5, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                        <span>Executing command...</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Command Input */}
                            <div className="p-4 border-t border-white/20">
                                <div className="flex items-center space-x-3">
                                    <span className="text-emerald-400 font-mono">→</span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={currentCommand}
                                        onChange={(e) => setCurrentCommand(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter command or ask AI..."
                                        className="flex-1 bg-transparent text-white font-mono focus:outline-none placeholder-slate-500"
                                        disabled={isExecuting}
                                    />
                                    <motion.button
                                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => executeCommand(currentCommand)}
                                        disabled={isExecuting || !currentCommand.trim()}
                                    >
                                        <Send className="w-4 h-4 text-emerald-400" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Suggestions Panel */}
                        {showAISuggestions && (
                            <motion.div
                                className="w-80 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center space-x-3 mb-6">
                                    <Brain className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-white font-semibold">AI Suggestions</h3>
                                </div>

                                {/* Quick Commands */}
                                <div className="mb-6">
                                    <h4 className="text-slate-300 text-sm mb-3">Quick Commands</h4>
                                    <div className="space-y-2">
                                        {aiContext.suggestedCommands.map((cmd, index) => (
                                            <motion.button
                                                key={index}
                                                className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-mono text-slate-300"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setCurrentCommand(cmd)}
                                            >
                                                {cmd}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Actions */}
                                <div className="mb-6">
                                    <h4 className="text-slate-300 text-sm mb-3">AI Actions</h4>
                                    <div className="space-y-2">
                                        {aiSuggestions.map((suggestion, index) => (
                                            <motion.button
                                                key={index}
                                                className="w-full text-left p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors text-sm text-purple-300"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setCurrentCommand(`ai ${suggestion.toLowerCase()}`)}
                                            >
                                                {suggestion}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* System Info */}
                                <div className="border-t border-white/20 pt-4">
                                    <h4 className="text-slate-300 text-sm mb-3">System Info</h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">CPU</span>
                                            <span className="text-emerald-400">45%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Memory</span>
                                            <span className="text-yellow-400">2.1GB</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Disk</span>
                                            <span className="text-blue-400">156GB</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Network</span>
                                            <span className="text-purple-400">Online</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </FabricAILayout>
    )
}
