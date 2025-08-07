import React from 'react'
/**
 * General Settings Component - Profile and Basic Preferences
 */
'use client'

import { motion } from 'framer-motion'
import { User, Mail, Globe, Calendar, Clock, MapPin, Language } from 'lucide-react'

interface GeneralSettingsProps {
    settings: any
    onChange: (section: string, key: string, value: any) => void
}

export function GeneralSettings({ settings, onChange }: GeneralSettingsProps) {
    const timezones = [
        'UTC',
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Australia/Sydney'
    ]

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'ro', name: 'Romanian' },
        { code: 'ja', name: 'Japanese' }
    ]

    const dateFormats = [
        'YYYY-MM-DD',
        'MM/DD/YYYY',
        'DD/MM/YYYY',
        'DD.MM.YYYY'
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-500" />
                    Profile Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={settings.username}
                            onChange={(e) => onChange('general', 'username', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => onChange('general', 'email', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            placeholder="Enter your email"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Used for notifications and account recovery
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={settings.displayName || ''}
                        onChange={(e) => onChange('general', 'displayName', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        placeholder="How you'd like to be addressed"
                    />
                </div>
            </div>

            {/* Localization Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Globe className="w-6 h-6 mr-3 text-green-500" />
                    Localization
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Language
                        </label>
                        <select
                            value={settings.language}
                            onChange={(e) => onChange('general', 'language', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Timezone
                        </label>
                        <select
                            value={settings.timezone}
                            onChange={(e) => onChange('general', 'timezone', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            {timezones.map(tz => (
                                <option key={tz} value={tz}>
                                    {tz} ({new Date().toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' }).split(', ')[1]})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date Format
                        </label>
                        <select
                            value={settings.dateFormat}
                            onChange={(e) => onChange('general', 'dateFormat', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            {dateFormats.map(format => (
                                <option key={format} value={format}>
                                    {format} (e.g., {new Date().toLocaleDateString('en-US').replace(/(\d+)\/(\d+)\/(\d+)/,
                                        format.replace('YYYY', '$3').replace('MM', '$1').replace('DD', '$2'))})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Time Format
                        </label>
                        <select
                            value={settings.timeFormat || '24h'}
                            onChange={(e) => onChange('general', 'timeFormat', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            <option value="12h">12-hour (3:30 PM)</option>
                            <option value="24h">24-hour (15:30)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Dashboard Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-purple-500" />
                    Dashboard Preferences
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Default Dashboard View
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Choose your preferred landing page
                            </p>
                        </div>
                        <select
                            value={settings.defaultView || 'overview'}
                            onChange={(e) => onChange('general', 'defaultView', e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="overview">Overview</option>
                            <option value="analytics">Analytics</option>
                            <option value="projects">Projects</option>
                            <option value="tasks">Tasks</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Items per Page
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Number of items displayed in lists
                            </p>
                        </div>
                        <select
                            value={settings.itemsPerPage || 25}
                            onChange={(e) => onChange('general', 'itemsPerPage', parseInt(e.target.value))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Auto-refresh Interval
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Automatic data refresh frequency
                            </p>
                        </div>
                        <select
                            value={settings.autoRefresh || 30}
                            onChange={(e) => onChange('general', 'autoRefresh', parseInt(e.target.value))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value={0}>Disabled</option>
                            <option value={15}>15 seconds</option>
                            <option value={30}>30 seconds</option>
                            <option value={60}>1 minute</option>
                            <option value={300}>5 minutes</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Show Welcome Tour
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Display onboarding tour for new features
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.showWelcomeTour !== false}
                                onChange={(e) => onChange('general', 'showWelcomeTour', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Regional Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <MapPin className="w-6 h-6 mr-3 text-orange-500" />
                    Regional Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Currency
                        </label>
                        <select
                            value={settings.currency || 'USD'}
                            onChange={(e) => onChange('general', 'currency', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            <option value="USD">USD - US Dollar ($)</option>
                            <option value="EUR">EUR - Euro (€)</option>
                            <option value="GBP">GBP - British Pound (£)</option>
                            <option value="RON">RON - Romanian Leu (lei)</option>
                            <option value="JPY">JPY - Japanese Yen (¥)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Number Format
                        </label>
                        <select
                            value={settings.numberFormat || 'us'}
                            onChange={(e) => onChange('general', 'numberFormat', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            <option value="us">US Format (1,234.56)</option>
                            <option value="eu">European Format (1.234,56)</option>
                            <option value="in">Indian Format (1,23,456.78)</option>
                        </select>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

