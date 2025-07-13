'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Lock,
  Key,
  Upload,
  Download,
  Eye,
  EyeOff,
  FileText,
  Image,
  Trash2,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Fingerprint,
  QrCode
} from 'lucide-react'

interface SecureDocument {
  id: string
  name: string
  type: 'identity' | 'contract' | 'financial' | 'medical' | 'legal' | 'other'
  size: string
  encrypted: boolean
  accessLevel: 'personal' | 'shared' | 'restricted'
  lastAccessed: string
  expiresAt?: string
  owner: string
  sharedWith: number
  fileType: 'pdf' | 'image' | 'document'
}

interface AccessLog {
  id: string
  documentId: string
  documentName: string
  action: 'view' | 'download' | 'share' | 'delete'
  user: string
  timestamp: string
  ipAddress: string
  location: string
}

export default function SecurePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | string>('all')
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [showAccessLogs, setShowAccessLogs] = useState(false)

  const [secureDocuments] = useState<SecureDocument[]>([
    {
      id: '1',
      name: 'ID_Document_Passport.pdf',
      type: 'identity',
      size: '2.4 MB',
      encrypted: true,
      accessLevel: 'personal',
      lastAccessed: '2024-01-20',
      owner: 'John Doe',
      sharedWith: 0,
      fileType: 'pdf'
    },
    {
      id: '2',
      name: 'Employment_Contract_2024.pdf',
      type: 'contract',
      size: '1.8 MB',
      encrypted: true,
      accessLevel: 'shared',
      lastAccessed: '2024-01-19',
      expiresAt: '2024-12-31',
      owner: 'John Doe',
      sharedWith: 2,
      fileType: 'pdf'
    },
    {
      id: '3',
      name: 'Bank_Statement_Q4.pdf',
      type: 'financial',
      size: '892 KB',
      encrypted: true,
      accessLevel: 'personal',
      lastAccessed: '2024-01-18',
      owner: 'John Doe',
      sharedWith: 0,
      fileType: 'pdf'
    },
    {
      id: '4',
      name: 'Medical_Records_2024.pdf',
      type: 'medical',
      size: '3.2 MB',
      encrypted: true,
      accessLevel: 'restricted',
      lastAccessed: '2024-01-17',
      owner: 'John Doe',
      sharedWith: 1,
      fileType: 'pdf'
    },
    {
      id: '5',
      name: 'Property_Deed.pdf',
      type: 'legal',
      size: '4.1 MB',
      encrypted: true,
      accessLevel: 'personal',
      lastAccessed: '2024-01-16',
      owner: 'John Doe',
      sharedWith: 0,
      fileType: 'pdf'
    }
  ])

  const [accessLogs] = useState<AccessLog[]>([
    {
      id: '1',
      documentId: '1',
      documentName: 'ID_Document_Passport.pdf',
      action: 'view',
      user: 'John Doe',
      timestamp: '2024-01-20 14:30',
      ipAddress: '192.168.1.100',
      location: 'Bucharest, RO'
    },
    {
      id: '2',
      documentId: '2',
      documentName: 'Employment_Contract_2024.pdf',
      action: 'share',
      user: 'John Doe',
      timestamp: '2024-01-19 16:45',
      ipAddress: '192.168.1.100',
      location: 'Bucharest, RO'
    },
    {
      id: '3',
      documentId: '3',
      documentName: 'Bank_Statement_Q4.pdf',
      action: 'download',
      user: 'John Doe',
      timestamp: '2024-01-18 10:15',
      ipAddress: '192.168.1.100',
      location: 'Bucharest, RO'
    }
  ])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'identity': 'text-blue-400 bg-blue-400/20',
      'contract': 'text-green-400 bg-green-400/20',
      'financial': 'text-yellow-400 bg-yellow-400/20',
      'medical': 'text-red-400 bg-red-400/20',
      'legal': 'text-purple-400 bg-purple-400/20',
      'other': 'text-gray-400 bg-gray-400/20'
    }
    return colors[type] || colors.other
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'personal': return 'text-green-400 bg-green-400/20'
      case 'shared': return 'text-yellow-400 bg-yellow-400/20'
      case 'restricted': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'text-blue-400'
      case 'download': return 'text-green-400'
      case 'share': return 'text-yellow-400'
      case 'delete': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-400" />
      case 'image': return <Image className="w-6 h-6 text-purple-400" />
      default: return <FileText className="w-6 h-6 text-gray-400" />
    }
  }

  const filteredDocuments = secureDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || doc.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Secure Vault
          </h1>
          <p className="text-gray-400">Enterprise-grade encrypted document storage with access control</p>
        </motion.div>

        {/* Security Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12 text-red-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">Vault Security Status</h2>
                <p className="text-gray-300">All documents encrypted with AES-256 | Zero-knowledge architecture</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Encrypted</span>
                </div>
                <p className="text-xs text-gray-400">256-bit AES</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-400">
                  <Fingerprint className="w-5 h-5" />
                  <span className="font-medium">MFA Active</span>
                </div>
                <p className="text-xs text-gray-400">Biometric + 2FA</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-blue-400">
                  <Key className="w-5 h-5" />
                  <span className="font-medium">Zero Access</span>
                </div>
                <p className="text-xs text-gray-400">Client-side encryption</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{secureDocuments.length}</p>
                <p className="text-sm text-gray-400">Secure Documents</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {secureDocuments.reduce((sum, doc) => sum + doc.sharedWith, 0)}
                </p>
                <p className="text-sm text-gray-400">Shared Access</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{accessLogs.length}</p>
                <p className="text-sm text-gray-400">Access Events</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-gray-400">Security Alerts</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search secure documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Types</option>
                <option value="identity">Identity</option>
                <option value="contract">Contracts</option>
                <option value="financial">Financial</option>
                <option value="medical">Medical</option>
                <option value="legal">Legal</option>
                <option value="other">Other</option>
              </select>

              <button
                onClick={() => setShowAccessLogs(!showAccessLogs)}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${showAccessLogs
                    ? 'bg-blue-500/30 text-blue-300'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
              >
                <Clock className="w-4 h-4" />
                Access Logs
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-orange-600 transition-all font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Secure
              </button>
              <button className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Security Settings
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        {!showAccessLogs ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.fileType)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{doc.name}</h3>
                      <p className="text-xs text-gray-400">{doc.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.encrypted && (
                      <Lock className="w-4 h-4 text-red-400" />
                    )}
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(doc.type)}`}>
                      {doc.type}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Access Level</span>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getAccessLevelColor(doc.accessLevel)}`}>
                      {doc.accessLevel}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Shared With</span>
                    <span className="text-xs text-white">{doc.sharedWith} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Last Accessed</span>
                    <span className="text-xs text-white">{doc.lastAccessed}</span>
                  </div>
                  {doc.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Expires</span>
                      <span className="text-xs text-yellow-400">{doc.expiresAt}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-400">Owner: {doc.owner}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Access Logs</h2>
            <div className="space-y-3">
              {accessLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getActionColor(log.action)} bg-current/20`}>
                          {log.action === 'view' && <Eye className="w-4 h-4" />}
                          {log.action === 'download' && <Download className="w-4 h-4" />}
                          {log.action === 'share' && <UserCheck className="w-4 h-4" />}
                          {log.action === 'delete' && <Trash2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {log.user} {log.action}ed {log.documentName}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{log.timestamp}</span>
                            <span>{log.ipAddress}</span>
                            <span>{log.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredDocuments.length === 0 && !showAccessLogs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12"
          >
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No secure documents found</h3>
            <p className="text-gray-500">Upload your first encrypted document to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
