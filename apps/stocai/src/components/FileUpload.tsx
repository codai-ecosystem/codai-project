'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  File,
  Image,
  Video,
  FileText,
  Archive,
  X,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Plus,
  Tag,
  Folder
} from 'lucide-react'

interface FileUploadProps {
  onUpload?: (files: File[]) => void
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  multiple?: boolean
  className?: string
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  preview?: string
}

export function FileUpload({
  onUpload,
  maxFileSize = 100,
  acceptedTypes = ['*'],
  multiple = true,
  className = ''
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image
    if (fileType.startsWith('video/')) return Video
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText
    if (fileType.includes('zip') || fileType.includes('archive')) return Archive
    return File
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`
    }

    // Check file type
    if (acceptedTypes[0] !== '*') {
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -2))
        }
        return file.type === type
      })
      if (!isAccepted) {
        return `File type ${file.type} is not accepted`
      }
    }

    return null
  }

  const generatePreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
    }
    return undefined
  }

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newUploadFiles: UploadFile[] = []

    for (const file of fileArray) {
      const error = validateFile(file)
      const preview = await generatePreview(file)
      
      newUploadFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
        preview
      })
    }

    setUploadFiles(prev => multiple ? [...prev, ...newUploadFiles] : newUploadFiles)
  }

  const simulateUpload = async (uploadFile: UploadFile) => {
    const { id } = uploadFile
    
    setUploadFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'uploading' as const } : f
    ))

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadFiles(prev => prev.map(f => 
        f.id === id ? { ...f, progress } : f
      ))
    }

    // Simulate success/error
    const success = Math.random() > 0.1 // 90% success rate
    setUploadFiles(prev => prev.map(f => 
      f.id === id ? { 
        ...f, 
        status: success ? 'success' : 'error',
        error: success ? undefined : 'Upload failed. Please try again.'
      } : f
    ))
  }

  const handleUpload = async () => {
    setIsUploading(true)
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
    
    // Upload files in parallel
    await Promise.all(pendingFiles.map(simulateUpload))
    
    setIsUploading(false)
    
    // Call onUpload callback with successful files
    const successfulFiles = uploadFiles
      .filter(f => f.status === 'success')
      .map(f => f.file)
    
    if (onUpload && successfulFiles.length > 0) {
      onUpload(successfulFiles)
    }
  }

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id))
  }

  const retryFile = (id: string) => {
    const uploadFile = uploadFiles.find(f => f.id === id)
    if (uploadFile) {
      simulateUpload(uploadFile)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-400 bg-blue-400/10 scale-105' 
            : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={acceptedTypes.join(',')}
        />
        
        <motion.div
          className="flex flex-col items-center space-y-4"
          animate={{ scale: isDragOver ? 1.1 : 1 }}
        >
          <div className="p-4 bg-blue-500/20 rounded-full">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragOver ? 'Drop files here' : 'Upload your files'}
            </h3>
            <p className="text-gray-400 text-sm">
              Drag and drop files here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                browse to upload
              </button>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Max file size: {maxFileSize}MB
              {acceptedTypes[0] !== '*' && (
                <span> • Accepted: {acceptedTypes.join(', ')}</span>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {uploadFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-white">
                Files ({uploadFiles.length})
              </h4>
              {uploadFiles.some(f => f.status === 'pending') && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload All</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {uploadFiles.map((uploadFile) => {
                const Icon = getFileIcon(uploadFile.file.type)
                
                return (
                  <motion.div
                    key={uploadFile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {uploadFile.preview ? (
                          <img
                            src={uploadFile.preview}
                            alt={uploadFile.file.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                        {uploadFile.error && (
                          <p className="text-red-400 text-sm mt-1">
                            {uploadFile.error}
                          </p>
                        )}
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center space-x-3">
                        {uploadFile.status === 'uploading' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                              <motion.div
                                className="bg-blue-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadFile.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-400">
                              {uploadFile.progress}%
                            </span>
                          </div>
                        )}

                        {uploadFile.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}

                        {uploadFile.status === 'error' && (
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <button
                              onClick={() => retryFile(uploadFile.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
