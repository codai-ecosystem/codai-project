'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Upload,
    FolderOpen,
    Search,
    Filter,
    Download,
    Trash2,
    Eye,
    FileText,
    Image,
    Video,
    Archive,
    Database,
    HardDrive,
    Cloud,
    Zap,
    RefreshCw,
    Plus,
    MoreVertical
} from 'lucide-react'

interface StorageFile {
    id: string
    name: string
    size: number
    type: string
    folder: string
    created_at: string
    updated_at: string
    tags: string[]
    description: string
    ai_summary: string
    url: string
    metadata: Record<string, any>
}

interface StorageStats {
    totalFiles: number
    totalSize: number
    foldersCount: number
    recentUploads: number
    storageUsed: number
    storageQuota: number
}

const StorageManager: React.FC = () => {
    const [files, setFiles] = useState<StorageFile[]>([])
    const [stats, setStats] = useState<StorageStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFolder, setSelectedFolder] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => {
        loadFiles()
        loadStats()
    }, [selectedFolder, searchQuery])

    const loadFiles = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (selectedFolder) params.append('folder', selectedFolder)
            if (searchQuery) params.append('search', searchQuery)

            const response = await fetch(`/api/files?${params}`)
            if (response.ok) {
                const data = await response.json()
                setFiles(data.files || [])
            }
        } catch (error) {
            console.error('Failed to load files:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            // Simulate loading storage statistics
            setStats({
                totalFiles: 847000,
                totalSize: 2.4 * 1024 * 1024 * 1024 * 1024, // 2.4TB in bytes
                foldersCount: 1200,
                recentUploads: 847,
                storageUsed: 2.4 * 1024 * 1024 * 1024 * 1024,
                storageQuota: 10 * 1024 * 1024 * 1024 * 1024 // 10TB quota
            })
        } catch (error) {
            console.error('Failed to load stats:', error)
        }
    }

    const handleFileUpload = async (files: FileList) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const uploadId = `upload_${Date.now()}_${i}`

            try {
                setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }))

                const formData = new FormData()
                formData.append('file', file)
                formData.append('folder', selectedFolder)
                formData.append('description', '')
                formData.append('tags', JSON.stringify([]))

                // Simulate upload progress
                const interval = setInterval(() => {
                    setUploadProgress(prev => {
                        const current = prev[uploadId] || 0
                        if (current >= 90) {
                            clearInterval(interval)
                            return prev
                        }
                        return { ...prev, [uploadId]: current + 10 }
                    })
                }, 100)

                const response = await fetch('/api/files', {
                    method: 'POST',
                    body: formData
                })

                clearInterval(interval)
                setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }))

                if (response.ok) {
                    const data = await response.json()
                    setFiles(prev => [data.file, ...prev])

                    // Remove upload progress after delay
                    setTimeout(() => {
                        setUploadProgress(prev => {
                            const { [uploadId]: removed, ...rest } = prev
                            return rest
                        })
                    }, 2000)
                }
            } catch (error) {
                console.error('Upload failed:', error)
                setUploadProgress(prev => {
                    const { [uploadId]: removed, ...rest } = prev
                    return rest
                })
            }
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)

        if (e.dataTransfer.files) {
            handleFileUpload(e.dataTransfer.files)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
    }

    const deleteFile = async (fileId: string) => {
        try {
            const response = await fetch(`/api/files?id=${fileId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setFiles(prev => prev.filter(f => f.id !== fileId))
            }
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return Image
        if (type.startsWith('video/')) return Video
        if (type.includes('pdf') || type.startsWith('text/')) return FileText
        if (type.includes('zip') || type.includes('rar')) return Archive
        return FileText
    }

    const folders = ['documents', 'images', 'datasets', 'exports', 'imports', 'temp']

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Storage Management</h1>
                    <p className="text-slate-300">Organize and manage your files, datasets, and documents</p>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Upload Files</span>
                    </button>
                    <button
                        onClick={loadFiles}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Storage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Files</p>
                            <p className="text-2xl font-bold text-white">{stats.totalFiles.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Storage Used</p>
                            <p className="text-2xl font-bold text-white">{formatFileSize(stats.storageUsed)}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <HardDrive className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Folders</p>
                            <p className="text-2xl font-bold text-white">{stats.foldersCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Recent Uploads</p>
                            <p className="text-2xl font-bold text-white">{stats.recentUploads}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Folders</option>
                        {folders.map(folder => (
                            <option key={folder} value={folder} className="bg-slate-800">
                                {folder.charAt(0).toUpperCase() + folder.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                    >
                        {viewMode === 'grid' ? 'List View' : 'Grid View'}
                    </button>
                </div>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-white text-lg font-medium mb-2">
                    Drag and drop files here, or click to browse
                </p>
                <p className="text-slate-400 text-sm">
                    Supports all file types • Max 100MB per file
                </p>
                <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([id, progress]) => (
                        <div key={id} className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-sm">Uploading...</span>
                                <span className="text-slate-400 text-sm">{progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <motion.div
                                    className="bg-blue-500 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Files Grid/List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <motion.div
                        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            ) : (
                <div className={`grid gap-4 ${viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                    }`}>
                    {files.map((file) => {
                        const FileIcon = getFileIcon(file.type)

                        return (
                            <motion.div
                                key={file.id}
                                className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <FileIcon className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium truncate">{file.name}</h3>
                                            <p className="text-slate-400 text-sm">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="p-1 text-slate-400 hover:text-white transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-slate-400 hover:text-white transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteFile(file.id)}
                                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {file.description && (
                                    <p className="text-slate-300 text-sm mb-2">{file.description}</p>
                                )}

                                {file.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {file.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="text-slate-400 text-xs">
                                    {new Date(file.created_at).toLocaleDateString()}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {files.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Database className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-white text-lg font-medium mb-2">No files found</p>
                    <p className="text-slate-400">Upload some files to get started</p>
                </div>
            )}
        </div>
    )
}

export default StorageManager
