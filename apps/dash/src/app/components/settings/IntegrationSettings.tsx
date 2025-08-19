'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap,
  Key,
  Link,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Save,
  Copy
} from 'lucide-react'

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  created: string
  lastUsed: string
  status: 'active' | 'inactive'
}

export default function IntegrationSettings() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production Dashboard',
      key: 'dash_prod_***************',
      permissions: ['read', 'write'],
      created: '2024-01-15',
      lastUsed: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Analytics Export',
      key: 'dash_exp_***************',
      permissions: ['read'],
      created: '2024-02-01',
      lastUsed: '1 day ago',
      status: 'active'
    }
  ])

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [newKeyName, setNewKeyName] = useState('')
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const createNewKey = () => {
    if (!newKeyName.trim()) return
    
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `dash_${Date.now()}_***************`,
      permissions: ['read'],
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active'
    }
    
    setApiKeys(prev => [...prev, newKey])
    setNewKeyName('')
    setShowNewKeyForm(false)
  }

  const deleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integration Settings</h2>
          <p className="text-gray-600">Manage API keys and third-party integrations</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Key className="w-5 h-5 text-yellow-500" />
            <span>API Keys</span>
          </h3>
          <button
            onClick={() => setShowNewKeyForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New API Key</span>
          </button>
        </div>

        {/* New Key Form */}
        {showNewKeyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="API Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={createNewKey}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewKeyForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apiKey.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {showKeys[apiKey.id] ? apiKey.key.replace('***************', 'sk_live_abc123def456ghi789') : apiKey.key}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>Created: {apiKey.created}</span>
                    <span>Last used: {apiKey.lastUsed}</span>
                    <span>Permissions: {apiKey.permissions.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteKey(apiKey.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Third-party Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Link className="w-5 h-5 text-blue-500" />
          <span>Third-party Integrations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Slack', desc: 'Send notifications to Slack channels', connected: true },
            { name: 'Microsoft Teams', desc: 'Integrate with Teams workflow', connected: false },
            { name: 'Salesforce', desc: 'Sync CRM data for analytics', connected: true },
            { name: 'Google Analytics', desc: 'Import web analytics data', connected: false }
          ].map((integration) => (
            <div key={integration.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{integration.name}</h4>
                {integration.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{integration.desc}</p>
              <button className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                integration.connected
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}>
                {integration.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
