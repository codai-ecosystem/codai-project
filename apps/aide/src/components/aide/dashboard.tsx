'use client'

import { useState, useEffect } from 'react'

export function AideDashboard() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading AIDE...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🤖 AIDE - AI Development Environment
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Advanced AI-powered development assistant for the CODAI ecosystem
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-blue-600 text-xl font-bold">🧠</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                                <p className="text-sm text-gray-500">Intelligent code generation</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Get AI-powered assistance for coding, debugging, and optimization
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-green-600 text-xl font-bold">⚡</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Fast Development</h3>
                                <p className="text-sm text-gray-500">Accelerated workflows</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Streamline your development process with automated tools
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-purple-600 text-xl font-bold">🔧</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Smart Tools</h3>
                                <p className="text-sm text-gray-500">Integrated utilities</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Access powerful development tools in one unified interface
                        </p>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <div className="inline-flex items-center px-6 py-3 bg-white rounded-lg shadow-md border border-gray-200">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-gray-700 font-medium">✅ AIDE Modernized - Next.js 15.4.1 + TailwindCSS 3</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
