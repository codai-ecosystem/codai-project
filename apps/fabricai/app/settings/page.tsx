'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FabricAILayout from '../../components/layout/FabricAILayout'
import FabricAIService from '../../services/fabricaiService'
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Palette,
    Code,
    Database,
    Cloud,
    Key,
    Monitor,
    Moon,
    Sun,
    Globe,
    Zap,
    Save,
    RefreshCw,
    Download,
    Upload,
    Trash2,
    Eye,
    EyeOff,
    Check,
    X,
    AlertTriangle,
    Info,
    ChevronRight,
    ChevronDown,
    Plus,
    Minus,
    Copy,
    Edit3,
    ExternalLink
} from 'lucide-react'

interface SettingsSection {
    id: string
    title: string
    description: string
    icon: any
    settings: Setting[]
}

interface Setting {
    id: string
    label: string
    description: string
    type: 'toggle' | 'select' | 'input' | 'slider' | 'color' | 'textarea' | 'api_key'
    value: any
    options?: string[]
    min?: number
    max?: number
    step?: number
    placeholder?: string
    validation?: string
    required?: boolean
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsSection[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeSection, setActiveSection] = useState<string>('profile')
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile']))
    const [showApiKeys, setShowApiKeys] = useState<Set<string>>(new Set())

    const fabricaiService = FabricAIService.getInstance()

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            setIsLoading(true)

            // Mock settings data
            const settingsData: SettingsSection[] = [
                {
                    id: 'profile',
                    title: 'Profile',
                    description: 'Manage your personal information and preferences',
                    icon: User,
                    settings: [
                        {
                            id: 'display_name',
                            label: 'Display Name',
                            description: 'Your name as it appears to others',
                            type: 'input',
                            value: 'John Doe',
                            placeholder: 'Enter your display name',
                            required: true
                        },
                        {
                            id: 'email',
                            label: 'Email Address',
                            description: 'Your primary email address',
                            type: 'input',
                            value: 'john@example.com',
                            placeholder: 'Enter your email',
                            validation: 'email',
                            required: true
                        },
                        {
                            id: 'avatar_url',
                            label: 'Avatar URL',
                            description: 'URL to your profile picture',
                            type: 'input',
                            value: '',
                            placeholder: 'https://example.com/avatar.jpg'
                        },
                        {
                            id: 'bio',
                            label: 'Bio',
                            description: 'Tell others about yourself',
                            type: 'textarea',
                            value: 'AI Development enthusiast building the future with FabricAI.',
                            placeholder: 'Write a short bio...'
                        }
                    ]
                },
                {
                    id: 'appearance',
                    title: 'Appearance',
                    description: 'Customize the look and feel of your workspace',
                    icon: Palette,
                    settings: [
                        {
                            id: 'theme',
                            label: 'Theme',
                            description: 'Choose your preferred color scheme',
                            type: 'select',
                            value: 'dark',
                            options: ['light', 'dark', 'auto']
                        },
                        {
                            id: 'accent_color',
                            label: 'Accent Color',
                            description: 'Primary color for UI elements',
                            type: 'color',
                            value: '#8b5cf6'
                        },
                        {
                            id: 'font_size',
                            label: 'Font Size',
                            description: 'Text size throughout the application',
                            type: 'slider',
                            value: 14,
                            min: 10,
                            max: 20,
                            step: 1
                        },
                        {
                            id: 'animations',
                            label: 'Enable Animations',
                            description: 'Show smooth transitions and effects',
                            type: 'toggle',
                            value: true
                        },
                        {
                            id: 'compact_mode',
                            label: 'Compact Mode',
                            description: 'Reduce spacing for more content',
                            type: 'toggle',
                            value: false
                        }
                    ]
                },
                {
                    id: 'notifications',
                    title: 'Notifications',
                    description: 'Control when and how you receive notifications',
                    icon: Bell,
                    settings: [
                        {
                            id: 'email_notifications',
                            label: 'Email Notifications',
                            description: 'Receive updates via email',
                            type: 'toggle',
                            value: true
                        },
                        {
                            id: 'push_notifications',
                            label: 'Push Notifications',
                            description: 'Browser notifications for important events',
                            type: 'toggle',
                            value: true
                        },
                        {
                            id: 'workflow_alerts',
                            label: 'Workflow Alerts',
                            description: 'Notifications when workflows complete',
                            type: 'toggle',
                            value: true
                        },
                        {
                            id: 'security_alerts',
                            label: 'Security Alerts',
                            description: 'Notifications for security events',
                            type: 'toggle',
                            value: true
                        },
                        {
                            id: 'notification_frequency',
                            label: 'Notification Frequency',
                            description: 'How often to receive digest emails',
                            type: 'select',
                            value: 'daily',
                            options: ['immediate', 'hourly', 'daily', 'weekly', 'never']
                        }
                    ]
                },
                {
                    id: 'ai_settings',
                    title: 'AI Configuration',
                    description: 'Configure AI models and behavior',
                    icon: Zap,
                    settings: [
                        {
                            id: 'default_model',
                            label: 'Default AI Model',
                            description: 'Primary model for code generation',
                            type: 'select',
                            value: 'gpt-4',
                            options: ['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'codex']
                        },
                        {
                            id: 'creativity_level',
                            label: 'Creativity Level',
                            description: 'How creative AI responses should be',
                            type: 'slider',
                            value: 0.7,
                            min: 0,
                            max: 1,
                            step: 0.1
                        },
                        {
                            id: 'code_style',
                            label: 'Code Style Preference',
                            description: 'Preferred coding style for generated code',
                            type: 'select',
                            value: 'typescript',
                            options: ['typescript', 'javascript', 'python', 'rust', 'go']
                        },
                        {
                            id: 'auto_suggestions',
                            label: 'Auto Suggestions',
                            description: 'Show AI suggestions while typing',
                            type: 'toggle',
                            value: true
                        },
                        {
                            id: 'context_awareness',
                            label: 'Context Awareness',
                            description: 'Use project context for better suggestions',
                            type: 'toggle',
                            value: true
                        }
                    ]
                },
                {
                    id: 'api_keys',
                    title: 'API Keys',
                    description: 'Manage your API keys and integrations',
                    icon: Key,
                    settings: [
                        {
                            id: 'openai_api_key',
                            label: 'OpenAI API Key',
                            description: 'Your OpenAI API key for GPT models',
                            type: 'api_key',
                            value: 'sk-...',
                            placeholder: 'Enter your OpenAI API key'
                        },
                        {
                            id: 'anthropic_api_key',
                            label: 'Anthropic API Key',
                            description: 'Your Anthropic API key for Claude models',
                            type: 'api_key',
                            value: '',
                            placeholder: 'Enter your Anthropic API key'
                        },
                        {
                            id: 'github_token',
                            label: 'GitHub Personal Access Token',
                            description: 'Token for GitHub integration',
                            type: 'api_key',
                            value: 'ghp_...',
                            placeholder: 'Enter your GitHub token'
                        }
                    ]
                },
                {
                    id: 'security',
                    title: 'Security',
                    description: 'Security and privacy settings',
                    icon: Shield,
                    settings: [
                        {
                            id: 'two_factor_auth',
                            label: 'Two-Factor Authentication',
                            description: 'Add an extra layer of security',
                            type: 'toggle',
                            value: false
                        },
                        {
                            id: 'session_timeout',
                            label: 'Session Timeout (minutes)',
                            description: 'Automatically log out after inactivity',
                            type: 'slider',
                            value: 60,
                            min: 15,
                            max: 480,
                            step: 15
                        },
                        {
                            id: 'data_encryption',
                            label: 'Local Data Encryption',
                            description: 'Encrypt sensitive data stored locally',
                            type: 'toggle',
                            value: true
                        },
                        {
                            id: 'usage_analytics',
                            label: 'Usage Analytics',
                            description: 'Help improve FabricAI by sharing usage data',
                            type: 'toggle',
                            value: true
                        }
                    ]
                }
            ]

            setSettings(settingsData)
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateSetting = (sectionId: string, settingId: string, value: any) => {
        setSettings(prev => prev.map(section =>
            section.id === sectionId
                ? {
                    ...section,
                    settings: section.settings.map(setting =>
                        setting.id === settingId ? { ...setting, value } : setting
                    )
                }
                : section
        ))
        setHasUnsavedChanges(true)
    }

    const saveSettings = async () => {
        setIsSaving(true)

        // Simulate API call
        setTimeout(() => {
            setHasUnsavedChanges(false)
            setIsSaving(false)
        }, 1500)
    }

    const resetSettings = () => {
        loadSettings()
        setHasUnsavedChanges(false)
    }

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev)
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId)
            } else {
                newSet.add(sectionId)
            }
            return newSet
        })
    }

    const toggleApiKeyVisibility = (settingId: string) => {
        setShowApiKeys(prev => {
            const newSet = new Set(prev)
            if (newSet.has(settingId)) {
                newSet.delete(settingId)
            } else {
                newSet.add(settingId)
            }
            return newSet
        })
    }

    const renderSetting = (setting: Setting, sectionId: string) => {
        switch (setting.type) {
            case 'toggle':
                return (
                    <motion.button
                        className={`relative w-12 h-6 rounded-full transition-colors ${setting.value ? 'bg-purple-500' : 'bg-slate-600'
                            }`}
                        onClick={() => updateSetting(sectionId, setting.id, !setting.value)}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                            animate={{ x: setting.value ? 26 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </motion.button>
                )

            case 'select':
                return (
                    <select
                        value={setting.value}
                        onChange={(e) => updateSetting(sectionId, setting.id, e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {setting.options?.map(option => (
                            <option key={option} value={option} className="bg-slate-800">
                                {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                )

            case 'input':
                return (
                    <input
                        type={setting.validation === 'email' ? 'email' : 'text'}
                        value={setting.value}
                        onChange={(e) => updateSetting(sectionId, setting.id, e.target.value)}
                        placeholder={setting.placeholder}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                )

            case 'textarea':
                return (
                    <textarea
                        value={setting.value}
                        onChange={(e) => updateSetting(sectionId, setting.id, e.target.value)}
                        placeholder={setting.placeholder}
                        rows={3}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                )

            case 'slider':
                return (
                    <div className="flex items-center space-x-4">
                        <input
                            type="range"
                            min={setting.min}
                            max={setting.max}
                            step={setting.step}
                            value={setting.value}
                            onChange={(e) => updateSetting(sectionId, setting.id, parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span className="text-slate-300 text-sm w-12 text-right">{setting.value}</span>
                    </div>
                )

            case 'color':
                return (
                    <div className="flex items-center space-x-3">
                        <input
                            type="color"
                            value={setting.value}
                            onChange={(e) => updateSetting(sectionId, setting.id, e.target.value)}
                            className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer"
                        />
                        <span className="text-slate-300 text-sm font-mono">{setting.value}</span>
                    </div>
                )

            case 'api_key': {
                const isVisible = showApiKeys.has(setting.id)
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type={isVisible ? 'text' : 'password'}
                            value={setting.value}
                            onChange={(e) => updateSetting(sectionId, setting.id, e.target.value)}
                            placeholder={setting.placeholder}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                        />
                        <button
                            onClick={() => toggleApiKeyVisibility(setting.id)}
                            className="p-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                        >
                            {isVisible ? (
                                <EyeOff className="w-4 h-4 text-slate-400" />
                            ) : (
                                <Eye className="w-4 h-4 text-slate-400" />
                            )}
                        </button>
                        <button
                            onClick={() => navigator.clipboard?.writeText(setting.value)}
                            className="p-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                        >
                            <Copy className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                )
            }

            default:
                return null
        }
    }

    if (isLoading) {
        return (
            <FabricAILayout>
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        className="flex items-center space-x-3 text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-lg font-medium">Loading Settings...</span>
                    </motion.div>
                </div>
            </FabricAILayout>
        )
    }

    return (
        <FabricAILayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <SettingsIcon className="w-8 h-8 mr-3 text-purple-400" />
                            Settings
                        </h1>
                        <p className="text-slate-300">Customize your FabricAI experience</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {hasUnsavedChanges && (
                            <motion.div
                                className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm">Unsaved changes</span>
                            </motion.div>
                        )}

                        <motion.button
                            className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetSettings}
                        >
                            <RefreshCw className="w-4 h-4 mr-2 inline" />
                            Reset
                        </motion.button>

                        <motion.button
                            className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${isSaving || !hasUnsavedChanges
                                ? 'bg-slate-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600'
                                }`}
                            whileHover={hasUnsavedChanges && !isSaving ? { scale: 1.05 } : {}}
                            whileTap={hasUnsavedChanges && !isSaving ? { scale: 0.95 } : {}}
                            onClick={saveSettings}
                            disabled={isSaving || !hasUnsavedChanges}
                        >
                            {isSaving ? (
                                <>
                                    <motion.div
                                        className="w-4 h-4 border border-white border-t-transparent rounded-full mr-2 inline-block"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2 inline" />
                                    Save Changes
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {settings.map((section, sectionIndex) => {
                        const SectionIcon = section.icon
                        const isExpanded = expandedSections.has(section.id)

                        return (
                            <motion.div
                                key={section.id}
                                className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: sectionIndex * 0.1 }}
                            >
                                {/* Section Header */}
                                <button
                                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                            <SectionIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-white font-semibold text-lg">{section.title}</h3>
                                            <p className="text-slate-300 text-sm">{section.description}</p>
                                        </div>
                                    </div>

                                    <motion.div
                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    </motion.div>
                                </button>

                                {/* Section Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            className="px-6 pb-6"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="border-t border-white/20 pt-6 space-y-6">
                                                {section.settings.map((setting, settingIndex) => (
                                                    <motion.div
                                                        key={setting.id}
                                                        className="flex items-start justify-between space-x-6"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: settingIndex * 0.05 }}
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <label className="text-white font-medium">
                                                                    {setting.label}
                                                                </label>
                                                                {setting.required && (
                                                                    <span className="text-red-400 text-sm">*</span>
                                                                )}
                                                            </div>
                                                            <p className="text-slate-400 text-sm">{setting.description}</p>
                                                        </div>

                                                        <div className="flex-shrink-0">
                                                            {renderSetting(setting, section.id)}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Export/Import Settings */}
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-blue-400" />
                        Settings Management
                    </h3>

                    <div className="flex items-center space-x-4">
                        <motion.button
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Settings</span>
                        </motion.button>

                        <motion.button
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Upload className="w-4 h-4" />
                            <span>Import Settings</span>
                        </motion.button>

                        <motion.button
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Reset All Settings</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </FabricAILayout>
    )
}
