import React from 'react'
/**
 * Simple Health Check Page
 * Basic page for testing frontend functionality without complex dependencies
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Health Check',
    description: 'Simple health check page',
};

export default function HealthPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        🏥 Admin Service Health Check
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-green-800 mb-3">
                                ✅ Service Status
                            </h2>
                            <ul className="space-y-2 text-green-700">
                                <li>• Next.js Application: Running</li>
                                <li>• TypeScript Compilation: Success</li>
                                <li>• Tailwind CSS: Loaded</li>
                                <li>• React Components: Functional</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-blue-800 mb-3">
                                ℹ️ Application Info
                            </h2>
                            <ul className="space-y-2 text-blue-700">
                                <li>• Port: 4007</li>
                                <li>• Environment: Development</li>
                                <li>• Framework: Next.js 15.3.5</li>
                                <li>• React Version: 19.1.0</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            🔧 UI/UX Testing Elements
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                Primary Button
                            </button>
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
                                Secondary Button
                            </button>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                Success Button
                            </button>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Input Field
                            </label>
                            <input
                                type="text"
                                placeholder="Enter test data..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mt-6 flex items-center space-x-4">
                            <div className="flex items-center">
                                <input type="checkbox" id="test-checkbox" className="mr-2" />
                                <label htmlFor="test-checkbox" className="text-sm text-gray-700">
                                    Test Checkbox
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input type="radio" id="test-radio" name="test" className="mr-2" />
                                <label htmlFor="test-radio" className="text-sm text-gray-700">
                                    Test Radio
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Last Updated: {new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

