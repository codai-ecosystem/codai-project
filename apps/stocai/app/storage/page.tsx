'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  File,
  Folder,
  Download,
  Share,
  Trash2,
  Star,
  Tag,
  Calendar,
  Type,
  Plus,
  FolderPlus,
  Settings,
  Eye,
  MoreHorizontal,
  X,
  CloudUpload,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

// Inline FileUpload component
interface FileUploadProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSizePerFile?: number
  acceptedTypes?: string[]
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  maxFiles = 10,
  maxSizePerFile = 100 * 1024 * 1024, // 100MB
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/*', 'text/*']
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'pending' | 'uploading' | 'success' | 'error' }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizePerFile) {
      return `File size exceeds ${maxSizePerFile / (1024 * 1024)}MB limit`
    }

    const fileType = file.type
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.slice(0, -1))
      }
      return fileType === type
    })

    if (!isAccepted) {
      return 'File type not supported'
    }

    return null
  }

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const totalFiles = files.length + fileArray.length

    if (totalFiles > maxFiles) {
      return
    }

    const validFiles: File[] = []
    const newErrors: { [key: string]: string } = {}

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors[file.name] = error
      } else {
        validFiles.push(file)
      }
    })

    setErrors(prev => ({ ...prev, ...newErrors }))
    setFiles(prev => [...prev, ...validFiles])

    // Set initial status for valid files
    const newStatus: { [key: string]: 'pending' | 'uploading' | 'success' | 'error' } = {}
    validFiles.forEach(file => {
      newStatus[file.name] = 'pending'
    })
    setUploadStatus(prev => ({ ...prev, ...newStatus }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = e.dataTransfer.files
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
    setUploadStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fileName]
      return newErrors
    })
  }

  const simulateUpload = (file: File) => {
    const fileName = file.name
    setUploadStatus(prev => ({ ...prev, [fileName]: 'uploading' }))

    const duration = 2000 + Math.random() * 3000 // 2-5 seconds
    const interval = 50
    const increment = 100 / (duration / interval)
    let progress = 0

    const timer = setInterval(() => {
      progress += increment + Math.random() * 5
      progress = Math.min(progress, 100)

      setUploadProgress(prev => ({ ...prev, [fileName]: progress }))

      if (progress >= 100) {
        clearInterval(timer)
        setUploadStatus(prev => ({ ...prev, [fileName]: 'success' }))
      }
    }, interval)
  }

  const startUpload = () => {
    if (files.length === 0) return

    files.forEach(file => {
      if (uploadStatus[file.name] === 'pending') {
        simulateUpload(file)
      }
    })
  }

  const retryUpload = (fileName: string) => {
    const file = files.find(f => f.name === fileName)
    if (file) {
      setUploadStatus(prev => ({ ...prev, [fileName]: 'pending' }))
      setUploadProgress(prev => ({ ...prev, [fileName]: 0 }))
      simulateUpload(file)
    }
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return ImageIcon
    if (type.startsWith('video/')) return Video
    if (type.startsWith('audio/')) return Music
    if (type.includes('zip') || type.includes('archive')) return Archive
    return FileText
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = () => {
    const successfulFiles = files.filter(file => uploadStatus[file.name] === 'success')
    if (successfulFiles.length > 0) {
      onUpload(successfulFiles)
      setFiles([])
      setUploadProgress({})
      setUploadStatus({})
      setErrors({})
    }
  }

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
          ${files.length > 0 ? 'border-green-500 bg-green-500/5' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          accept={acceptedTypes.join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <CloudUpload className="w-8 h-8 text-gray-400" />
          </div>

          <div>
            <p className="text-lg font-medium text-white">
              {isDragOver ? 'Drop files here' : 'Drop files or click to browse'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Max {maxFiles} files, {maxSizePerFile / (1024 * 1024)}MB each
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              Selected Files ({files.length})
            </h3>

            <div className="flex space-x-2">
              <button
                onClick={startUpload}
                disabled={files.every(file => uploadStatus[file.name] !== 'pending')}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Start Upload
              </button>

              <button
                onClick={handleSubmit}
                disabled={!files.some(file => uploadStatus[file.name] === 'success')}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Complete
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => {
              const Icon = getFileIcon(file)
              const progress = uploadProgress[file.name] || 0
              const status = uploadStatus[file.name] || 'pending'
              const error = errors[file.name]

              return (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-8 h-8 text-blue-400 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>

                      {error && (
                        <p className="text-red-400 text-sm mt-1">{error}</p>
                      )}

                      {!error && status === 'uploading' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-400">Uploading...</span>
                            <span className="text-gray-400">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                            <motion.div
                              className="bg-blue-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}

                      {status === 'error' && (
                        <div className="flex space-x-1">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <button
                            onClick={() => retryUpload(file.name)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => removeFile(file.name)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface StorageFile {
  id: string
  name: string
  type: string
  size: number
  created_at: string
  modified_at: string
  folder: string
  tags: string[]
  starred: boolean
  shared: boolean
  thumbnail?: string
  url: string
}

interface StorageFolder {
  id: string
  name: string
  path: string
  fileCount: number
  totalSize: number
  created_at: string
}

export default function StoragePage() {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [folders, setFolders] = useState<StorageFolder[]>([])
  const [currentFolder, setCurrentFolder] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [filterBy, setFilterBy] = useState<'all' | 'images' | 'documents' | 'videos' | 'archives'>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockFiles: StorageFile[] = [
      {
        id: '1',
        name: 'Project_Proposal.pdf',
        type: 'application/pdf',
        size: 2048576,
        created_at: '2025-01-05T10:30:00Z',
        modified_at: '2025-01-05T14:20:00Z',
        folder: '',
        tags: ['proposal', 'business'],
        starred: true,
        shared: false,
        url: '/api/files/1'
      },
      {
        id: '2',
        name: 'Dashboard_Screenshot.png',
        type: 'image/png',
        size: 1536000,
        created_at: '2025-01-04T16:45:00Z',
        modified_at: '2025-01-04T16:45:00Z',
        folder: 'screenshots',
        tags: ['ui', 'dashboard'],
        starred: false,
        shared: true,
        thumbnail: '/api/files/2/thumbnail',
        url: '/api/files/2'
      },
      {
        id: '3',
        name: 'Meeting_Recording.mp4',
        type: 'video/mp4',
        size: 52428800,
        created_at: '2025-01-03T09:15:00Z',
        modified_at: '2025-01-03T09:15:00Z',
        folder: 'meetings',
        tags: ['meeting', 'team'],
        starred: false,
        shared: false,
        url: '/api/files/3'
      }
    ]

    const mockFolders: StorageFolder[] = [
      {
        id: 'f1',
        name: 'Screenshots',
        path: 'screenshots',
        fileCount: 15,
        totalSize: 23068672,
        created_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 'f2',
        name: 'Meetings',
        path: 'meetings',
        fileCount: 8,
        totalSize: 419430400,
        created_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 'f3',
        name: 'Documents',
        path: 'documents',
        fileCount: 42,
        totalSize: 104857600,
        created_at: '2025-01-01T00:00:00Z'
      }
    ]

    setTimeout(() => {
      setFiles(mockFiles)
      setFolders(mockFolders)
      setIsLoading(false)
    }, 1000)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType: string) => {
    // This would be expanded with more file type detection
    return File
  }

  const filteredFiles = files.filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'images':
          return file.type.startsWith('image/')
        case 'documents':
          return file.type.includes('pdf') || file.type.includes('document')
        case 'videos':
          return file.type.startsWith('video/')
        case 'archives':
          return file.type.includes('zip') || file.type.includes('archive')
        default:
          return true
      }
    }

    return true
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'date':
        comparison = new Date(a.modified_at).getTime() - new Date(b.modified_at).getTime()
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleFileUpload = (uploadedFiles: File[]) => {
    console.log('Files uploaded:', uploadedFiles)
    setShowUpload(false)
    // Here you would integrate with the actual upload API
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Storage</h1>
              <p className="text-gray-400 text-sm">
                {files.length} files • {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))} used
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>

              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                <FolderPlus className="w-4 h-4" />
                <span>New Folder</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="bg-white/10 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="documents">Documents</option>
              <option value="videos">Videos</option>
              <option value="archives">Archives</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-')
                setSortBy(sort as any)
                setSortOrder(order as any)
              }}
              className="bg-white/10 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>

            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-white/10'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-white/10'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Folders */}
            {folders.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Folders</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {folders.map((folder) => (
                    <motion.div
                      key={folder.id}
                      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentFolder(folder.path)}
                    >
                      <div className="flex items-center space-x-3">
                        <Folder className="w-8 h-8 text-blue-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{folder.name}</p>
                          <p className="text-gray-400 text-sm">
                            {folder.fileCount} files • {formatFileSize(folder.totalSize)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white mb-4">Files</h3>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedFiles.map((file) => {
                    const Icon = getFileIcon(file.type)
                    const isSelected = selectedFiles.includes(file.id)

                    return (
                      <motion.div
                        key={file.id}
                        className={`
                          bg-white/5 backdrop-blur-xl rounded-xl border p-4 cursor-pointer transition-all
                          ${isSelected ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 hover:bg-white/10'}
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFileSelection(file.id)}
                      >
                        <div className="space-y-3">
                          {/* File Preview/Icon */}
                          <div className="relative">
                            {file.thumbnail ? (
                              <img
                                src={file.thumbnail}
                                alt={file.name}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                                <Icon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}

                            {file.starred && (
                              <Star className="absolute top-2 right-2 w-5 h-5 text-yellow-400 fill-current" />
                            )}

                            {file.shared && (
                              <div className="absolute top-2 left-2 bg-green-600 rounded-full p-1">
                                <Share className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* File Info */}
                          <div>
                            <p className="text-white font-medium truncate text-sm">{file.name}</p>
                            <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                            <p className="text-gray-500 text-xs">{formatDate(file.modified_at)}</p>
                          </div>

                          {/* Tags */}
                          {file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {file.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                              {file.tags.length > 2 && (
                                <span className="text-gray-400 text-xs">+{file.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedFiles.map((file) => {
                    const Icon = getFileIcon(file.type)
                    const isSelected = selectedFiles.includes(file.id)

                    return (
                      <motion.div
                        key={file.id}
                        className={`
                          bg-white/5 backdrop-blur-xl rounded-lg border p-4 cursor-pointer transition-all
                          ${isSelected ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 hover:bg-white/10'}
                        `}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => toggleFileSelection(file.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {file.thumbnail ? (
                              <img
                                src={file.thumbnail}
                                alt={file.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                                <Icon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-white font-medium truncate">{file.name}</p>
                              {file.starred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                              {file.shared && <Share className="w-4 h-4 text-green-400" />}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{formatDate(file.modified_at)}</span>
                              {file.tags.length > 0 && (
                                <div className="flex space-x-1">
                                  {file.tags.slice(0, 2).map((tag) => (
                                    <span key={tag} className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-white">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Upload Files</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <FileUpload onUpload={handleFileUpload} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Files Actions */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-xl px-6 py-4 shadow-xl"
          >
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </span>

              <div className="flex items-center space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  <Download className="w-4 h-4" />
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  <Share className="w-4 h-4" />
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-gray-400 hover:text-white px-3 py-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
