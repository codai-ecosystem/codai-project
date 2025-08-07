import React from 'react'
/**
 * Theme Settings Component - Appearance and Visual Customization
 */
'use client'

import { motion } from 'framer-motion'
import {
    Palette, Sun, Moon, Monitor, Eye, Zap,
    Paintbrush, Layout, Sparkles, Settings,
    Contrast, Type, Grid, Image
} from 'lucide-react'
import { useState } from 'react'

interface ThemeSettingsProps {
    settings: any
    onChange: (section: string, key: string, value: any) => void
}

export function ThemeSettings({ settings, onChange }: ThemeSettingsProps) {
    const [customColor, setCustomColor] = useState(settings.accentColor || '#3B82F6')

    const themeOptions = [
        {
            id: 'light',
            label: 'Light Theme',
            icon: Sun,
            description: 'Clean and bright interface',
            preview: 'bg-white border-gray-200'
        },
        {
            id: 'dark',
            label: 'Dark Theme',
            icon: Moon,
            description: 'Reduced eye strain in low light',
            preview: 'bg-gray-900 border-gray-700'
        },
        {
            id: 'auto',
            label: 'System Auto',
            icon: Monitor,
            description: 'Follow system preference',
            preview: 'bg-gradient-to-r from-white to-gray-900'
        }
    ]

    const accentColors = [
        { color: '#3B82F6', name: 'Blue' },
        { color: '#10B981', name: 'Green' },
        { color: '#8B5CF6', name: 'Purple' },
        { color: '#F59E0B', name: 'Amber' },
        { color: '#EF4444', name: 'Red' },
        { color: '#06B6D4', name: 'Cyan' },
        { color: '#EC4899', name: 'Pink' },
        { color: '#84CC16', name: 'Lime' }
    ]

    const layoutOptions = [
        {
            id: 'comfortable',
            label: 'Comfortable',
            description: 'More spacing, easier to read',
            spacing: 'Standard padding and margins'
        },
        {
            id: 'compact',
            label: 'Compact',
            description: 'Reduced spacing, more content',
            spacing: 'Reduced padding and margins'
        },
        {
            id: 'cozy',
            label: 'Cozy',
            description: 'Balanced spacing for productivity',
            spacing: 'Optimized for long sessions'
        }
    ]

    const fontSizes = [
        { value: 'small', label: 'Small', size: '14px' },
        { value: 'medium', label: 'Medium', size: '16px' },
        { value: 'large', label: 'Large', size: '18px' },
        { value: 'extra-large', label: 'Extra Large', size: '20px' }
    ]

    const sidebarPositions = [
        { value: 'left', label: 'Left Side' },
        { value: 'right', label: 'Right Side' },
        { value: 'top', label: 'Top Navigation' }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Theme Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Palette className="w-6 h-6 mr-3 text-purple-500" />
                    Theme Preference
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themeOptions.map((theme) => {
                        const Icon = theme.icon
                        const isSelected = settings.theme === theme.id

                        return (
                            <button
                                key={theme.id}
                                onClick={() => onChange('theme', 'theme', theme.id)}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                        ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} />
                                    <div className={`w-8 h-8 rounded border-2 ${theme.preview}`}></div>
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                    {theme.label}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {theme.description}
                                </p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Color Customization */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Paintbrush className="w-6 h-6 mr-3 text-blue-500" />
                    Accent Color
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Choose your accent color
                        </label>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                            {accentColors.map((colorOption) => (
                                <button
                                    key={colorOption.color}
                                    onClick={() => {
                                        setCustomColor(colorOption.color)
                                        onChange('theme', 'accentColor', colorOption.color)
                                    }}
                                    className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${customColor === colorOption.color
                                            ? 'border-gray-900 dark:border-white scale-110'
                                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: colorOption.color }}
                                    title={colorOption.name}
                                >
                                    {customColor === colorOption.color && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Custom Color
                        </label>
                        <div className="flex items-center space-x-3">
                            <input
                                type="color"
                                value={customColor}
                                onChange={(e) => {
                                    setCustomColor(e.target.value)
                                    onChange('theme', 'accentColor', e.target.value)
                                }}
                                className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                value={customColor}
                                onChange={(e) => {
                                    setCustomColor(e.target.value)
                                    onChange('theme', 'accentColor', e.target.value)
                                }}
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="#3B82F6"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Layout className="w-6 h-6 mr-3 text-green-500" />
                    Layout & Density
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Content Density
                        </label>
                        <div className="space-y-3">
                            {layoutOptions.map((layout) => (
                                <label key={layout.id} className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="layoutDensity"
                                        value={layout.id}
                                        checked={settings.layoutDensity === layout.id || (layout.id === 'comfortable' && !settings.layoutDensity)}
                                        onChange={(e) => onChange('theme', 'layoutDensity', e.target.value)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                                    />
                                    <div className="ml-3">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {layout.label}
                                        </span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {layout.description}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {layout.spacing}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white">
                                    Compact Mode
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Reduce spacing throughout the interface
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.compactMode}
                                    onChange={(e) => onChange('theme', 'compactMode', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sidebar Position
                        </label>
                        <select
                            value={settings.sidebarPosition || 'left'}
                            onChange={(e) => onChange('theme', 'sidebarPosition', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {sidebarPositions.map(position => (
                                <option key={position.value} value={position.value}>
                                    {position.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Typography */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Type className="w-6 h-6 mr-3 text-orange-500" />
                    Typography
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Font Size
                        </label>
                        <select
                            value={settings.fontSize || 'medium'}
                            onChange={(e) => onChange('theme', 'fontSize', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {fontSizes.map(size => (
                                <option key={size.value} value={size.value}>
                                    {size.label} ({size.size})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                High Contrast
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Increase contrast for better readability
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.highContrast || false}
                                onChange={(e) => onChange('theme', 'highContrast', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Visual Effects */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-pink-500" />
                    Visual Effects
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Animations
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enable smooth transitions and animations
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.animations}
                                onChange={(e) => onChange('theme', 'animations', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Blur Effects
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Add backdrop blur to modals and overlays
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.blurEffects !== false}
                                onChange={(e) => onChange('theme', 'blurEffects', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Gradient Backgrounds
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Use gradient backgrounds in components
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.gradientBackgrounds !== false}
                                onChange={(e) => onChange('theme', 'gradientBackgrounds', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Reduced Motion
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Respect system preference for reduced motion
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.reducedMotion || false}
                                onChange={(e) => onChange('theme', 'reducedMotion', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Theme Preview */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Eye className="w-6 h-6 mr-3 text-blue-500" />
                    Theme Preview
                </h3>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Sample Dashboard Component
                        </h4>
                        <button
                            className="px-3 py-1 rounded text-sm text-white transition-colors"
                            style={{ backgroundColor: customColor }}
                        >
                            Action Button
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Metric 1</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">1,234</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Metric 2</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">5,678</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Metric 3</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">9,012</div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        This preview shows how your chosen theme and accent color will appear in the dashboard.
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

