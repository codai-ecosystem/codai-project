'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Share2,
  Tag,
  BarChart3,
  Brain,
  Zap,
  Users,
  Calendar,
  FileSpreadsheet,
  FileImage,
  FileAudio
} from 'lucide-react'

interface Dataset {
  id: string
  name: string
  description: string
  type: 'training' | 'validation' | 'test' | 'fine-tuning'
  format: 'csv' | 'json' | 'jsonl' | 'parquet' | 'image' | 'audio' | 'text'
  size: string
  records: number
  created: string
  status: 'ready' | 'processing' | 'error'
  isPublic: boolean
  tags: string[]
  downloadCount: number
}

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'training' | 'validation' | 'test' | 'fine-tuning'>('all')
  const [selectedFormat, setSelectedFormat] = useState<'all' | string>('all')

  const [datasets] = useState<Dataset[]>([
    {
      id: '1',
      name: 'Customer Sentiment Analysis',
      description: 'Comprehensive dataset for training sentiment analysis models with customer reviews',
      type: 'training',
      format: 'jsonl',
      size: '245.8 MB',
      records: 125000,
      created: '2024-01-15',
      status: 'ready',
      isPublic: false,
      tags: ['sentiment', 'nlp', 'customer', 'reviews'],
      downloadCount: 42
    },
    {
      id: '2',
      name: 'Product Images Classification',
      description: 'High-quality product images for e-commerce classification tasks',
      type: 'training',
      format: 'image',
      size: '1.2 GB',
      records: 50000,
      created: '2024-01-14',
      status: 'ready',
      isPublic: true,
      tags: ['computer-vision', 'ecommerce', 'classification'],
      downloadCount: 128
    },
    {
      id: '3',
      name: 'Financial Time Series',
      description: 'Historical financial data for time series prediction models',
      type: 'training',
      format: 'csv',
      size: '89.3 MB',
      records: 2500000,
      created: '2024-01-13',
      status: 'ready',
      isPublic: false,
      tags: ['finance', 'time-series', 'prediction'],
      downloadCount: 67
    },
    {
      id: '4',
      name: 'Voice Commands Dataset',
      description: 'Audio recordings for voice command recognition training',
      type: 'training',
      format: 'audio',
      size: '3.7 GB',
      records: 75000,
      created: '2024-01-12',
      status: 'processing',
      isPublic: false,
      tags: ['audio', 'voice', 'commands', 'speech'],
      downloadCount: 23
    },
    {
      id: '5',
      name: 'Legal Documents Fine-tuning',
      description: 'Curated legal documents for fine-tuning language models',
      type: 'fine-tuning',
      format: 'text',
      size: '156.4 MB',
      records: 8500,
      created: '2024-01-11',
      status: 'ready',
      isPublic: false,
      tags: ['legal', 'documents', 'fine-tuning', 'nlp'],
      downloadCount: 15
    },
    {
      id: '6',
      name: 'Medical Validation Set',
      description: 'Validation dataset for medical diagnosis models',
      type: 'validation',
      format: 'json',
      size: '67.2 MB',
      records: 12000,
      created: '2024-01-10',
      status: 'ready',
      isPublic: false,
      tags: ['medical', 'validation', 'diagnosis'],
      downloadCount: 8
    }
  ])

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
      case 'json':
      case 'jsonl':
      case 'parquet':
        return <FileSpreadsheet className="w-6 h-6 text-green-400" />
      case 'image':
        return <FileImage className="w-6 h-6 text-purple-400" />
      case 'audio':
        return <FileAudio className="w-6 h-6 text-yellow-400" />
      default:
        return <Database className="w-6 h-6 text-blue-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400 bg-green-400/20'
      case 'processing': return 'text-yellow-400 bg-yellow-400/20'
      case 'error': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'text-blue-400 bg-blue-400/20'
      case 'validation': return 'text-green-400 bg-green-400/20'
      case 'test': return 'text-orange-400 bg-orange-400/20'
      case 'fine-tuning': return 'text-purple-400 bg-purple-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === 'all' || dataset.type === selectedType
    const matchesFormat = selectedFormat === 'all' || dataset.format === selectedFormat

    return matchesSearch && matchesType && matchesFormat
  })

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
            Dataset Management
          </h1>
          <p className="text-gray-400">Manage AI training datasets, validation sets, and fine-tuning corpora</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{datasets.length}</p>
                <p className="text-sm text-gray-400">Total Datasets</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {datasets.reduce((sum, d) => sum + d.records, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Records</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {datasets.filter(d => d.type === 'training').length}
                </p>
                <p className="text-sm text-gray-400">Training Sets</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {datasets.reduce((sum, d) => sum + d.downloadCount, 0)}
                </p>
                <p className="text-sm text-gray-400">Downloads</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search datasets, tags, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="training">Training</option>
                <option value="validation">Validation</option>
                <option value="test">Test</option>
                <option value="fine-tuning">Fine-tuning</option>
              </select>

              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Formats</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="jsonl">JSONL</option>
                <option value="image">Images</option>
                <option value="audio">Audio</option>
                <option value="text">Text</option>
              </select>
            </div>

            <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Dataset
            </button>
          </div>
        </motion.div>

        {/* Dataset Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredDatasets.map((dataset, index) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getFormatIcon(dataset.format)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{dataset.name}</h3>
                    <p className="text-sm text-gray-400">{dataset.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {dataset.isPublic && (
                    <div title="Public dataset">
                      <Share2 className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(dataset.status)}`}>
                    {dataset.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Size</p>
                  <p className="text-sm font-medium text-white">{dataset.size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Records</p>
                  <p className="text-sm font-medium text-white">{dataset.records.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(dataset.type)} w-fit`}>
                    {dataset.type}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Downloads</p>
                  <p className="text-sm font-medium text-white">{dataset.downloadCount}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {dataset.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Created {dataset.created}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    disabled={dataset.status !== 'ready'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    disabled={dataset.status !== 'ready'}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredDatasets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No datasets found</h3>
            <p className="text-gray-500">Try adjusting your filters or upload your first dataset</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
