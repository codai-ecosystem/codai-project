'use client';

import React, { useState } from 'react';
import { InfrastructureOverview } from './components/InfrastructureOverview';
import { ResourcesTab } from './components/ResourcesTab';
import { ProvisioningTab } from './components/ProvisioningTab';
import { NetworkingTab } from './components/NetworkingTab';
import { SecurityTab } from './components/SecurityTab';
import { CostOptimizationTab } from './components/CostOptimizationTab';
import {
    Server,
    Network,
    Shield,
    DollarSign,
    Settings,
    BarChart3,
    Plus,
    Download,
    RefreshCw,
    Play,
    Pause
} from 'lucide-react';

export default function InfrastructurePage() {
    const [selectedTab, setSelectedTab] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 ml-80">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Infrastructure</h1>
                            <p className="text-gray-600 mt-2">Manage infrastructure resources, provisioning, and optimization</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-600">
                                    {autoRefresh ? 'Auto-refresh' : 'Paused'}
                                </span>
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4" />
                                <span>Provision</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'resources', label: 'Resources', icon: Server },
                        { id: 'provisioning', label: 'Provisioning', icon: Settings },
                        { id: 'networking', label: 'Networking', icon: Network },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'cost', label: 'Cost Optimization', icon: DollarSign }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === tab.id
                                    ? 'bg-white text-blue-600 shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {selectedTab === 'overview' && <InfrastructureOverview />}
                {selectedTab === 'resources' && <ResourcesTab />}
                {selectedTab === 'provisioning' && <ProvisioningTab />}
                {selectedTab === 'networking' && <NetworkingTab />}
                {selectedTab === 'security' && <SecurityTab />}
                {selectedTab === 'cost' && <CostOptimizationTab />}
            </div>
        </div>
    );
}
