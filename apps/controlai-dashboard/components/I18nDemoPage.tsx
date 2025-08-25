/**
 * Example usage of internationalization in ControlAI Dashboard
 * This component demonstrates how to use the i18n setup we just implemented
 */
import React from 'react';
import { useTranslation, useLanguage } from '../hooks/useI18n';
import LanguageSelector from '../components/i18n/LanguageSelector';

export default function I18nDemoPage() {
    const { t, ready } = useTranslation();
    const { currentLanguage } = useLanguage();

    if (!ready) {
        return <div className="p-4">Loading translations...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('common.welcome', 'Welcome')} to CODAI Internationalization Demo
                        </h1>
                        <LanguageSelector variant="dropdown" showLabel={false} size="sm" />
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Current language: <strong>{currentLanguage === 'en' ? 'English' : 'Română'}</strong>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Language Selector Variants */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {t('common.options', 'Options')}
                            </h3>
                            <LanguageSelector variant="dropdown" showLabel={true} />
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {t('common.actions', 'Actions')}
                            </h3>
                            <LanguageSelector variant="toggle" showLabel={false} />
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Inline Options
                            </h3>
                            <LanguageSelector variant="inline" showLabel={false} />
                        </div>
                    </div>
                </div>

                {/* Common Translations Demo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('common.actions', 'Common Actions')}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {t('common.save', 'Save')}
                        </button>
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            {t('common.delete', 'Delete')}
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            {t('common.create', 'Create')}
                        </button>
                    </div>
                </div>

                {/* Navigation Demo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('navigation.home', 'Navigation')}
                    </h2>

                    <nav className="flex flex-wrap gap-4">
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {t('navigation.home', 'Home')}
                        </a>
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {t('navigation.dashboard', 'Dashboard')}
                        </a>
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {t('navigation.apps', 'Apps')}
                        </a>
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {t('navigation.settings', 'Settings')}
                        </a>
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {t('navigation.profile', 'Profile')}
                        </a>
                    </nav>
                </div>

                {/* Authentication Demo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('auth.signIn', 'Authentication')}
                    </h2>

                    <form className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('auth.email', 'Email')}
                            </label>
                            <input
                                type="email"
                                placeholder={t('auth.email', 'Enter your email')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('auth.password', 'Password')}
                            </label>
                            <input
                                type="password"
                                placeholder={t('auth.password', 'Enter your password')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {t('auth.signIn', 'Sign In')}
                        </button>
                    </form>
                </div>

                {/* Status Messages Demo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('common.info', 'Status Messages')}
                    </h2>

                    <div className="space-y-3">
                        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {t('success.saved', 'Changes saved successfully')}
                        </div>
                        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                            {t('common.warning', 'Warning')}: {t('validation.required', 'This field is required')}
                        </div>
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {t('errors.general', 'Something went wrong. Please try again.')}
                        </div>
                        <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                            {t('common.loading', 'Loading...')}
                        </div>
                    </div>
                </div>

                {/* Brand and App Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('apps.codai.name', 'CODAI')} Ecosystem
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {t('apps.memorai.name', 'MEMORAI')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {t('apps.memorai.description', 'AI Memory & Database Core')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t('apps.memorai.tagline', 'Never Forget Anything')}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {t('apps.bancai.name', 'BANCAI')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {t('apps.bancai.description', 'AI Banking & Finance Platform')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t('apps.bancai.tagline', 'Intelligent Financial Services')}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {t('apps.stocai.name', 'STOCAI')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {t('apps.stocai.description', 'Stock Market & Investment AI')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t('apps.stocai.tagline', 'Smart Investment Decisions')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>{t('brand.tagline', 'AI-Native Operating System')}</p>
                    <p className="mt-1">{t('brand.description', 'The next generation of intelligent applications')}</p>
                </div>
            </div>
        </div>
    );
}