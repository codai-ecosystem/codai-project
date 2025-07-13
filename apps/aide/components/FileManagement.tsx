'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FolderTree,
    File,
    Folder,
    FolderPlus,
    FilePlus,
    Upload,
    Download,
    Search,
    Filter,
    Grid,
    List,
    Eye,
    Edit,
    Trash2,
    Copy,
    MoreHorizontal,
    ChevronRight,
    ChevronDown,
    Star,
    Clock,
    User,
    Calendar,
    FileText,
    Image,
    Code,
    Archive,
    RefreshCw,
    Settings,
    Share,
    Lock,
    Unlock,
    ExternalLink,
    FileCode,
    FileImage,
    FileVideo,
    FileArchive,
    Database,
    Briefcase,
    Bookmark,
    Tag,
    Info,
    AlertTriangle,
    CheckCircle,
    X,
    Plus,
    Minus,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Maximize2
} from 'lucide-react'

interface FileItem {
    id: string
    name: string
    type: 'file' | 'folder'
    path: string
    size?: number
    lastModified: Date
    createdAt: Date
    owner: string
    permissions: 'read' | 'write' | 'admin'
    language?: string
    mimeType?: string
    isStarred?: boolean
    isLocked?: boolean
    children?: FileItem[]
    content?: string
    tags?: string[]
}

interface FileVersion {
    id: string
    version: string
    date: Date
    author: string
    message: string
    size: number
}

const FileManagement = () => {
    const [files, setFiles] = useState<FileItem[]>([
        {
            id: '1',
            name: 'src',
            type: 'folder',
            path: '/src',
            lastModified: new Date(Date.now() - 3600000),
            createdAt: new Date('2025-01-01'),
            owner: 'aide-ai',
            permissions: 'admin',
            children: [
                {
                    id: '2',
                    name: 'components',
                    type: 'folder',
                    path: '/src/components',
                    lastModified: new Date(Date.now() - 1800000),
                    createdAt: new Date('2025-01-02'),
                    owner: 'aide-ai',
                    permissions: 'write',
                    children: [
                        {
                            id: '3',
                            name: 'AideHomepage.tsx',
                            type: 'file',
                            path: '/src/components/AideHomepage.tsx',
                            size: 15420,
                            lastModified: new Date(Date.now() - 900000),
                            createdAt: new Date('2025-01-02'),
                            owner: 'aide-ai',
                            permissions: 'write',
                            language: 'typescript',
                            mimeType: 'text/typescript',
                            isStarred: true,
                            tags: ['homepage', 'react', 'component']
                        },
                        {
                            id: '4',
                            name: 'AideChatInterface.tsx',
                            type: 'file',
                            path: '/src/components/AideChatInterface.tsx',
                            size: 23890,
                            lastModified: new Date(Date.now() - 600000),
                            createdAt: new Date('2025-01-03'),
                            owner: 'aide-ai',
                            permissions: 'write',
                            language: 'typescript',
                            mimeType: 'text/typescript',
                            isStarred: true,
                            tags: ['chat', 'react', 'ai']
                        }
                    ]
                },
                {
                    id: '5',
                    name: 'utils',
                    type: 'folder',
                    path: '/src/utils',
                    lastModified: new Date(Date.now() - 7200000),
                    createdAt: new Date('2025-01-01'),
                    owner: 'dev-team',
                    permissions: 'write',
                    children: [
                        {
                            id: '6',
                            name: 'api.ts',
                            type: 'file',
                            path: '/src/utils/api.ts',
                            size: 5670,
                            lastModified: new Date(Date.now() - 7200000),
                            createdAt: new Date('2025-01-01'),
                            owner: 'dev-team',
                            permissions: 'write',
                            language: 'typescript',
                            mimeType: 'text/typescript',
                            tags: ['api', 'utils']
                        }
                    ]
                }
            ]
        },
        {
            id: '7',
            name: 'public',
            type: 'folder',
            path: '/public',
            lastModified: new Date(Date.now() - 86400000),
            createdAt: new Date('2025-01-01'),
            owner: 'aide-ai',
            permissions: 'admin',
            children: [
                {
                    id: '8',
                    name: 'logo.png',
                    type: 'file',
                    path: '/public/logo.png',
                    size: 24560,
                    lastModified: new Date(Date.now() - 86400000),
                    createdAt: new Date('2025-01-01'),
                    owner: 'design-team',
                    permissions: 'read',
                    mimeType: 'image/png',
                    tags: ['logo', 'branding']
                }
            ]
        },
        {
            id: '9',
            name: 'package.json',
            type: 'file',
            path: '/package.json',
            size: 2340,
            lastModified: new Date(Date.now() - 3600000),
            createdAt: new Date('2025-01-01'),
            owner: 'aide-ai',
            permissions: 'admin',
            language: 'json',
            mimeType: 'application/json',
            isStarred: true,
            tags: ['config', 'dependencies']
        },
        {
            id: '10',
            name: 'README.md',
            type: 'file',
            path: '/README.md',
            size: 4567,
            lastModified: new Date(Date.now() - 1800000),
            createdAt: new Date('2025-01-01'),
            owner: 'aide-ai',
            permissions: 'write',
            language: 'markdown',
            mimeType: 'text/markdown',
            isStarred: true,
            tags: ['documentation']
        }
    ])

    const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'list'>('tree')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '2', '5', '7']))
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
    const [isUploading, setIsUploading] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [filterType, setFilterType] = useState<'all' | 'files' | 'folders' | 'starred'>('all')

    const fileInputRef = useRef<HTMLInputElement>(null)
    const dragRef = useRef<HTMLDivElement>(null)

    const getFileIcon = (file: FileItem) => {
        if (file.type === 'folder') {
            return <Folder className="w-4 h-4 text-blue-400" />
        }

        switch (file.language || file.mimeType) {
            case 'typescript':
            case 'javascript':
                return <FileCode className="w-4 h-4 text-yellow-400" />
            case 'json':
                return <Database className="w-4 h-4 text-orange-400" />
            case 'markdown':
                return <FileText className="w-4 h-4 text-blue-400" />
            case 'image/png':
            case 'image/jpg':
            case 'image/jpeg':
            case 'image/gif':
                return <FileImage className="w-4 h-4 text-green-400" />
            case 'video/mp4':
            case 'video/webm':
                return <FileVideo className="w-4 h-4 text-purple-400" />
            case 'application/zip':
            case 'application/tar':
                return <FileArchive className="w-4 h-4 text-gray-400" />
            default:
                return <File className="w-4 h-4 text-gray-400" />
        }
    }

    const formatFileSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB']
        let size = bytes
        let unitIndex = 0

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024
            unitIndex++
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    const formatDate = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) {
            return 'Today'
        } else if (days === 1) {
            return 'Yesterday'
        } else if (days < 7) {
            return `${days} days ago`
        } else {
            return date.toLocaleDateString()
        }
    }

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders)
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId)
        } else {
            newExpanded.add(folderId)
        }
        setExpandedFolders(newExpanded)
    }

    const toggleFileSelection = (fileId: string) => {
        const newSelected = new Set(selectedFiles)
        if (newSelected.has(fileId)) {
            newSelected.delete(fileId)
        } else {
            newSelected.add(fileId)
        }
        setSelectedFiles(newSelected)
    }

    const toggleStar = (fileId: string) => {
        const updateFiles = (items: FileItem[]): FileItem[] => {
            return items.map(item => {
                if (item.id === fileId) {
                    return { ...item, isStarred: !item.isStarred }
                }
                if (item.children) {
                    return { ...item, children: updateFiles(item.children) }
                }
                return item
            })
        }
        setFiles(updateFiles(files))
    }

    const deleteFiles = (fileIds: string[]) => {
        const deleteFromTree = (items: FileItem[]): FileItem[] => {
            return items.filter(item => {
                if (fileIds.includes(item.id)) {
                    return false
                }
                if (item.children) {
                    item.children = deleteFromTree(item.children)
                }
                return true
            })
        }
        setFiles(deleteFromTree(files))
        setSelectedFiles(new Set())
    }

    const createNewFile = () => {
        const name = prompt('File name:')
        if (!name) return

        const newFile: FileItem = {
            id: Date.now().toString(),
            name,
            type: 'file',
            path: `/${name}`,
            size: 0,
            lastModified: new Date(),
            createdAt: new Date(),
            owner: 'current-user',
            permissions: 'write',
            mimeType: 'text/plain',
            tags: []
        }

        setFiles([...files, newFile])
    }

    const createNewFolder = () => {
        const name = prompt('Folder name:')
        if (!name) return

        const newFolder: FileItem = {
            id: Date.now().toString(),
            name,
            type: 'folder',
            path: `/${name}`,
            lastModified: new Date(),
            createdAt: new Date(),
            owner: 'current-user',
            permissions: 'write',
            children: []
        }

        setFiles([...files, newFolder])
    }

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = Array.from(event.target.files || [])
        setIsUploading(true)

        // Simulate upload
        setTimeout(() => {
            const newFiles = uploadedFiles.map(file => ({
                id: Date.now().toString() + Math.random(),
                name: file.name,
                type: 'file' as const,
                path: `/${file.name}`,
                size: file.size,
                lastModified: new Date(),
                createdAt: new Date(),
                owner: 'current-user',
                permissions: 'write' as const,
                mimeType: file.type,
                tags: []
            }))

            setFiles(prev => [...prev, ...newFiles])
            setIsUploading(false)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }, 2000)
    }, [])

    const flattenFiles = (items: FileItem[], level = 0): (FileItem & { level: number })[] => {
        let result: (FileItem & { level: number })[] = []

        for (const item of items) {
            result.push({ ...item, level })

            if (item.type === 'folder' && item.children && expandedFolders.has(item.id)) {
                result = result.concat(flattenFiles(item.children, level + 1))
            }
        }

        return result
    }

    const filterAndSortFiles = (items: FileItem[]): FileItem[] => {
        let filtered = items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesFilter =
                filterType === 'all' ||
                (filterType === 'files' && item.type === 'file') ||
                (filterType === 'folders' && item.type === 'folder') ||
                (filterType === 'starred' && item.isStarred)

            return matchesSearch && matchesFilter
        })

        filtered.sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name)
                    break
                case 'date':
                    comparison = a.lastModified.getTime() - b.lastModified.getTime()
                    break
                case 'size':
                    comparison = (a.size || 0) - (b.size || 0)
                    break
                case 'type':
                    comparison = a.type.localeCompare(b.type)
                    break
            }

            return sortOrder === 'asc' ? comparison : -comparison
        })

        return filtered
    }

    const renderTreeView = (items: FileItem[], level = 0) => {
        const filteredItems = filterAndSortFiles(items)

        return filteredItems.map(item => (
            <div key={item.id}>
                <div
                    className={`flex items-center space-x-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors ${selectedFiles.has(item.id) ? 'bg-blue-500/20 border border-blue-500/30' : ''
                        }`}
                    style={{ paddingLeft: `${level * 20 + 8}px` }}
                    onClick={() => {
                        if (item.type === 'folder') {
                            toggleFolder(item.id)
                        } else {
                            setSelectedFile(item)
                            setPreviewMode(true)
                        }
                    }}
                >
                    <input
                        type="checkbox"
                        checked={selectedFiles.has(item.id)}
                        onChange={(e) => {
                            e.stopPropagation()
                            toggleFileSelection(item.id)
                        }}
                        className="w-4 h-4 text-blue-600 bg-transparent border-gray-600 rounded focus:ring-blue-500"
                    />

                    {item.type === 'folder' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleFolder(item.id)
                            }}
                            className="p-1"
                        >
                            {expandedFolders.has(item.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                        </button>
                    )}

                    <div className="flex items-center space-x-2 flex-1">
                        {getFileIcon(item)}
                        <span className="text-white text-sm">{item.name}</span>
                        {item.isStarred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                        {item.isLocked && <Lock className="w-3 h-3 text-red-400" />}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                        {item.type === 'file' && item.size && (
                            <span>{formatFileSize(item.size)}</span>
                        )}
                        <span>{formatDate(item.lastModified)}</span>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleStar(item.id)
                            }}
                            className="p-1 hover:bg-white/10 rounded"
                        >
                            <Star className={`w-3 h-3 ${item.isStarred ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedFile(item)
                            }}
                            className="p-1 hover:bg-white/10 rounded"
                        >
                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                        </button>
                    </div>
                </div>

                {item.type === 'folder' && item.children && expandedFolders.has(item.id) && (
                    <div>
                        {renderTreeView(item.children, level + 1)}
                    </div>
                )}
            </div>
        ))
    }

    const renderGridView = () => {
        const flatFiles = flattenFiles(files).filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {flatFiles.map(item => (
                    <div
                        key={item.id}
                        className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-1 ${selectedFiles.has(item.id) ? 'bg-blue-500/20 border-blue-500/30' : ''
                            }`}
                        onClick={() => {
                            if (item.type === 'file') {
                                setSelectedFile(item)
                                setPreviewMode(true)
                            }
                        }}
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                {React.cloneElement(getFileIcon(item), { className: 'w-6 h-6' })}
                            </div>
                            <div className="text-center">
                                <div className="text-white text-sm font-medium truncate w-full">{item.name}</div>
                                {item.type === 'file' && item.size && (
                                    <div className="text-xs text-gray-400">{formatFileSize(item.size)}</div>
                                )}
                            </div>
                            <div className="flex items-center space-x-1">
                                {item.isStarred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                                {item.isLocked && <Lock className="w-3 h-3 text-red-400" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderListView = () => {
        const flatFiles = flattenFiles(files).filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        return (
            <div className="space-y-2">
                {flatFiles.map(item => (
                    <div
                        key={item.id}
                        className={`flex items-center space-x-4 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 cursor-pointer transition-colors ${selectedFiles.has(item.id) ? 'bg-blue-500/20 border-blue-500/30' : ''
                            }`}
                        onClick={() => {
                            if (item.type === 'file') {
                                setSelectedFile(item)
                                setPreviewMode(true)
                            }
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={selectedFiles.has(item.id)}
                            onChange={(e) => {
                                e.stopPropagation()
                                toggleFileSelection(item.id)
                            }}
                            className="w-4 h-4 text-blue-600 bg-transparent border-gray-600 rounded focus:ring-blue-500"
                        />

                        <div className="flex items-center space-x-2 flex-1">
                            {getFileIcon(item)}
                            <span className="text-white">{item.name}</span>
                            {item.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                            {item.isLocked && <Lock className="w-4 h-4 text-red-400" />}
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <span className="w-20 text-center">{item.type}</span>
                            <span className="w-20 text-center">
                                {item.type === 'file' && item.size ? formatFileSize(item.size) : '-'}
                            </span>
                            <span className="w-24 text-center">{item.owner}</span>
                            <span className="w-28 text-center">{formatDate(item.lastModified)}</span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedFile(item)
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto max-w-7xl px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <FolderTree className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                File Management
                            </h1>
                            <p className="text-gray-300 mt-2">Organize and manage your project files with AI assistance</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={createNewFolder}
                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center space-x-2"
                        >
                            <FolderPlus className="w-4 h-4" />
                            <span>New Folder</span>
                        </button>

                        <button
                            onClick={createNewFile}
                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors flex items-center space-x-2"
                        >
                            <FilePlus className="w-4 h-4" />
                            <span>New File</span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search files and folders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                            />
                        </div>

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="all">All Items</option>
                            <option value="files">Files Only</option>
                            <option value="folders">Folders Only</option>
                            <option value="starred">Starred</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="date">Sort by Date</option>
                            <option value="size">Sort by Size</option>
                            <option value="type">Sort by Type</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        {selectedFiles.size > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-400">{selectedFiles.size} selected</span>
                                <button
                                    onClick={() => deleteFiles(Array.from(selectedFiles))}
                                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 transition-colors flex items-center space-x-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}

                        <div className="flex items-center space-x-1 bg-black/20 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`p-2 rounded ${viewMode === 'tree' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FolderTree className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* File Content */}
                <div className="flex gap-6">
                    {/* Main File Area */}
                    <div className={`${previewMode && selectedFile ? 'flex-1' : 'w-full'} bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6`}>
                        {viewMode === 'tree' && (
                            <div className="space-y-1">
                                {renderTreeView(files)}
                            </div>
                        )}

                        {viewMode === 'grid' && renderGridView()}

                        {viewMode === 'list' && (
                            <div>
                                {/* List Header */}
                                <div className="flex items-center space-x-4 p-3 border-b border-white/10 mb-4 text-sm text-gray-400 font-medium">
                                    <div className="w-4"></div> {/* Checkbox column */}
                                    <div className="flex-1">Name</div>
                                    <div className="w-20 text-center">Type</div>
                                    <div className="w-20 text-center">Size</div>
                                    <div className="w-24 text-center">Owner</div>
                                    <div className="w-28 text-center">Modified</div>
                                    <div className="w-8"></div> {/* Actions column */}
                                </div>
                                {renderListView()}
                            </div>
                        )}
                    </div>

                    {/* File Preview Panel */}
                    <AnimatePresence>
                        {previewMode && selectedFile && (
                            <motion.div
                                initial={{ opacity: 0, x: 300 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 300 }}
                                className="w-96 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">File Preview</h3>
                                    <button
                                        onClick={() => setPreviewMode(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* File Icon and Name */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                            {React.cloneElement(getFileIcon(selectedFile), { className: 'w-6 h-6' })}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{selectedFile.name}</div>
                                            <div className="text-sm text-gray-400">{selectedFile.path}</div>
                                        </div>
                                    </div>

                                    {/* File Details */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Type:</span>
                                            <span className="text-white">{selectedFile.type}</span>
                                        </div>
                                        {selectedFile.size && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Size:</span>
                                                <span className="text-white">{formatFileSize(selectedFile.size)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Owner:</span>
                                            <span className="text-white">{selectedFile.owner}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Modified:</span>
                                            <span className="text-white">{formatDate(selectedFile.lastModified)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Created:</span>
                                            <span className="text-white">{formatDate(selectedFile.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Permissions:</span>
                                            <span className="text-white">{selectedFile.permissions}</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {selectedFile.tags && selectedFile.tags.length > 0 && (
                                        <div>
                                            <div className="text-sm text-gray-400 mb-2">Tags:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedFile.tags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="space-y-2 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => window.open(`/editor?file=${selectedFile.id}`, '_blank')}
                                            className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span>Edit with AI</span>
                                        </button>

                                        <button
                                            onClick={() => toggleStar(selectedFile.id)}
                                            className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <Star className={`w-4 h-4 ${selectedFile.isStarred ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                                            <span>{selectedFile.isStarred ? 'Unstar' : 'Star'}</span>
                                        </button>

                                        <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center justify-center space-x-2">
                                            <Download className="w-4 h-4" />
                                            <span>Download</span>
                                        </button>

                                        <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center justify-center space-x-2">
                                            <Share className="w-4 h-4" />
                                            <span>Share</span>
                                        </button>

                                        <button
                                            onClick={() => deleteFiles([selectedFile.id])}
                                            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default FileManagement
