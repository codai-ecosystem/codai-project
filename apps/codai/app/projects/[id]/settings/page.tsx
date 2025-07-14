'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Save,
    RefreshCw,
    Settings,
    Package,
    Code,
    Globe,
    User,
    Key,
    Terminal,
    Folder,
    GitBranch,
    Info,
    Plus,
    Trash2,
    Copy,
    Check,
    Clock,
    XCircle
} from 'lucide-react'

interface ProjectSettings {
    name: string
    description?: string
    framework?: string
    buildCommand?: string
    outputDirectory?: string
    installCommand?: string
    devCommand?: string
    environmentVariables?: Record<string, string>
    scripts?: Record<string, string>
    author?: string
    license?: string
    repository?: string
    homepage?: string
    keywords?: string[]
    private?: boolean
    version?: string
}

interface ProjectMetadata extends ProjectSettings {
    id: string
    path: string
    lastModified: string
    size: number
    fileCount: number
}

interface ProjectSettingsPageProps {
    params: { id: string }
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
    const router = useRouter()
    const { id } = params

    const [settings, setSettings] = useState<ProjectMetadata | null>(null)
    const [defaults, setDefaults] = useState<Partial<ProjectSettings>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [activeTab, setActiveTab] = useState('general')
    const [updatePackageJson, setUpdatePackageJson] = useState(true)

    // Form state
    const [formData, setFormData] = useState<ProjectSettings>({
        name: '',
        description: '',
        framework: '',
        buildCommand: '',
        outputDirectory: '',
        installCommand: '',
        devCommand: '',
        environmentVariables: {},
        scripts: {},
        author: '',
        license: '',
        repository: '',
        homepage: '',
        keywords: [],
        private: false,
        version: ''
    })

    // Environment variables state
    const [newEnvKey, setNewEnvKey] = useState('')
    const [newEnvValue, setNewEnvValue] = useState('')

    // Scripts state
    const [newScriptKey, setNewScriptKey] = useState('')
    const [newScriptValue, setNewScriptValue] = useState('')

    // Keywords state
    const [newKeyword, setNewKeyword] = useState('')

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 5000)
    }

    const loadSettings = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/projects/${id}/settings`)
            if (response.ok) {
                const data = await response.json()
                setSettings(data.settings)
                setDefaults(data.defaults || {})
                setFormData(data.settings)
            } else {
                const error = await response.json()
                showMessage('error', error.error || 'Failed to load project settings')
            }
        } catch (error) {
            showMessage('error', 'Failed to load project settings')
            console.error('Load settings error:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        setSaving(true)
        try {
            const response = await fetch(`/api/projects/${id}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, updatePackageJson })
            })

            if (response.ok) {
                const data = await response.json()
                setSettings(data.settings)
                showMessage('success', 'Project settings saved successfully')
            } else {
                const error = await response.json()
                showMessage('error', error.error || 'Failed to save project settings')
            }
        } catch (error) {
            showMessage('error', 'Failed to save project settings')
            console.error('Save settings error:', error)
        } finally {
            setSaving(false)
        }
    }

    const resetSettings = async () => {
        if (!confirm('Are you sure you want to reset all project settings to defaults?')) {
            return
        }

        try {
            const response = await fetch(`/api/projects/${id}/settings`, {
                method: 'DELETE'
            })

            if (response.ok) {
                showMessage('success', 'Project settings reset successfully')
                await loadSettings() // Reload settings
            } else {
                const error = await response.json()
                showMessage('error', error.error || 'Failed to reset project settings')
            }
        } catch (error) {
            showMessage('error', 'Failed to reset project settings')
            console.error('Reset settings error:', error)
        }
    }

    const updateFormData = (field: keyof ProjectSettings, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addEnvironmentVariable = () => {
        if (!newEnvKey.trim() || !newEnvValue.trim()) return

        updateFormData('environmentVariables', {
            ...formData.environmentVariables,
            [newEnvKey]: newEnvValue
        })
        setNewEnvKey('')
        setNewEnvValue('')
    }

    const removeEnvironmentVariable = (key: string) => {
        const updated = { ...formData.environmentVariables }
        delete updated[key]
        updateFormData('environmentVariables', updated)
    }

    const addScript = () => {
        if (!newScriptKey.trim() || !newScriptValue.trim()) return

        updateFormData('scripts', {
            ...formData.scripts,
            [newScriptKey]: newScriptValue
        })
        setNewScriptKey('')
        setNewScriptValue('')
    }

    const removeScript = (key: string) => {
        const updated = { ...formData.scripts }
        delete updated[key]
        updateFormData('scripts', updated)
    }

    const addKeyword = () => {
        if (!newKeyword.trim()) return
        if (formData.keywords?.includes(newKeyword)) return

        updateFormData('keywords', [...(formData.keywords || []), newKeyword])
        setNewKeyword('')
    }

    const removeKeyword = (keyword: string) => {
        updateFormData('keywords', formData.keywords?.filter(k => k !== keyword) || [])
    }

    const formatFileSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB']
        let size = bytes
        let unitIndex = 0

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024
            unitIndex++
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    useEffect(() => {
        loadSettings()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading project settings...</span>
                </div>
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
                    <p className="text-gray-600 mb-4">The requested project could not be found.</p>
                    <button
                        onClick={() => router.push('/projects')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Settings className="h-6 w-6" />
                                    Project Settings
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Configure your project settings and metadata
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={resetSettings}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                                >
                                    Reset to Defaults
                                </button>
                                <button
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                >
                                    {saving ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Project Info */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Path:</span>
                                <span className="text-gray-600 font-mono text-xs">{settings.path}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Files:</span>
                                <span className="text-gray-600">{settings.fileCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Size:</span>
                                <span className="text-gray-600">{formatFileSize(settings.size)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Modified:</span>
                                <span className="text-gray-600">{new Date(settings.lastModified).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-md ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        <div className="flex items-center gap-2">
                            {message.type === 'success' ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <XCircle className="h-4 w-4" />
                            )}
                            {message.text}
                        </div>
                    </div>
                )}

                {/* Settings Form */}
                <div className="bg-white rounded-lg shadow">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'general', label: 'General', icon: Package },
                                { id: 'build', label: 'Build & Scripts', icon: Terminal },
                                { id: 'metadata', label: 'Metadata', icon: Info },
                                { id: 'environment', label: 'Environment', icon: Key }
                            ].map(tab => {
                                const IconComponent = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <IconComponent className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => updateFormData('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="My Project"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Version
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.version || ''}
                                            onChange={(e) => updateFormData('version', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="1.0.0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => updateFormData('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="A brief description of your project"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Framework
                                        </label>
                                        <select
                                            value={formData.framework || ''}
                                            onChange={(e) => updateFormData('framework', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select framework</option>
                                            <option value="Next.js">Next.js</option>
                                            <option value="React">React</option>
                                            <option value="Vue.js">Vue.js</option>
                                            <option value="Angular">Angular</option>
                                            <option value="Express">Express</option>
                                            <option value="Fastify">Fastify</option>
                                            <option value="TypeScript">TypeScript</option>
                                            <option value="Vite">Vite</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {defaults.framework && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Detected: {defaults.framework}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Privacy
                                        </label>
                                        <select
                                            value={formData.private ? 'true' : 'false'}
                                            onChange={(e) => updateFormData('private', e.target.value === 'true')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="false">Public</option>
                                            <option value="true">Private</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'build' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Install Command
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.installCommand || ''}
                                            onChange={(e) => updateFormData('installCommand', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="npm install"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Development Command
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.devCommand || ''}
                                            onChange={(e) => updateFormData('devCommand', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="npm run dev"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Build Command
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.buildCommand || ''}
                                            onChange={(e) => updateFormData('buildCommand', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="npm run build"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Output Directory
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.outputDirectory || ''}
                                            onChange={(e) => updateFormData('outputDirectory', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="dist"
                                        />
                                    </div>
                                </div>

                                {/* Custom Scripts */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Custom Scripts
                                    </label>

                                    <div className="space-y-3">
                                        {Object.entries(formData.scripts || {}).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={key}
                                                    readOnly
                                                    className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => updateFormData('scripts', {
                                                        ...formData.scripts,
                                                        [key]: e.target.value
                                                    })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                                <button
                                                    onClick={() => removeScript(key)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={newScriptKey}
                                                onChange={(e) => setNewScriptKey(e.target.value)}
                                                placeholder="Script name"
                                                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={newScriptValue}
                                                onChange={(e) => setNewScriptValue(e.target.value)}
                                                placeholder="Script command"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            />
                                            <button
                                                onClick={addScript}
                                                disabled={!newScriptKey.trim() || !newScriptValue.trim()}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'metadata' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Author
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.author || ''}
                                            onChange={(e) => updateFormData('author', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Your Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            License
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.license || ''}
                                            onChange={(e) => updateFormData('license', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="MIT"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Repository URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.repository || ''}
                                            onChange={(e) => updateFormData('repository', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://github.com/username/repo"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Homepage URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.homepage || ''}
                                            onChange={(e) => updateFormData('homepage', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://your-project.com"
                                        />
                                    </div>
                                </div>

                                {/* Keywords */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Keywords
                                    </label>

                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {(formData.keywords || []).map((keyword) => (
                                                <span
                                                    key={keyword}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {keyword}
                                                    <button
                                                        onClick={() => removeKeyword(keyword)}
                                                        className="hover:bg-blue-200 rounded-full p-0.5"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={newKeyword}
                                                onChange={(e) => setNewKeyword(e.target.value)}
                                                placeholder="Add keyword"
                                                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            />
                                            <button
                                                onClick={addKeyword}
                                                disabled={!newKeyword.trim()}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'environment' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Environment Variables
                                    </label>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Configure environment variables for your project. These will be saved in your project settings.
                                    </p>

                                    <div className="space-y-3">
                                        {Object.entries(formData.environmentVariables || {}).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={key}
                                                    readOnly
                                                    className="w-48 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                                                />
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => updateFormData('environmentVariables', {
                                                        ...formData.environmentVariables,
                                                        [key]: e.target.value
                                                    })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                                />
                                                <button
                                                    onClick={() => removeEnvironmentVariable(key)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={newEnvKey}
                                                onChange={(e) => setNewEnvKey(e.target.value)}
                                                placeholder="VARIABLE_NAME"
                                                className="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                            />
                                            <input
                                                type="text"
                                                value={newEnvValue}
                                                onChange={(e) => setNewEnvValue(e.target.value)}
                                                placeholder="Variable value"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                            />
                                            <button
                                                onClick={addEnvironmentVariable}
                                                disabled={!newEnvKey.trim() || !newEnvValue.trim()}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="update-package-json"
                                    checked={updatePackageJson}
                                    onChange={(e) => setUpdatePackageJson(e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="update-package-json" className="text-sm text-gray-700">
                                    Update package.json when saving
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.push(`/projects/${id}`)}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                >
                                    {saving ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
