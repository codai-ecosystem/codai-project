'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileText,
  Code,
  Image,
  Video,
  Music,
  Archive,
  Database,
  Settings,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  GitBranch,
  Circle,
  Dot
} from 'lucide-react'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  size?: number
  modified?: Date
  children?: FileNode[]
  isExpanded?: boolean
  isGitTracked?: boolean
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked'
}

interface FileExplorerProps {
  projectPath: string
  onFileSelect: (file: FileNode) => void
  onFileCreate: (path: string, type: 'file' | 'folder') => void
  onFileDelete: (path: string) => void
  onFileRename: (oldPath: string, newPath: string) => void
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  projectPath,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    node: FileNode
  } | null>(null)

  // Load real file tree from API
  useEffect(() => {
    loadFileTree(projectPath)
  }, [projectPath])

  const loadFileTree = async (path: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`)
      if (response.ok) {
        const { files } = await response.json()
        const fileNodes = files.map((file: any, index: number) => ({
          id: `${index}`,
          name: file.name,
          type: file.isDirectory ? 'folder' : 'file',
          path: file.path,
          size: file.size,
          lastModified: file.lastModified,
          children: file.isDirectory ? [] : undefined
        }))
        setFileTree(fileNodes)
      }
    } catch (error) {
      console.error('Failed to load file tree:', error)
      // Fallback to mock data
      loadMockFileTree()
    } finally {
      setIsLoading(false)
    }
  }

  const loadMockFileTree = () => {
    const mockFileTree: FileNode[] = [
      {
        id: '1',
        name: 'src',
        type: 'folder',
        path: '/src',
        isExpanded: true,
        children: [
          {
            id: '2',
            name: 'components',
            type: 'folder',
            path: '/src/components',
            children: [
              {
                id: '3',
                name: 'AideDashboard.tsx',
                type: 'file',
                path: '/src/components/AideDashboard.tsx',
                size: 45231,
                modified: new Date(),
                isGitTracked: true,
                gitStatus: 'modified'
              },
              {
                id: '4',
                name: 'FileExplorer.tsx',
                type: 'file',
                path: '/src/components/FileExplorer.tsx',
                size: 12458,
                modified: new Date(),
                isGitTracked: true,
                gitStatus: 'added'
              }
            ]
          },
          {
            id: '5',
            name: 'hooks',
            type: 'folder',
            path: '/src/hooks',
            children: [
              {
                id: '6',
                name: 'useFileSystem.ts',
                type: 'file',
                path: '/src/hooks/useFileSystem.ts',
                size: 3421,
                modified: new Date(),
                isGitTracked: true
              }
            ]
          },
          {
            id: '7',
            name: 'lib',
            type: 'folder',
            path: '/src/lib',
            children: [
              {
                id: '8',
                name: 'aide-service.ts',
                type: 'file',
                path: '/src/lib/aide-service.ts',
                size: 8934,
                modified: new Date(),
                isGitTracked: true
              }
            ]
          },
          {
            id: '9',
            name: 'app',
            type: 'folder',
            path: '/src/app',
            children: [
              {
                id: '10',
                name: 'page.tsx',
                type: 'file',
                path: '/src/app/page.tsx',
                size: 1234,
                modified: new Date(),
                isGitTracked: true
              },
              {
                id: '11',
                name: 'layout.tsx',
                type: 'file',
                path: '/src/app/layout.tsx',
                size: 2567,
                modified: new Date(),
                isGitTracked: true
              }
            ]
          }
        ]
      },
      {
        id: '12',
        name: 'public',
        type: 'folder',
        path: '/public',
        children: [
          {
            id: '13',
            name: 'favicon.ico',
            type: 'file',
            path: '/public/favicon.ico',
            size: 15086,
            modified: new Date(),
            isGitTracked: true
          }
        ]
      },
      {
        id: '14',
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        size: 2156,
        modified: new Date(),
        isGitTracked: true
      },
      {
        id: '15',
        name: 'tsconfig.json',
        type: 'file',
        path: '/tsconfig.json',
        size: 876,
        modified: new Date(),
        isGitTracked: true
      },
      {
        id: '16',
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        size: 3421,
        modified: new Date(),
        isGitTracked: true
      }
    ]

    setFileTree(mockFileTree)
    setExpandedNodes(new Set(['1', '2']))
  }

  // Initialize with mock data for demo
  useEffect(() => {
    loadMockFileTree()
  }, [])

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return expandedNodes.has(node.id) ? (
        <FolderOpen className="w-4 h-4 text-blue-400" />
      ) : (
        <Folder className="w-4 h-4 text-blue-400" />
      )
    }

    const extension = node.name.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return <Code className="w-4 h-4 text-green-400" />
      case 'json':
        return <Database className="w-4 h-4 text-yellow-400" />
      case 'md':
        return <FileText className="w-4 h-4 text-blue-300" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-purple-400" />
      case 'mp4':
      case 'mov':
      case 'avi':
        return <Video className="w-4 h-4 text-red-400" />
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="w-4 h-4 text-pink-400" />
      case 'zip':
      case 'tar':
      case 'gz':
        return <Archive className="w-4 h-4 text-orange-400" />
      default:
        return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const getGitStatusIcon = (node: FileNode) => {
    if (!node.isGitTracked || !node.gitStatus) return null

    switch (node.gitStatus) {
      case 'modified':
        return <Circle className="w-2 h-2 text-orange-400 fill-current" />
      case 'added':
        return <Circle className="w-2 h-2 text-green-400 fill-current" />
      case 'deleted':
        return <Circle className="w-2 h-2 text-red-400 fill-current" />
      case 'untracked':
        return <Circle className="w-2 h-2 text-blue-400 fill-current" />
      default:
        return null
    }
  }

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'folder') {
      toggleExpanded(node.id)
    } else {
      setSelectedFile(node.id)
      onFileSelect(node)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const filteredTree = searchQuery
    ? fileTree.filter(node =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.children && node.children.some(child =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    )
    : fileTree

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedFile === node.id

    return (
      <div key={node.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center space-x-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/20 border-l-2 border-blue-500' : ''
            }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          {node.type === 'folder' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(node.id)
              }}
              className="p-0.5 rounded hover:bg-white/10 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </button>
          )}

          {getFileIcon(node)}

          <span className={`text-sm flex-1 ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
            {node.name}
          </span>

          {getGitStatusIcon(node)}

          {node.type === 'file' && node.size && (
            <span className="text-xs text-gray-500 hidden group-hover:block">
              {formatFileSize(node.size)}
            </span>
          )}
        </motion.div>

        <AnimatePresence>
          {node.type === 'folder' && isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {node.children.map(child => renderFileNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="w-80 bg-black/20 backdrop-blur-xl border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Explorer</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onFileCreate(projectPath, 'file')}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="New File"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => onFileCreate(projectPath, 'folder')}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="New Folder"
            >
              <Folder className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setFileTree([])}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-white/10 transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredTree.map(node => renderFileNode(node))}
        </div>

        {filteredTree.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files found</p>
          </div>
        )}
      </div>

      {/* Git Status */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
          <span>•</span>
          <span>2 changes</span>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl py-2 min-w-[160px]"
              style={{
                left: contextMenu.x,
                top: contextMenu.y
              }}
            >
              <button
                onClick={() => {
                  onFileRename(contextMenu.node.path, contextMenu.node.path)
                  setContextMenu(null)
                }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-3 h-3" />
                <span>Rename</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.node.path)
                  setContextMenu(null)
                }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Path</span>
              </button>

              <hr className="my-1 border-white/10" />

              <button
                onClick={() => {
                  onFileDelete(contextMenu.node.path)
                  setContextMenu(null)
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileExplorer
