export default function ChatPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        AI Assistant
                    </h1>
                    <p className="text-slate-400 mt-2">Advanced AI-powered development assistant</p>
                </div>

                {/* Chat Interface */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 h-96 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/20">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-white">AI</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">CODAI Assistant</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-emerald-400">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-white">AI</span>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3 max-w-xs">
                                <p className="text-sm">Hello! I&apos;m your AI development assistant. I can help you with code analysis, project planning, debugging, and much more. What would you like to work on today?</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 justify-end">
                            <div className="bg-blue-500 rounded-lg p-3 max-w-xs">
                                <p className="text-sm">Can you help me optimize my React components?</p>
                            </div>
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold">U</span>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-white">AI</span>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3 max-w-md">
                                <p className="text-sm">Absolutely! I can analyze your React components and suggest optimizations. Here are some common areas I can help with:</p>
                                <ul className="text-sm mt-2 space-y-1">
                                    <li>• Performance improvements (useMemo, useCallback)</li>
                                    <li>• Component structure and reusability</li>
                                    <li>• State management optimization</li>
                                    <li>• Bundle size reduction</li>
                                </ul>
                                <p className="text-sm mt-2">Would you like to share some code for me to analyze?</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-white/20">
                        <div className="flex space-x-3">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                            />
                            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-semibold">
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                        <h3 className="font-semibold text-emerald-400 mb-2">Code Review</h3>
                        <p className="text-sm text-slate-400 mb-3">Get instant code analysis and suggestions</p>
                        <button className="text-sm text-emerald-400 hover:text-emerald-300">Start Review →</button>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                        <h3 className="font-semibold text-blue-400 mb-2">Debug Helper</h3>
                        <p className="text-sm text-slate-400 mb-3">AI-powered debugging assistance</p>
                        <button className="text-sm text-blue-400 hover:text-blue-300">Start Debug →</button>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                        <h3 className="font-semibold text-purple-400 mb-2">Architecture Help</h3>
                        <p className="text-sm text-slate-400 mb-3">System design and architecture guidance</p>
                        <button className="text-sm text-purple-400 hover:text-purple-300">Get Help →</button>
                    </div>
                </div>

                {/* AI Capabilities */}
                <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                    <h2 className="text-xl font-bold mb-4">AI Capabilities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-sm">Code Analysis & Optimization</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm">Automated Testing Suggestions</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                <span className="text-sm">Architecture Recommendations</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                <span className="text-sm">Performance Optimization</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                <span className="text-sm">Security Vulnerability Detection</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                <span className="text-sm">Code Documentation Generation</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                <span className="text-sm">Deployment Strategy Planning</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                                <span className="text-sm">Cross-platform Integration</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
