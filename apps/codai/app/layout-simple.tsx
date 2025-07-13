import './globals.css'

export const metadata = {
    title: 'CODAI - Advanced AI Development Platform',
    description: 'Enterprise-grade AI development platform with advanced features',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-slate-900 text-white min-h-screen">
                <div className="flex">
                    {/* Enhanced Navigation Sidebar */}
                    <nav className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 h-screen fixed left-0 top-0 overflow-y-auto">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                CODAI
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">AI Development Platform</p>
                        </div>

                        <div className="px-4 space-y-2">
                            {/* Core Navigation */}
                            <div className="mb-6">
                                <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3 px-2">Core Platform</h3>
                                <a href="/" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-blue-500 rounded mr-3"></div>
                                    Dashboard
                                </a>
                                <a href="/projects" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-emerald-500 rounded mr-3"></div>
                                    Projects
                                </a>
                                <a href="/apps" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-purple-500 rounded mr-3"></div>
                                    Applications
                                </a>
                            </div>

                            {/* Advanced Features */}
                            <div className="mb-6">
                                <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3 px-2">Advanced Features</h3>
                                <a href="/security" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-red-500 rounded mr-3"></div>
                                    Security Center
                                </a>
                                <a href="/chat" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-cyan-500 rounded mr-3"></div>
                                    AI Assistant
                                </a>
                                <a href="/analysis" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-orange-500 rounded mr-3"></div>
                                    Code Analysis
                                </a>
                                <a href="/mobile" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-pink-500 rounded mr-3"></div>
                                    Mobile Center
                                </a>
                                <a href="/orchestration" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-violet-500 rounded mr-3"></div>
                                    Orchestration
                                </a>
                                <a href="/analytics" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-indigo-500 rounded mr-3"></div>
                                    Analytics
                                </a>
                                <a href="/ecosystem" className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="w-5 h-5 bg-teal-500 rounded mr-3"></div>
                                    Ecosystem
                                </a>
                            </div>

                            {/* System Status */}
                            <div className="mt-8 px-2">
                                <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3">System Status</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Security</span>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                                            <span className="text-xs text-emerald-400">Active</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">AI Systems</span>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                                            <span className="text-xs text-blue-400">Online</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Analytics</span>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                                            <span className="text-xs text-purple-400">Running</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Main Content Area */}
                    <main className="flex-1 ml-64">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}
