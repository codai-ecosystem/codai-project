import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
    HomeIcon,
    CpuChipIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    UserIcon,
    BellIcon,
    SunIcon,
    MoonIcon,
} from '@heroicons/react/24/outline';
import { Monitor, Brain, Wrench } from 'lucide-react';
import EcosystemMonitor from '../components/EcosystemMonitor';
import RomanianAITools from '../components/RomanianAITools';
import AITestChat from '../components/AITestChat';

type TabType = 'overview' | 'ecosystem' | 'tools' | 'settings';

const Enhanced: NextPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark');
        }
    };

    const tabs = [
        {
            id: 'overview' as TabType,
            name: 'Overview',
            nameRo: 'Prezentare Generală',
            icon: HomeIcon,
            description: 'Dashboard overview and key metrics',
        },
        {
            id: 'ecosystem' as TabType,
            name: 'Ecosystem Monitor',
            nameRo: 'Monitor Ecosistem',
            icon: Monitor,
            description: 'Real-time monitoring of CODAI services',
        },
        {
            id: 'tools' as TabType,
            name: 'AI Tools',
            nameRo: 'Instrumente AI',
            icon: Brain,
            description: 'Romanian AI tools and capabilities',
        },
        {
            id: 'settings' as TabType,
            name: 'Settings',
            nameRo: 'Setări',
            icon: Cog6ToothIcon,
            description: 'Configuration and preferences',
        },
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-xl p-8 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">
                            Bine ai venit la ROMAI Enhanced
                        </h2>
                        <p className="text-xl text-blue-100 mb-4">
                            Sistemul Central de Inteligență Artificială Românesc
                        </p>
                        <p className="text-blue-100 max-w-2xl">
                            Access advanced Romanian AI capabilities, monitor the entire CODAI ecosystem,
                            and manage your AI-powered workflow from this central dashboard.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <CpuChipIcon className="h-24 w-24 text-white opacity-20" />
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Active Services
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">6</p>
                            <p className="text-sm text-green-600">All operational</p>
                        </div>
                        <Monitor className="h-8 w-8 text-green-500" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                AI Tools Available
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">26+</p>
                            <p className="text-sm text-blue-600">MCP Commands</p>
                        </div>
                        <Brain className="h-8 w-8 text-blue-500" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Requests
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">12.8K</p>
                            <p className="text-sm text-purple-600">+5.2% today</p>
                        </div>
                        <ChartBarIcon className="h-8 w-8 text-purple-500" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Success Rate
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">98.5%</p>
                            <p className="text-sm text-orange-600">High performance</p>
                        </div>
                        <Wrench className="h-8 w-8 text-orange-500" />
                    </div>
                </motion.div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Monitor className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Ecosystem Monitoring
                        </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Real-time monitoring of all CODAI ecosystem services including STOCAI, AIDE,
                        PREZENTAI, MEMORAI, BANCAI, and core CODAI platform.
                    </p>
                    <button
                        onClick={() => setActiveTab('ecosystem')}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Open Ecosystem Monitor
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Brain className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Romanian AI Tools
                        </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Comprehensive suite of AI tools designed specifically for Romanian users,
                        culture, and business context with 26+ MCP commands available.
                    </p>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Explore AI Tools
                    </button>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Activity
                    </h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {[
                            { action: 'ROMAI Intelligence query processed', time: '2 minutes ago', status: 'success' },
                            { action: 'Ecosystem health check completed', time: '5 minutes ago', status: 'success' },
                            { action: 'Romanian Expert consultation', time: '15 minutes ago', status: 'success' },
                            { action: 'Problem Solver analysis completed', time: '30 minutes ago', status: 'success' },
                            { action: 'Market Intelligence report generated', time: '1 hour ago', status: 'success' },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                    <span className="text-gray-900 dark:text-white">{activity.action}</span>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* AI Test Chat */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Test ROMAI Intelligence
                </h3>
                <AITestChat />
            </motion.div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                    Settings panel will be available in the next update. Configure ROMAI preferences,
                    API keys, and ecosystem integration settings.
                </p>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'ecosystem':
                return <EcosystemMonitor />;
            case 'tools':
                return <RomanianAITools />;
            case 'settings':
                return renderSettings();
            default:
                return renderOverview();
        }
    };

    return (
        <>
            <Head>
                <title>ROMAI Enhanced Dashboard - Central Intelligence</title>
                <meta name="description" content="Enhanced Romanian AI Central Intelligence System Dashboard" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
                <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                    {/* Header */}
                    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <CpuChipIcon className="h-8 w-8 text-orange-500" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ROMAI Enhanced
                                        </h1>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Central Intelligence Dashboard
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={toggleDarkMode}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {darkMode ? (
                                            <SunIcon className="h-5 w-5 text-yellow-500" />
                                        ) : (
                                            <MoonIcon className="h-5 w-5 text-gray-600" />
                                        )}
                                    </button>
                                    <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Navigation Tabs */}
                    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex space-x-8">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                                            }`}
                                    >
                                        <tab.icon className="h-5 w-5" />
                                        <span className="hidden md:block">{tab.nameRo}</span>
                                        <span className="md:hidden">{tab.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Enhanced;
