'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import MemorAILayout from '../../components/layout/MemorAILayout'
import DataManager from '../../components/data/DataManager'
import {
  Database,
  Download,
  Upload,
  Archive,
  Package,
  Settings,
  Shield,
  Clock,
  HardDrive,
  Cloud,
  Zap,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react'

export default function DataManagementPage() {
  const [storageStats] = useState({
    totalMemories: 1247,
    totalSize: '94.7 MB',
    backupCount: 12,
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    cloudSync: true,
    encryptionEnabled: true,
    compressionRatio: 0.73
  })

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
    <MemorAILayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
            <Database className="w-10 h-10 mr-3 text-purple-400" />
            Data Management 💾
          </h1>
          <p className="text-slate-300 text-lg">
            Export, import, backup, and manage your memory ecosystem
          </p>
        </motion.div>

        {/* Storage Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {storageStats.totalMemories.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">Total Memories</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {storageStats.totalSize}
            </div>
            <div className="text-slate-400 text-sm">Storage Used</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {storageStats.backupCount}
            </div>
            <div className="text-slate-400 text-sm">Backups Created</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(storageStats.compressionRatio * 100)}%
            </div>
            <div className="text-slate-400 text-sm">Compression</div>
          </div>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-emerald-400" />
              Security Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Encryption</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${storageStats.encryptionEnabled ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="text-white text-sm">
                    {storageStats.encryptionEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Cloud Sync</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${storageStats.cloudSync ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="text-white text-sm">
                    {storageStats.cloudSync ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Last Backup</span>
                <span className="text-white text-sm">
                  {formatDate(storageStats.lastBackup)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-blue-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300 text-sm">Export</span>
              </button>
              <button className="flex items-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <Upload className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300 text-sm">Import</span>
              </button>
              <button className="flex items-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <Archive className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 text-sm">Backup</span>
              </button>
              <button className="flex items-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 text-sm">Settings</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Manager Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DataManager />
        </motion.div>

        {/* Storage Usage Visualization */}
        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white mb-6">Storage Breakdown</h3>

          <div className="space-y-4">
            {[
              { type: 'Text Memories', size: 45.2, color: 'from-purple-500 to-pink-500' },
              { type: 'Code Snippets', size: 23.8, color: 'from-emerald-500 to-teal-500' },
              { type: 'Meeting Notes', size: 15.6, color: 'from-blue-500 to-cyan-500' },
              { type: 'Research Data', size: 10.1, color: 'from-yellow-500 to-orange-500' }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{item.type}</span>
                  <span className="text-white font-medium">{item.size} MB</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                    style={{ width: `${(item.size / 94.7) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MemorAILayout>
  )
}
