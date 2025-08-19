'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Monitor,
    Palette,
    Layout,
    Zap,
    Eye,
    RefreshCw,
    BarChart3,
    PieChart,
    LineChart,
    TrendingUp,
    Grid,
    List,
    Save,
    RotateCcw
} from 'lucide-react'

interface DashboardConfig {
    theme: 'light' | 'dark' | 'auto'
    colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'red'
    layout: 'compact' | 'comfortable' | 'spacious'
    chartType: 'line' | 'bar' | 'area' | 'mixed'
    refreshInterval: 5 | 10 | 30 | 60 | 300
    autoRefresh: boolean
    showGrid: boolean
    showTooltips: boolean
    animateCharts: boolean
    compactMode: boolean
    hideInactive: boolean
    defaultView: 'grid' | 'list'
    itemsPerPage: 10 | 25 | 50 | 100
}

export default function DashboardPreferences() {
    const [config, setConfig] = useState<DashboardConfig>({
        theme: 'light',
        colorScheme: 'blue',
        layout: 'comfortable',
        chartType: 'mixed',
        refreshInterval: 30,
        autoRefresh: true,
        showGrid: true,
        showTooltips: true,
        animateCharts: true,
        compactMode: false,
        hideInactive: false,
        defaultView: 'grid',
        itemsPerPage: 25
    })

    const [hasChanges, setHasChanges] = useState(false)

    const updateConfig = (updates: Partial<DashboardConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }))
        setHasChanges(true)
    }

    const saveChanges = () => {
        // Save to backend/localStorage
        setHasChanges(false)
    }

    const resetToDefaults = () => {
        setConfig({
            theme: 'light',
            colorScheme: 'blue',
            layout: 'comfortable',
            chartType: 'mixed',
            refreshInterval: 30,
            autoRefresh: true,
            showGrid: true,
            showTooltips: true,
            animateCharts: true,
            compactMode: false,
            hideInactive: false,
            defaultView: 'grid',
            itemsPerPage: 25
        })
        setHasChanges(true)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Preferences</h2>
                    <p className="text-gray-600">Customize your dashboard appearance and behavior</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={resetToDefaults}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                    </button>
                    <button
                        onClick={saveChanges}
                        disabled={!hasChanges}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${hasChanges
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>

            {/* Appearance Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    <span>Appearance</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                        <div className="space-y-2">
                            {[
                                { value: 'light', label: 'Light', desc: 'Clean white background' },
                                { value: 'dark', label: 'Dark', desc: 'Easy on the eyes' },
                                { value: 'auto', label: 'Auto', desc: 'Match system preference' }
                            ].map((theme) => (
                                <label key={theme.value} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={theme.value}
                                        checked={config.theme === theme.value}
                                        onChange={(e) => updateConfig({ theme: e.target.value as any })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">{theme.label}</div>
                                        <div className="text-sm text-gray-600">{theme.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Color Scheme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Color Scheme</label>
                        <div className="grid grid-cols-5 gap-2">
                            {[
                                { value: 'blue', color: 'bg-blue-500' },
                                { value: 'purple', color: 'bg-purple-500' },
                                { value: 'green', color: 'bg-green-500' },
                                { value: 'orange', color: 'bg-orange-500' },
                                { value: 'red', color: 'bg-red-500' }
                            ].map((scheme) => (
                                <button
                                    key={scheme.value}
                                    onClick={() => updateConfig({ colorScheme: scheme.value as any })}
                                    className={`w-12 h-12 rounded-lg ${scheme.color} ${config.colorScheme === scheme.value
                                            ? 'ring-2 ring-offset-2 ring-gray-400'
                                            : 'hover:scale-105'
                                        } transition-all`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Layout Density */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Layout Density</label>
                        <select
                            value={config.layout}
                            onChange={(e) => updateConfig({ layout: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="compact">Compact - More content in less space</option>
                            <option value="comfortable">Comfortable - Balanced spacing</option>
                            <option value="spacious">Spacious - Extra breathing room</option>
                        </select>
                    </div>

                    {/* Default View */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Default View</label>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => updateConfig({ defaultView: 'grid' })}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${config.defaultView === 'grid'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Grid className="w-4 h-4" />
                                <span>Grid</span>
                            </button>
                            <button
                                onClick={() => updateConfig({ defaultView: 'list' })}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${config.defaultView === 'list'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                <span>List</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Chart Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    <span>Chart Settings</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Default Chart Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Default Chart Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'line', icon: LineChart, label: 'Line' },
                                { value: 'bar', icon: BarChart3, label: 'Bar' },
                                { value: 'area', icon: TrendingUp, label: 'Area' },
                                { value: 'mixed', icon: PieChart, label: 'Mixed' }
                            ].map((chart) => (
                                <button
                                    key={chart.value}
                                    onClick={() => updateConfig({ chartType: chart.value as any })}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${config.chartType === chart.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <chart.icon className="w-4 h-4" />
                                    <span>{chart.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items Per Page */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Items Per Page</label>
                        <select
                            value={config.itemsPerPage}
                            onChange={(e) => updateConfig({ itemsPerPage: Number(e.target.value) as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={10}>10 items</option>
                            <option value={25}>25 items</option>
                            <option value={50}>50 items</option>
                            <option value={100}>100 items</option>
                        </select>
                    </div>
                </div>

                {/* Chart Options */}
                <div className="mt-6 space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Chart Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { key: 'showGrid', label: 'Show Grid Lines', desc: 'Display grid lines on charts' },
                            { key: 'showTooltips', label: 'Show Tooltips', desc: 'Display data tooltips on hover' },
                            { key: 'animateCharts', label: 'Animate Charts', desc: 'Enable chart animations' },
                            { key: 'compactMode', label: 'Compact Charts', desc: 'Reduce chart padding and margins' }
                        ].map((option) => (
                            <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config[option.key as keyof DashboardConfig] as boolean}
                                    onChange={(e) => updateConfig({ [option.key]: e.target.checked })}
                                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">{option.label}</div>
                                    <div className="text-sm text-gray-600">{option.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Performance Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span>Performance</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Auto Refresh */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
                            <input
                                type="checkbox"
                                checked={config.autoRefresh}
                                onChange={(e) => updateConfig({ autoRefresh: e.target.checked })}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>
                        {config.autoRefresh && (
                            <select
                                value={config.refreshInterval}
                                onChange={(e) => updateConfig({ refreshInterval: Number(e.target.value) as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={5}>Every 5 seconds</option>
                                <option value={10}>Every 10 seconds</option>
                                <option value={30}>Every 30 seconds</option>
                                <option value={60}>Every minute</option>
                                <option value={300}>Every 5 minutes</option>
                            </select>
                        )}
                    </div>

                    {/* Hide Inactive */}
                    <div>
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.hideInactive}
                                onChange={(e) => updateConfig({ hideInactive: e.target.checked })}
                                className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div>
                                <div className="font-medium text-gray-900">Hide Inactive Elements</div>
                                <div className="text-sm text-gray-600">Hide charts and widgets with no recent data</div>
                            </div>
                        </label>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
