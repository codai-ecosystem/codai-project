'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  X,
  Code,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit3
} from 'lucide-react'

interface FileEditorProps {
  projectId: string
  fileName: string
  onClose: () => void
}

export default function FileEditor({ projectId, fileName, onClose }: FileEditorProps) {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    fetchFileContent()
  }, [projectId, fileName])

  useEffect(() => {
    setHasChanges(content !== originalContent)
  }, [content, originalContent])

  const fetchFileContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(fileName)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch file content')
      }

      setContent(data.content)
      setOriginalContent(data.content)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file content')
    } finally {
      setLoading(false)
    }
  }

  const saveFile = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(fileName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save file')
      }

      setOriginalContent(content)
      setHasChanges(false)

      // Show success message
      setError(null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file')
    } finally {
      setSaving(false)
    }
  }

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'ts':
      case 'tsx': return 'typescript'
      case 'js':
      case 'jsx': return 'javascript'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'css': return 'css'
      case 'html': return 'html'
      case 'py': return 'python'
      case 'yml':
      case 'yaml': return 'yaml'
      default: return 'text'
    }
  }

  const renderIcon = (IconComponent: React.ComponentType<any>, className: string = "w-5 h-5") => {
    return <IconComponent className={className} />
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-2xl border border-white/10 p-8 max-w-sm mx-4"
        >
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading File</h3>
            <p className="text-gray-400">Please wait...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-6xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              {getFileLanguage(fileName) === 'markdown' ? (
                <FileText className="w-5 h-5 text-indigo-400" />
              ) : (
                <Code className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{fileName}</h3>
              <p className="text-sm text-gray-400">
                {getFileLanguage(fileName)} • {hasChanges ? 'Modified' : 'Saved'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode Toggle */}
            <div className="flex bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${viewMode === 'edit'
                    ? 'bg-indigo-500/30 text-indigo-300'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {renderIcon(Edit3, "w-4 h-4 mr-1")} Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${viewMode === 'preview'
                    ? 'bg-indigo-500/30 text-indigo-300'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {renderIcon(Eye, "w-4 h-4 mr-1")} Preview
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={downloadFile}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-300" />
            </button>

            <button
              onClick={saveFile}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${hasChanges
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-6 pt-4">
          {viewMode === 'edit' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-black/20 border border-white/10 rounded-xl p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Start typing..."
              spellCheck={false}
            />
          ) : (
            <div className="w-full h-full bg-black/20 border border-white/10 rounded-xl p-4 overflow-auto">
              {getFileLanguage(fileName) === 'markdown' ? (
                <div className="prose prose-invert max-w-none">
                  {/* Simple markdown preview - you could use a proper markdown renderer here */}
                  <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                    {content}
                  </pre>
                </div>
              ) : (
                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                  {content}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Language: {getFileLanguage(fileName)}</span>
            <span>Length: {content.length} characters</span>
            <span>Lines: {content.split('\n').length}</span>
          </div>

          {hasChanges && (
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
