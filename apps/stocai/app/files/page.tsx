'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  Search,
  Filter,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  FolderPlus,
  File,
  FileText,
  Image,
  Music,
  Video,
  Archive
} from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: string
  modified: string
  fileType?: 'document' | 'image' | 'audio' | 'video' | 'archive' | 'other'
  thumbnail?: string
}

export default function FilesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Project Documents',
      type: 'folder',
      modified: '2024-01-15'
    },
    {
      id: '2',
      name: 'AI Models',
      type: 'folder',
      modified: '2024-01-14'
    },
    {
      id: '3',
      name: 'Dataset_Training.csv',
      type: 'file',
      size: '45.2 MB',
      modified: '2024-01-13',
      fileType: 'document'
    },
    {
      id: '4',
      name: 'Company_Logo.png',
      type: 'file',
      size: '2.1 MB',
      modified: '2024-01-12',
      fileType: 'image'
    },
    {
      id: '5',
      name: 'Meeting_Recording.mp3',
      type: 'file',
      size: '125.8 MB',
      modified: '2024-01-11',
      fileType: 'audio'
    },
    {
      id: '6',
      name: 'Demo_Video.mp4',
      type: 'file',
      size: '512.3 MB',
      modified: '2024-01-10',
      fileType: 'video'
    }
  ])

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <FolderPlus className="w-8 h-8 text-blue-400" />
    }

    switch (item.fileType) {
      case 'document':
        return <FileText className="w-8 h-8 text-green-400" />
      case 'image':
        return <Image className="w-8 h-8 text-purple-400" />
      case 'audio':
        return <Music className="w-8 h-8 text-yellow-400" />
      case 'video':
        return <Video className="w-8 h-8 text-red-400" />
      case 'archive':
        return <Archive className="w-8 h-8 text-orange-400" />
      default:
        return <File className="w-8 h-8 text-gray-400" />
    }
  }

  const toggleSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            File Management
          </h1>
          <p className="text-gray-400">Organize and manage your files with intelligent storage capabilities</p>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Files
              </button>
              <button className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors font-medium flex items-center gap-2">
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
            </div>
          </div>
        </motion.div>

        {/* File Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer ${selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              onClick={() => toggleSelection(file.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{file.name}</h3>
                    {file.size && (
                      <p className="text-xs text-gray-400">{file.size}</p>
                    )}
                  </div>
                </div>
                <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Modified {file.modified}</span>
                <div className="flex items-center gap-2">
                  {file.type === 'file' && (
                    <>
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <Eye className="w-3 h-3" />
                      </button>
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <Download className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <File className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No files found</h3>
            <p className="text-gray-500">Try adjusting your search or upload some files to get started</p>
          </motion.div>
        )}

        {/* Selection Actions */}
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center gap-4"
          >
            <span className="text-sm text-gray-300">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1">
                <Download className="w-3 h-3" />
                Download
              </button>
              <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
              <button
                onClick={() => setSelectedFiles([])}
                className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
