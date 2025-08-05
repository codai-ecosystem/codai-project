'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Command, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  BarChart3,
  Settings,
  Plus,
  ArrowRight
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: 'navigation' | 'actions' | 'search'
  shortcut?: string
  action: () => void
}

interface CommandPaletteProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

const mockCommands: CommandItem[] = [
  {
    id: 'nav-overview',
    title: 'Go to Overview',
    description: 'Navigate to dashboard overview',
    icon: BarChart3,
    category: 'navigation',
    shortcut: 'g o',
    action: () => console.log('Navigate to overview')
  },
  {
    id: 'nav-projects',
    title: 'Go to Projects',
    description: 'Navigate to projects view',
    icon: FolderKanban,
    category: 'navigation',
    shortcut: 'g p',
    action: () => console.log('Navigate to projects')
  },
  {
    id: 'nav-tasks',
    title: 'Go to Tasks',
    description: 'Navigate to task board',
    icon: CheckSquare,
    category: 'navigation',
    shortcut: 'g t',
    action: () => console.log('Navigate to tasks')
  },
  {
    id: 'nav-agents',
    title: 'Go to Agents',
    description: 'Navigate to agent monitor',
    icon: Users,
    category: 'navigation',
    shortcut: 'g a',
    action: () => console.log('Navigate to agents')
  },
  {
    id: 'action-new-project',
    title: 'Create New Project',
    description: 'Start a new project',
    icon: Plus,
    category: 'actions',
    shortcut: 'n p',
    action: () => console.log('Create new project')
  },
  {
    id: 'action-new-task',
    title: 'Create New Task',
    description: 'Add a new task',
    icon: Plus,
    category: 'actions',
    shortcut: 'n t',
    action: () => console.log('Create new task')
  },
  {
    id: 'nav-settings',
    title: 'Open Settings',
    description: 'Configure dashboard settings',
    icon: Settings,
    category: 'navigation',
    shortcut: 'g s',
    action: () => console.log('Open settings')
  }
]

export function CommandPalette({ isOpen = false, onClose, className = '' }: CommandPaletteProps) {
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredCommands = React.useMemo(() => {
    if (!query) return mockCommands

    return mockCommands.filter(command =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose?.()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onClose?.()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  const groupedCommands = React.useMemo(() => {
    return filteredCommands.reduce((groups, command) => {
      if (!groups[command.category]) {
        groups[command.category] = []
      }
      groups[command.category].push(command)
      return groups
    }, {} as Record<string, CommandItem[]>)
  }, [filteredCommands])

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    search: 'Search'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className={`
            w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl 
            border border-gray-200 dark:border-gray-700 overflow-hidden ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">ESC</kbd>
            </div>
          </div>

          {/* Commands */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No commands found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try searching for something else
                </p>
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedCommands).map(([category, commands]) => (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </div>
                    {commands.map((command, commandIndex) => {
                      const globalIndex = filteredCommands.indexOf(command)
                      const isSelected = globalIndex === selectedIndex
                      const Icon = command.icon
                      
                      return (
                        <motion.button
                          key={command.id}
                          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                          className={`
                            w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                            ${isSelected 
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                              : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                          onClick={() => {
                            command.action()
                            onClose?.()
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5" />
                            <div>
                              <div className="font-medium">{command.title}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {command.description}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {command.shortcut && (
                              <div className="flex items-center space-x-1">
                                {command.shortcut.split(' ').map((key, index) => (
                                  <kbd
                                    key={index}
                                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                            {isSelected && (
                              <ArrowRight className="w-4 h-4" />
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded">Enter</kbd>
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Command className="w-3 h-3" />
                <span>Command Palette</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
