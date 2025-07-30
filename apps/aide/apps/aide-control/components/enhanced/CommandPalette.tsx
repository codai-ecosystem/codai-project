'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CommandLineIcon,
  FolderIcon,
  DocumentTextIcon,
  CogIcon,
  UserIcon,
  CloudIcon,
  BoltIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Search, Zap, FileText, Settings, Users, Cloud, Terminal } from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description: string;
  category: 'project' | 'file' | 'ai' | 'deployment' | 'settings' | 'collaboration';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  priority: number;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: Command) => void;
}

export function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Project commands
    {
      id: 'new-project',
      title: 'Create New Project',
      description: 'Start a new project from template',
      category: 'project',
      icon: <PlusIcon className="w-5 h-5" />,
      shortcut: '⌘N',
      priority: 10,
      action: () => console.log('Creating new project...'),
    },
    {
      id: 'open-project',
      title: 'Open Project',
      description: 'Open an existing project',
      category: 'project',
      icon: <FolderIcon className="w-5 h-5" />,
      shortcut: '⌘O',
      priority: 9,
      action: () => console.log('Opening project...'),
    },

    // AI commands
    {
      id: 'ai-generate-code',
      title: 'Generate Code with AI',
      description: 'Ask AI to generate code for your project',
      category: 'ai',
      icon: <Zap className="w-5 h-5" />,
      shortcut: '⌘G',
      priority: 8,
      action: () => console.log('Generating code with AI...'),
    },
    {
      id: 'ai-explain-code',
      title: 'Explain Code',
      description: 'Get AI explanation of selected code',
      category: 'ai',
      icon: <BoltIcon className="w-5 h-5" />,
      priority: 7,
      action: () => console.log('Explaining code...'),
    },
    {
      id: 'ai-optimize',
      title: 'Optimize Code',
      description: 'Let AI optimize your code for performance',
      category: 'ai',
      icon: <Zap className="w-5 h-5" />,
      priority: 6,
      action: () => console.log('Optimizing code...'),
    },

    // File commands
    {
      id: 'new-file',
      title: 'New File',
      description: 'Create a new file in current project',
      category: 'file',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      shortcut: '⌘⇧N',
      priority: 8,
      action: () => console.log('Creating new file...'),
    },
    {
      id: 'search-files',
      title: 'Search Files',
      description: 'Find files in your project',
      category: 'file',
      icon: <Search className="w-5 h-5" />,
      shortcut: '⌘P',
      priority: 7,
      action: () => console.log('Searching files...'),
    },

    // Deployment commands
    {
      id: 'deploy-project',
      title: 'Deploy Project',
      description: 'Deploy your project to the cloud',
      category: 'deployment',
      icon: <CloudIcon className="w-5 h-5" />,
      shortcut: '⌘D',
      priority: 8,
      action: () => console.log('Deploying project...'),
    },
    {
      id: 'preview-project',
      title: 'Preview Project',
      description: 'Start local development server',
      category: 'deployment',
      icon: <Cloud className="w-5 h-5" />,
      shortcut: '⌘R',
      priority: 7,
      action: () => console.log('Starting preview...'),
    },

    // Collaboration commands
    {
      id: 'invite-collaborator',
      title: 'Invite Collaborator',
      description: 'Invite someone to work on your project',
      category: 'collaboration',
      icon: <UserIcon className="w-5 h-5" />,
      priority: 6,
      action: () => console.log('Inviting collaborator...'),
    },
    {
      id: 'share-project',
      title: 'Share Project',
      description: 'Generate shareable link for your project',
      category: 'collaboration',
      icon: <Users className="w-5 h-5" />,
      priority: 5,
      action: () => console.log('Sharing project...'),
    },

    // Settings commands
    {
      id: 'project-settings',
      title: 'Project Settings',
      description: 'Configure project settings and preferences',
      category: 'settings',
      icon: <CogIcon className="w-5 h-5" />,
      priority: 4,
      action: () => console.log('Opening project settings...'),
    },
    {
      id: 'terminal',
      title: 'Open Terminal',
      description: 'Open integrated terminal',
      category: 'settings',
      icon: <Terminal className="w-5 h-5" />,
      shortcut: '⌘`',
      priority: 6,
      action: () => console.log('Opening terminal...'),
    },
  ];

  // Filter commands based on query
  const filteredCommands = commands
    .filter(command =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.category.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8); // Limit to 8 results

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleCommandSelect(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleCommandSelect = (command: Command) => {
    onCommand(command);
    command.action();
    onClose();
  };

  const getCategoryColor = (category: Command['category']) => {
    switch (category) {
      case 'project': return 'text-blue-500';
      case 'ai': return 'text-purple-500';
      case 'file': return 'text-green-500';
      case 'deployment': return 'text-orange-500';
      case 'collaboration': return 'text-pink-500';
      case 'settings': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getCategoryBg = (category: Command['category']) => {
    switch (category) {
      case 'project': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'ai': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'file': return 'bg-green-100 dark:bg-green-900/30';
      case 'deployment': return 'bg-orange-100 dark:bg-orange-900/30';
      case 'collaboration': return 'bg-pink-100 dark:bg-pink-900/30';
      case 'settings': return 'bg-gray-100 dark:bg-gray-700';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="relative border-b border-gray-200 dark:border-gray-700">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands... (type to filter)"
              className="w-full pl-12 pr-4 py-4 bg-transparent text-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-xs text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ESC</kbd>
              <span>to close</span>
            </div>
          </div>

          {/* Commands list */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              <div className="p-2">
                {filteredCommands.map((command, index) => (
                  <motion.button
                    key={command.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleCommandSelect(command)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors
                      ${index === selectedIndex
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryBg(command.category)}`}>
                        <div className={getCategoryColor(command.category)}>
                          {command.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {command.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {command.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {command.shortcut && (
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                          {command.shortcut}
                        </kbd>
                      )}
                      <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <CommandLineIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No commands found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>

          {/* Footer with categories */}
          {query === '' && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap gap-2">
                {['project', 'ai', 'file', 'deployment', 'collaboration', 'settings'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setQuery(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors
                      ${getCategoryBg(category as Command['category'])} ${getCategoryColor(category as Command['category'])}
                      hover:opacity-80`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
