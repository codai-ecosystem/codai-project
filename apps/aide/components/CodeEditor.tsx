'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Save,
  Undo,
  Redo,
  Search,
  Replace,
  ZoomIn,
  ZoomOut,
  MoreVertical,
  Circle,
  Dot,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  GitBranch,
  Terminal,
  Play,
  Bug
} from 'lucide-react'

interface EditorTab {
  id: string
  filename: string
  path: string
  content: string
  isModified: boolean
  language: string
  cursorPosition: { line: number; column: number }
}

interface Diagnostic {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface CodeEditorProps {
  tabs: EditorTab[]
  activeTabId: string | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onContentChange: (tabId: string, content: string) => void
  onSave: (tabId: string) => void
  diagnostics: Diagnostic[]
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onContentChange,
  onSave,
  diagnostics
}) => {
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const getLanguageIcon = (language: string) => {
    const colors = {
      typescript: 'text-blue-400',
      javascript: 'text-yellow-400',
      tsx: 'text-blue-400',
      jsx: 'text-cyan-400',
      json: 'text-green-400',
      css: 'text-pink-400',
      html: 'text-orange-400',
      markdown: 'text-gray-400'
    }

    return (
      <div className={`w-2 h-2 rounded-full ${colors[language as keyof typeof colors] || 'bg-gray-400'}`} />
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault()
        if (activeTab) {
          onSave(activeTab.id)
        }
      } else if (e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      } else if (e.key === '=') {
        e.preventDefault()
        setFontSize(Math.min(fontSize + 2, 24))
      } else if (e.key === '-') {
        e.preventDefault()
        setFontSize(Math.max(fontSize - 2, 10))
      }
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTab) {
      onContentChange(activeTab.id, e.target.value)
      updateCursorPosition(e.target)
    }
  }

  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const text = textarea.value
    const cursorPos = textarea.selectionStart
    const lines = text.substring(0, cursorPos).split('\n')
    const line = lines.length
    const column = lines[lines.length - 1].length + 1
    setCursorPosition({ line, column })
  }

  const getDiagnosticsForLine = (lineNumber: number) => {
    return diagnostics.filter(d => d.line === lineNumber)
  }

  const renderLineNumbers = () => {
    if (!activeTab) return null

    const lines = activeTab.content.split('\n')
    return (
      <div className="bg-black/20 border-r border-white/10 p-2 text-right text-xs text-gray-500 select-none min-w-[50px]">
        {lines.map((_, index) => {
          const lineNumber = index + 1
          const lineDiagnostics = getDiagnosticsForLine(lineNumber)
          const hasError = lineDiagnostics.some(d => d.severity === 'error')
          const hasWarning = lineDiagnostics.some(d => d.severity === 'warning')

          return (
            <div
              key={index}
              className={`h-6 flex items-center justify-end px-2 relative ${lineNumber === cursorPosition.line ? 'bg-blue-500/10' : ''
                }`}
            >
              <span>{lineNumber}</span>
              {hasError && (
                <Circle className="w-2 h-2 text-red-400 fill-current absolute -right-1" />
              )}
              {hasWarning && !hasError && (
                <Circle className="w-2 h-2 text-yellow-400 fill-current absolute -right-1" />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderMinimap = () => {
    if (!showMinimap || !activeTab) return null

    return (
      <div className="w-20 bg-black/20 border-l border-white/10 overflow-hidden">
        <div className="text-xs text-gray-600 leading-tight p-1">
          {activeTab.content.split('\n').map((line, index) => (
            <div
              key={index}
              className={`h-1 bg-gray-600 mb-0.5 ${line.trim() ? 'opacity-60' : 'opacity-20'}`}
              style={{ width: `${Math.min(line.length * 2, 80)}px` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black/10 backdrop-blur-xl">
        <div className="text-center">
          <Terminal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No files open</h3>
          <p className="text-gray-400">Open a file from the explorer to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-black/10 backdrop-blur-xl">
      {/* Tab Bar */}
      <div className="border-b border-white/10 bg-black/20">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors min-w-0 ${activeTabId === tab.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-transparent hover:bg-white/5'
                }`}
            >
              <button
                onClick={() => onTabSelect(tab.id)}
                className="flex items-center space-x-2 min-w-0 flex-1"
              >
                {getLanguageIcon(tab.language)}
                <span className={`text-sm truncate ${activeTabId === tab.id ? 'text-white font-medium' : 'text-gray-300'
                  }`}>
                  {tab.filename}
                </span>
                {tab.isModified && (
                  <Dot className="w-4 h-4 text-orange-400" />
                )}
              </button>

              <button
                onClick={() => onTabClose(tab.id)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => activeTab && onSave(activeTab.id)}
            disabled={!activeTab?.isModified}
            className="p-2 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4 text-gray-400" />
          </button>

          <button className="p-2 rounded hover:bg-white/10 transition-colors" title="Undo">
            <Undo className="w-4 h-4 text-gray-400" />
          </button>

          <button className="p-2 rounded hover:bg-white/10 transition-colors" title="Redo">
            <Redo className="w-4 h-4 text-gray-400" />
          </button>

          <div className="h-4 w-px bg-white/10" />

          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded transition-colors ${showSearch ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-gray-400'
              }`}
            title="Find (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>

          <button className="p-2 rounded hover:bg-white/10 transition-colors" title="Replace">
            <Replace className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFontSize(Math.max(fontSize - 2, 10))}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <ZoomOut className="w-3 h-3 text-gray-400" />
            </button>
            <span className="text-xs text-gray-400 min-w-[30px] text-center">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(fontSize + 2, 24))}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <ZoomIn className="w-3 h-3 text-gray-400" />
            </button>
          </div>

          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`p-2 rounded transition-colors ${showMinimap ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-gray-400'
              }`}
            title="Toggle Minimap"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 bg-black/20 p-4"
          >
            <div className="flex items-center space-x-4 max-w-md">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Find"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Replace"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  className="w-full px-3 py-1 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Area */}
      <div className="flex-1 flex">
        {/* Line Numbers */}
        {renderLineNumbers()}

        {/* Code Editor */}
        <div className="flex-1 relative">
          {activeTab && (
            <textarea
              ref={editorRef}
              value={activeTab.content}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onSelect={(e) => updateCursorPosition(e.target as HTMLTextAreaElement)}
              className="w-full h-full p-4 bg-transparent text-white font-mono resize-none outline-none leading-6"
              style={{
                fontSize: `${fontSize}px`,
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                overflow: 'auto'
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          )}
        </div>

        {/* Minimap */}
        {renderMinimap()}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-black/30 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4 text-xs">
        <div className="flex items-center space-x-4">
          {activeTab && (
            <>
              <span className="text-gray-300">
                Ln {cursorPosition.line}, Col {cursorPosition.column}
              </span>
              <span className="text-gray-400">{activeTab.language}</span>
              <span className="text-gray-400">UTF-8</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {diagnostics.filter(d => d.severity === 'error').length > 0 && (
              <div className="flex items-center space-x-1 text-red-400">
                <XCircle className="w-3 h-3" />
                <span>{diagnostics.filter(d => d.severity === 'error').length}</span>
              </div>
            )}
            {diagnostics.filter(d => d.severity === 'warning').length > 0 && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <AlertTriangle className="w-3 h-3" />
                <span>{diagnostics.filter(d => d.severity === 'warning').length}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1 text-gray-400">
            <GitBranch className="w-3 h-3" />
            <span>main</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
