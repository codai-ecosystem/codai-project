'use client'

import React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  FileText, Download, Upload, Search, Filter, Eye, Share2, Archive, Star,
  Calendar, CreditCard, Receipt, PiggyBank, Building, Shield, AlertCircle,
  CheckCircle2, Clock, MoreHorizontal, FolderOpen, File, Image, FileType,
  Plus, Trash2, Edit3, Send, Settings, Bell, Award, Zap, Users,
  ArrowRight, Heart, Grid3X3, Activity, Bookmark, TrendingUp,
  LineChart, Calculator, Headphones, RefreshCw, Copy, Lock,
  Unlock, Folder, HardDrive, BarChart3, PieChart, Target
} from 'lucide-react'

interface DocumentData {
  id: string
  name: string
  type: 'statement' | 'receipt' | 'tax' | 'loan' | 'contract' | 'insurance' | 'other'
  category: string
  date: string
  size: string
  format: 'pdf' | 'jpg' | 'png' | 'doc' | 'xlsx'
  status: 'available' | 'processing' | 'expired' | 'pending'
  starred: boolean
  description?: string
  accountNumber?: string
  tags?: string[]
  lastAccessed?: string
  downloadCount?: number
  securityLevel?: 'public' | 'confidential' | 'restricted'
}

interface DocumentCategory {
  id: string
  name: string
  icon: any
  count: number
  color: string
}

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [activeTab, setActiveTab] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [showFilterTags, setShowFilterTags] = useState(false)
  const [dateRange, setDateRange] = useState('all')
  const [fileFormat, setFileFormat] = useState('all')
  const [securityFilter, setSecurityFilter] = useState('all')

  // Enhanced document management configuration
  const tabs = [
    { id: 'all', name: 'All Documents', icon: FileText, count: 8 },
    { id: 'statements', name: 'Statements', icon: Receipt, count: 4 },
    { id: 'tax', name: 'Tax Documents', icon: Calculator, count: 1 },
    { id: 'contracts', name: 'Contracts', icon: FileType, count: 2 },
    { id: 'insurance', name: 'Insurance', icon: Shield, count: 1 },
    { id: 'archived', name: 'Archived', icon: Archive, count: 12 }
  ];

  const quickActions = [
    { id: 'upload', name: 'Upload Document', icon: Upload, color: 'bg-blue-500', description: 'Add new documents' },
    { id: 'request', name: 'Request Document', icon: Send, color: 'bg-green-500', description: 'Request from bank' },
    { id: 'organize', name: 'Organize Files', icon: Folder, color: 'bg-purple-500', description: 'Sort and categorize' },
    { id: 'backup', name: 'Backup Documents', icon: HardDrive, color: 'bg-orange-500', description: 'Secure backup' },
    { id: 'analytics', name: 'Document Analytics', icon: BarChart3, color: 'bg-pink-500', description: 'Usage insights' },
    { id: 'security', name: 'Security Scan', icon: Lock, color: 'bg-red-500', description: 'Check security' },
    { id: 'archive', name: 'Auto Archive', icon: Archive, color: 'bg-gray-500', description: 'Archive old files' },
    { id: 'share', name: 'Share Center', icon: Share2, color: 'bg-teal-500', description: 'Manage sharing' }
  ];

  const documents: DocumentData[] = [
    {
      id: '1',
      name: 'Monthly Statement - December 2024',
      type: 'statement',
      category: 'Account Statements',
      date: '2025-01-01',
      size: '245 KB',
      format: 'pdf',
      status: 'available',
      starred: true,
      accountNumber: '****5678',
      description: 'Monthly account statement for December 2024',
      tags: ['statement', 'monthly', 'checking'],
      lastAccessed: '2025-01-15',
      downloadCount: 3,
      securityLevel: 'confidential'
    },
    {
      id: '2',
      name: 'Credit Card Statement - December 2024',
      type: 'statement',
      category: 'Credit Cards',
      date: '2025-01-01',
      size: '189 KB',
      format: 'pdf',
      status: 'available',
      starred: false,
      accountNumber: '****1234',
      description: 'Credit card statement for December 2024',
      tags: ['statement', 'credit', 'monthly'],
      lastAccessed: '2025-01-12',
      downloadCount: 1,
      securityLevel: 'confidential'
    },
    {
      id: '3',
      name: 'Mortgage Payment Receipt',
      type: 'receipt',
      category: 'Loans',
      date: '2025-01-15',
      size: '98 KB',
      format: 'pdf',
      status: 'available',
      starred: false,
      description: 'Monthly mortgage payment confirmation',
      tags: ['receipt', 'mortgage', 'payment'],
      lastAccessed: '2025-01-16',
      downloadCount: 2,
      securityLevel: 'confidential'
    },
    {
      id: '4',
      name: 'Tax Form 1099-INT',
      type: 'tax',
      category: 'Tax Documents',
      date: '2025-01-31',
      size: '156 KB',
      format: 'pdf',
      status: 'processing',
      starred: true,
      description: 'Interest income tax form for 2024',
      tags: ['tax', '1099', 'interest', '2024'],
      lastAccessed: '2025-02-01',
      downloadCount: 0,
      securityLevel: 'restricted'
    },
    {
      id: '5',
      name: 'Auto Loan Agreement',
      type: 'contract',
      category: 'Loan Documents',
      date: '2024-06-15',
      size: '1.2 MB',
      format: 'pdf',
      status: 'available',
      starred: false,
      description: 'Vehicle financing agreement and terms',
      tags: ['contract', 'auto', 'loan', 'agreement'],
      lastAccessed: '2024-12-20',
      downloadCount: 5,
      securityLevel: 'restricted'
    },
    {
      id: '6',
      name: 'Investment Portfolio Report',
      type: 'statement',
      category: 'Investments',
      date: '2025-01-20',
      size: '445 KB',
      format: 'pdf',
      status: 'available',
      starred: true,
      description: 'Quarterly investment performance report',
      tags: ['investment', 'portfolio', 'quarterly', 'report'],
      lastAccessed: '2025-01-22',
      downloadCount: 4,
      securityLevel: 'confidential'
    },
    {
      id: '7',
      name: 'Business Account Application',
      type: 'contract',
      category: 'Business Banking',
      date: '2024-11-10',
      size: '890 KB',
      format: 'pdf',
      status: 'available',
      starred: false,
      description: 'Business checking account opening documents',
      tags: ['business', 'application', 'account', 'checking'],
      lastAccessed: '2024-11-15',
      downloadCount: 2,
      securityLevel: 'restricted'
    },
    {
      id: '8',
      name: 'Insurance Policy - Auto',
      type: 'insurance',
      category: 'Insurance',
      date: '2024-12-01',
      size: '678 KB',
      format: 'pdf',
      status: 'available',
      starred: false,
      description: 'Vehicle insurance policy documents',
      tags: ['insurance', 'auto', 'policy', 'coverage'],
      lastAccessed: '2025-01-05',
      downloadCount: 1,
      securityLevel: 'confidential'
    }
  ]

  // Enhanced header with gradient design and document analytics
  const renderEnhancedHeader = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-2xl p-8 mb-8">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Document Center</h1>
            <p className="text-green-100 text-lg">Secure banking document management and analytics</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all">
              <Send className="h-4 w-4" />
              <span>Request</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all">
              <Bell className="h-4 w-4" />
              <span>Alerts</span>
            </button>
          </div>
        </div>

        {/* Document Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-white" />
              <TrendingUp className="h-5 w-5 text-green-300" />
            </div>
            <div className="text-2xl font-bold text-white">127</div>
            <div className="text-green-100 text-sm">Total Documents</div>
            <div className="text-green-200 text-xs mt-1">+12 this month</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-8 w-8 text-white" />
              <Activity className="h-5 w-5 text-blue-300" />
            </div>
            <div className="text-2xl font-bold text-white">2.4 GB</div>
            <div className="text-blue-100 text-sm">Storage Used</div>
            <div className="text-blue-200 text-xs mt-1">24% of limit</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <Lock className="h-8 w-8 text-white" />
              <Shield className="h-5 w-5 text-purple-300" />
            </div>
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="text-purple-100 text-sm">Security Score</div>
            <div className="text-purple-200 text-xs mt-1">Excellent rating</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <Download className="h-8 w-8 text-white" />
              <BarChart3 className="h-5 w-5 text-orange-300" />
            </div>
            <div className="text-2xl font-bold text-white">156</div>
            <div className="text-orange-100 text-sm">Downloads</div>
            <div className="text-orange-200 text-xs mt-1">Last 30 days</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced summary cards with comprehensive document metrics
  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <TrendingUp className="h-5 w-5 opacity-70" />
        </div>
        <div className="text-2xl font-bold mb-1">127</div>
        <div className="text-green-100 text-sm mb-2">Total Documents</div>
        <div className="text-green-200 text-xs">+12 added this month</div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Star className="h-6 w-6" />
          </div>
          <Heart className="h-5 w-5 opacity-70" />
        </div>
        <div className="text-2xl font-bold mb-1">23</div>
        <div className="text-blue-100 text-sm mb-2">Starred Documents</div>
        <div className="text-blue-200 text-xs">Most accessed items</div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Archive className="h-6 w-6" />
          </div>
          <Activity className="h-5 w-5 opacity-70" />
        </div>
        <div className="text-2xl font-bold mb-1">2.4 GB</div>
        <div className="text-purple-100 text-sm mb-2">Storage Used</div>
        <div className="text-purple-200 text-xs">24% of available space</div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Lock className="h-6 w-6" />
          </div>
          <Shield className="h-5 w-5 opacity-70" />
        </div>
        <div className="text-2xl font-bold mb-1">98%</div>
        <div className="text-orange-100 text-sm mb-2">Security Score</div>
        <div className="text-orange-200 text-xs">Excellent protection level</div>
      </div>
    </div>
  );

  // Advanced filtering system with comprehensive options
  const renderFilteringSystem = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilterTags(!showFilterTags)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${showFilterTags ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="downloads">Sort by Downloads</option>
            <option value="access">Sort by Last Access</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'grid' ? <FileText className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>

          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filter Options */}
      {showFilterTags && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="statement">Statements</option>
                <option value="tax">Tax Documents</option>
                <option value="contract">Contracts</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Format</label>
              <select
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Formats</option>
                <option value="pdf">PDF</option>
                <option value="jpg">Images</option>
                <option value="doc">Documents</option>
                <option value="xlsx">Spreadsheets</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security Level</label>
              <select
                value={securityFilter}
                onChange={(e) => setSecurityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Levels</option>
                <option value="public">Public</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>

          {/* Popular Filter Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Popular Tags</label>
            <div className="flex flex-wrap gap-2">
              {['statement', 'tax', 'monthly', 'payment', 'contract', 'insurance', 'investment', 'business'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const categories: DocumentCategory[] = [
    { id: 'all', name: 'All Documents', icon: FileText, count: documents.length, color: 'bg-gray-500' },
    { id: 'statements', name: 'Statements', icon: Receipt, count: 4, color: 'bg-blue-500' },
    { id: 'tax', name: 'Tax Documents', icon: FileText, count: 1, color: 'bg-green-500' },
    { id: 'loans', name: 'Loan Documents', icon: Building, count: 2, color: 'bg-purple-500' },
    { id: 'contracts', name: 'Contracts', icon: FileType, count: 2, color: 'bg-orange-500' },
    { id: 'insurance', name: 'Insurance', icon: Shield, count: 1, color: 'bg-red-500' }
  ]

  const getFileIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />
      case 'jpg':
      case 'png': return <Image className="h-5 w-5 text-blue-500" />
      case 'doc': return <File className="h-5 w-5 text-blue-600" />
      case 'xlsx': return <File className="h-5 w-5 text-green-600" />
      default: return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-yellow-600 bg-yellow-100'
      case 'expired': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'expired': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'statements' && doc.type === 'statement') ||
      (selectedCategory === 'tax' && doc.type === 'tax') ||
      (selectedCategory === 'loans' && (doc.type === 'loan' || doc.category.includes('Loan'))) ||
      (selectedCategory === 'contracts' && doc.type === 'contract') ||
      (selectedCategory === 'insurance' && doc.type === 'insurance')

    return matchesSearch && matchesCategory
  })

  const renderDocumentCard = (document: DocumentData) => (
    <Card key={document.id} className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          {getFileIcon(document.format)}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-gray-900">{document.name}</h4>
              {document.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
            <p className="text-sm text-gray-600 mb-2">{document.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{document.category}</span>
              <span>•</span>
              <span>{document.date}</span>
              <span>•</span>
              <span>{document.size}</span>
              {document.accountNumber && (
                <>
                  <span>•</span>
                  <span>{document.accountNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(document.status)}`}>
            {getStatusIcon(document.status)}
            <span className="capitalize">{document.status}</span>
          </span>

          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={document.status !== 'available'}
        >
          <Eye className="h-4 w-4" />
          <span>View</span>
        </button>

        <button
          className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={document.status !== 'available'}
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>

        <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>
    </Card>
  )

  const renderDocumentRow = (document: DocumentData) => (
    <div key={document.id} className="flex items-center justify-between p-4 bg-white border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex items-center space-x-2">
          {getFileIcon(document.format)}
          {document.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{document.name}</h4>
          <p className="text-sm text-gray-600 truncate">{document.category}</p>
        </div>

        <div className="hidden md:block text-sm text-gray-500 w-24">
          {document.date}
        </div>

        <div className="hidden md:block text-sm text-gray-500 w-20">
          {document.size}
        </div>

        <div className="w-24">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          disabled={document.status !== 'available'}
        >
          <Eye className="h-4 w-4" />
        </button>

        <button
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          disabled={document.status !== 'available'}
        >
          <Download className="h-4 w-4" />
        </button>

        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Share2 className="h-4 w-4" />
        </button>

        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      {renderEnhancedHeader()}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Advanced Tabbed Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap flex items-center space-x-2 transition-all ${activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {tab.count && (
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        {renderSummaryCards()}

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="group flex flex-col items-center p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
              >
                <div className={`p-3 rounded-lg ${action.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center mb-1">{action.name}</span>
                <span className="text-xs text-gray-500 text-center">{action.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filtering System */}
        {renderFilteringSystem()}

        {/* Documents Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Toolbar */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredDocuments.length} documents found
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4" />
                <span>Export All</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Archive className="h-4 w-4" />
                <span>Archive Selected</span>
              </button>
            </div>
          </div>

          {/* Documents Display */}
          <div className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map(renderDocumentCard)}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="hidden md:flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="w-8"></span>
                    <span className="flex-1">Document</span>
                    <span className="w-24">Date</span>
                    <span className="w-20">Size</span>
                    <span className="w-24">Status</span>
                    <span className="w-32">Actions</span>
                  </div>
                </div>
                {filteredDocuments.map(renderDocumentRow)}
              </div>
            )}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search criteria or filters' : 'No documents available in this category'}
                </p>
                <button className="mt-4 flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  <span>Upload Your First Document</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modern Footer with Gradient Action Cards */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Document Features</h2>
            <p className="text-gray-600">Explore powerful document management tools</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/documents/analytics"
              className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Document Analytics</h3>
              <p className="text-blue-100 text-sm">Track usage, storage, and access patterns</p>
            </Link>

            <Link
              href="/documents/security"
              className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Lock className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Security Center</h3>
              <p className="text-purple-100 text-sm">Manage encryption, access, and compliance</p>
            </Link>

            <Link
              href="/documents/support"
              className="group relative bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Headphones className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Document Support</h3>
              <p className="text-green-100 text-sm">Get help with document management and policies</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

