'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database,
  Download,
  Upload,
  Trash2,
  Archive,
  Calendar,
  FileText,
  Save,
  AlertTriangle
} from 'lucide-react'

export default function DataSettings() {
  const [retentionPeriod, setRetentionPeriod] = useState(365)
  const [autoExport, setAutoExport] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Settings</h2>
          <p className="text-gray-600">Manage data retention, exports, and privacy</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Data Retention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Archive className="w-5 h-5 text-blue-500" />
          <span>Data Retention</span>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention Period</label>
            <select
              value={retentionPeriod}
              onChange={(e) => setRetentionPeriod(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
              <option value={730}>2 years</option>
              <option value={-1}>Indefinite</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Export Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Download className="w-5 h-5 text-green-500" />
          <span>Export Settings</span>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoExport}
              onChange={(e) => setAutoExport(e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <div className="font-medium text-gray-900">Auto Export</div>
              <div className="text-sm text-gray-600">Automatically export data weekly</div>
            </div>
          </label>
        </div>
      </motion.div>

      {/* Data Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-500" />
          <span>Data Actions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export All Data</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>Delete All Data</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
