"use client";

import React, { useState, useEffect } from 'react';

export default function SimpleDashboard() {
    const [cbdStatus, setCbdStatus] = useState('checking...');
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        // Test CBD connection
        testCBDConnection();

        // Test dashboard API
        testDashboardAPI();
    }, []);

    const testCBDConnection = async () => {
        try {
            const response = await fetch('http://localhost:4180/health');
            if (response.ok) {
                setCbdStatus('✅ Connected');
            } else {
                setCbdStatus('❌ Connection failed');
            }
        } catch (error: any) {
            setCbdStatus('❌ Connection error: ' + error.message);
        }
    };

    const testDashboardAPI = async () => {
        try {
            const response = await fetch('/api/dashboard/stats');
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
            } else {
                const error = await response.text();
                setDashboardData({ error: `API failed: ${error}` });
            }
        } catch (error: any) {
            setDashboardData({ error: error.message });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">MemorAI Dashboard - Connection Test</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CBD Connection Status */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">CBD Service Status</h2>
                        <p className="text-lg">{cbdStatus}</p>
                        <p className="text-sm text-gray-400 mt-2">Testing connection to http://localhost:4180</p>
                    </div>

                    {/* Dashboard API Status */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Dashboard API Status</h2>
                        {dashboardData ? (
                            <div>
                                {dashboardData.error ? (
                                    <p className="text-red-400">{dashboardData.error}</p>
                                ) : (
                                    <div>
                                        <p className="text-green-400">✅ API Working</p>
                                        <pre className="text-xs mt-2 bg-gray-700 p-2 rounded">
                                            {JSON.stringify(dashboardData, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-yellow-400">Testing API...</p>
                        )}
                    </div>
                </div>

                {/* Simple Stats Display */}
                {dashboardData && dashboardData.success && (
                    <div className="mt-8 bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Dashboard Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                    {dashboardData.data?.totalMemories || 0}
                                </div>
                                <div className="text-sm text-gray-400">Total Memories</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">
                                    {dashboardData.data?.totalAgents || 0}
                                </div>
                                <div className="text-sm text-gray-400">Active Agents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">
                                    {dashboardData.data?.totalProjects || 0}
                                </div>
                                <div className="text-sm text-gray-400">Projects</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-400">
                                    {dashboardData.data?.systemHealth?.status || 'unknown'}
                                </div>
                                <div className="text-sm text-gray-400">System Status</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
