import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Upload,
  Archive,
  Trash2,
  RefreshCw,
  FileText,
  Database,
  Cloud,
  HardDrive,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  Settings,
  Eye,
  MoreHorizontal,
  X,
  Search,
  Tag,
  Folder,
  History,
  Shield,
  Lock,
  Unlock,
  Share2,
  Copy
} from 'lucide-react'

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'markdown'
  includeMetadata: boolean
  includeConnections: boolean
  includeTags: boolean
  includeTimestamps: boolean
  dateRange?: {
    start: string
    end: string
  }
  memoryTypes: string[]
  compression: boolean
}

interface ImportOptions {
  source: 'json' | 'csv' | 'notion' | 'obsidian' | 'roam'
  overwriteExisting: boolean
  preserveIds: boolean
  createConnections: boolean
  mapTags: boolean
}

interface BackupInfo {
  id: string
  name: string
  size: string
  created: string
  type: 'manual' | 'automatic'
  status: 'completed' | 'in_progress' | 'failed'
  memoryCount: number
  includesConnections: boolean
  includesMetadata: boolean
}

interface DataManagerProps {
  onClose?: () => void
}

const DataManager: React.FC<DataManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup' | 'archive'>('export')
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeConnections: true,
    includeTags: true,
    includeTimestamps: true,
    memoryTypes: [],
    compression: false
  })
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    source: 'json',
    overwriteExisting: false,
    preserveIds: true,
    createConnections: true,
    mapTags: true
  })
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const tabs = [
    { id: 'export', label: 'Export', icon: Download },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'backup', label: 'Backup', icon: Archive },
    { id: 'archive', label: 'Archive', icon: Package }
  ]

  const exportFormats = [
    { value: 'json', label: 'JSON', description: 'Complete data with full structure' },
    { value: 'csv', label: 'CSV', description: 'Tabular format for analysis' },
    { value: 'pdf', label: 'PDF', description: 'Human-readable report' },
    { value: 'markdown', label: 'Markdown', description: 'Text format with formatting' }
  ]

  const importSources = [
    { value: 'json', label: 'JSON File', description: 'MEMORAI export file' },
    { value: 'csv', label: 'CSV File', description: 'Spreadsheet data' },
    { value: 'notion', label: 'Notion', description: 'Import from Notion workspace' },
    { value: 'obsidian', label: 'Obsidian', description: 'Markdown vault import' },
    { value: 'roam', label: 'Roam Research', description: 'Graph database export' }
  ]

  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = async () => {
    // Mock backup data - in real implementation, this would come from API
    const mockBackups: BackupInfo[] = [
      {
        id: 'backup-1',
        name: 'Complete Backup - January 2025',
        size: '24.5 MB',
        created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        type: 'manual',
        status: 'completed',
        memoryCount: 1247,
        includesConnections: true,
        includesMetadata: true
      },
      {
        id: 'backup-2',
        name: 'Weekly Auto Backup',
        size: '18.2 MB',
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'automatic',
        status: 'completed',
        memoryCount: 1156,
        includesConnections: true,
        includesMetadata: false
      },
      {
        id: 'backup-3',
        name: 'Research Memories Only',
        size: '8.7 MB',
        created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'manual',
        status: 'completed',
        memoryCount: 423,
        includesConnections: false,
        includesMetadata: true
      }
    ]
    setBackups(mockBackups)
  }

  const handleExport = async () => {
    try {
      setIsProcessing(true)

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create and download file
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        options: exportOptions,
        memories: [], // Would contain actual memory data
        connections: exportOptions.includeConnections ? [] : undefined,
        metadata: exportOptions.includeMetadata ? {} : undefined
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `memorai-export-${Date.now()}.${exportOptions.format}`
      link.click()
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    try {
      setIsProcessing(true)
      setUploadProgress(0)

      // Simulate file upload with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadProgress(i)
      }

      // Process import
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSelectedFile(null)
      setUploadProgress(0)

    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setIsProcessing(true)

      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000))

      const newBackup: BackupInfo = {
        id: `backup-${Date.now()}`,
        name: `Manual Backup - ${new Date().toLocaleDateString()}`,
        size: '25.8 MB',
        created: new Date().toISOString(),
        type: 'manual',
        status: 'completed',
        memoryCount: 1300,
        includesConnections: true,
        includesMetadata: true
      }

      setBackups(prev => [newBackup, ...prev])

    } catch (error) {
      console.error('Backup creation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Management</h2>
          <p className="text-slate-400">Export, import, backup, and archive your memories</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Export Options</h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Format Selection */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Export Format</h4>
                  <div className="space-y-2">
                    {exportFormats.map((format) => (
                      <label key={format.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="format"
                          value={format.value}
                          checked={exportOptions.format === format.value}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                          className="mt-1 w-4 h-4 text-purple-500"
                        />
                        <div>
                          <div className="text-white font-medium">{format.label}</div>
                          <div className="text-slate-400 text-sm">{format.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Content Options */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Include</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Metadata</span>
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMetadata}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Connections</span>
                      <input
                        type="checkbox"
                        checked={exportOptions.includeConnections}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeConnections: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Tags</span>
                      <input
                        type="checkbox"
                        checked={exportOptions.includeTags}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeTags: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Timestamps</span>
                      <input
                        type="checkbox"
                        checked={exportOptions.includeTimestamps}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Compression</span>
                      <input
                        type="checkbox"
                        checked={exportOptions.compression}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, compression: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Export Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'import' && (
          <motion.div
            key="import"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Import Data</h3>

              <div className="space-y-6">
                {/* Source Selection */}
                <div>
                  <h4 className="text-white font-medium mb-4">Import Source</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {importSources.map((source) => (
                      <label key={source.value} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                        <input
                          type="radio"
                          name="source"
                          value={source.value}
                          checked={importOptions.source === source.value}
                          onChange={(e) => setImportOptions(prev => ({ ...prev, source: e.target.value as any }))}
                          className="mt-1 w-4 h-4 text-purple-500"
                        />
                        <div>
                          <div className="text-white font-medium">{source.label}</div>
                          <div className="text-slate-400 text-sm">{source.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <h4 className="text-white font-medium mb-4">Select File</h4>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    {selectedFile ? (
                      <div className="space-y-3">
                        <FileText className="w-12 h-12 text-purple-400 mx-auto" />
                        <div>
                          <div className="text-white font-medium">{selectedFile.name}</div>
                          <div className="text-slate-400 text-sm">{formatFileSize(selectedFile.size)}</div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                        <div>
                          <div className="text-white font-medium">Drop file here or click to browse</div>
                          <div className="text-slate-400 text-sm">Supports JSON, CSV, and other formats</div>
                        </div>
                        <input
                          type="file"
                          accept=".json,.csv,.md,.txt"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-block px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white cursor-pointer transition-colors"
                        >
                          Browse Files
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Import Options */}
                <div>
                  <h4 className="text-white font-medium mb-4">Import Settings</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Overwrite existing</span>
                      <input
                        type="checkbox"
                        checked={importOptions.overwriteExisting}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Preserve IDs</span>
                      <input
                        type="checkbox"
                        checked={importOptions.preserveIds}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, preserveIds: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Create connections</span>
                      <input
                        type="checkbox"
                        checked={importOptions.createConnections}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, createConnections: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-slate-300">Map tags</span>
                      <input
                        type="checkbox"
                        checked={importOptions.mapTags}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, mapTags: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Progress */}
                {isProcessing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Importing...</span>
                      <span className="text-slate-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/20">
                  <button
                    onClick={handleImport}
                    disabled={!selectedFile || isProcessing}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Import Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'backup' && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Backup Management</h3>
                <button
                  onClick={handleCreateBackup}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  {isProcessing ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  <span>Create Backup</span>
                </button>
              </div>

              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${backup.type === 'manual'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}>
                        <Archive className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{backup.name}</div>
                        <div className="text-slate-400 text-sm flex items-center space-x-4">
                          <span>{formatDate(backup.created)}</span>
                          <span>•</span>
                          <span>{backup.size}</span>
                          <span>•</span>
                          <span>{backup.memoryCount.toLocaleString()} memories</span>
                          <span>•</span>
                          <span className="capitalize">{backup.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${backup.status === 'completed' ? 'bg-emerald-400' :
                          backup.status === 'in_progress' ? 'bg-yellow-400' :
                            'bg-red-400'
                        }`} />
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-slate-300" />
                      </button>
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-300" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'archive' && (
          <motion.div
            key="archive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Archive Management</h3>

              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Archive Features</h4>
                <p className="text-slate-400 mb-6">
                  Archive old memories to optimize performance while keeping them accessible.
                </p>
                <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors">
                  Configure Archiving
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DataManager
