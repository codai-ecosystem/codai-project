export default function AppsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                        Applications
                    </h1>
                    <p className="text-slate-400 mt-2">Ecosystem applications and services</p>
                </div>

                {/* Applications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-lg font-bold">AI</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">AIDE AI</h3>
                                <p className="text-sm text-slate-400">AI Development Assistant</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">Intelligent code generation and development assistance</p>
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">Active</span>
                            <button className="text-blue-400 hover:text-blue-300 text-sm">Launch →</button>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-lg font-bold">AN</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">AnalizAI</h3>
                                <p className="text-sm text-slate-400">Code Analysis Platform</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">Advanced code analysis and optimization recommendations</p>
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">Active</span>
                            <button className="text-purple-400 hover:text-purple-300 text-sm">Launch →</button>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-lg font-bold">BC</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">BancAI</h3>
                                <p className="text-sm text-slate-400">Financial Management</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">AI-powered financial analysis and management system</p>
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Connected</span>
                            <button className="text-orange-400 hover:text-orange-300 text-sm">Launch →</button>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-lg font-bold">FB</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">FabricAI</h3>
                                <p className="text-sm text-slate-400">Design & Prototyping</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">AI-powered design system and rapid prototyping tool</p>
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">Active</span>
                            <button className="text-emerald-400 hover:text-emerald-300 text-sm">Launch →</button>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-lg font-bold">CM</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">CumparAI</h3>
                                <p className="text-sm text-slate-400">Comparison Analytics</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">Advanced comparison and competitive analysis platform</p>
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Connected</span>
                            <button className="text-cyan-400 hover:text-cyan-300 text-sm">Launch →</button>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-lg font-bold">DS</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Dashboard</h3>
                                <p className="text-sm text-slate-400">Analytics Hub</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">Centralized analytics and monitoring dashboard</p>
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">Running</span>
                            <button className="text-indigo-400 hover:text-indigo-300 text-sm">Launch →</button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors text-left">
                            <h3 className="font-semibold text-blue-400 mb-2">Deploy New App</h3>
                            <p className="text-sm text-slate-400">Launch a new application in the ecosystem</p>
                        </button>
                        <button className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors text-left">
                            <h3 className="font-semibold text-purple-400 mb-2">Manage Services</h3>
                            <p className="text-sm text-slate-400">Configure and monitor running services</p>
                        </button>
                        <button className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors text-left">
                            <h3 className="font-semibold text-emerald-400 mb-2">System Health</h3>
                            <p className="text-sm text-slate-400">Check overall system status and performance</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
