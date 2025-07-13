export default function CodeAnalysisPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                        Code Analysis Engine
                    </h1>
                    <p className="text-slate-400 mt-2">AI-powered code analysis, optimization, and quality assessment</p>
                </div>

                {/* Analysis Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-emerald-400">Code Quality</h3>
                                <p className="text-3xl font-bold text-emerald-400">A</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Excellent quality score</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400">Test Coverage</h3>
                                <p className="text-3xl font-bold text-blue-400">87%</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Above recommended 80%</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-orange-400">Complexity</h3>
                                <p className="text-3xl font-bold text-orange-400">6.2</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Cyclomatic complexity</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-purple-400">Issues Found</h3>
                                <p className="text-3xl font-bold text-purple-400">12</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-purple-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">3 high, 9 medium priority</p>
                    </div>
                </div>

                {/* Analysis Results */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <h2 className="text-2xl font-bold mb-6">Recent Analysis</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-red-400">Critical Issue</h3>
                                    <p className="text-sm text-slate-400">Potential SQL injection vulnerability</p>
                                    <p className="text-xs text-slate-500 mt-1">src/api/users.ts:42</p>
                                </div>
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">HIGH</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-orange-400">Performance Issue</h3>
                                    <p className="text-sm text-slate-400">Inefficient database query detected</p>
                                    <p className="text-xs text-slate-500 mt-1">src/services/data.ts:128</p>
                                </div>
                                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">MEDIUM</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-yellow-400">Code Smell</h3>
                                    <p className="text-sm text-slate-400">Function complexity too high</p>
                                    <p className="text-xs text-slate-500 mt-1">src/utils/helper.ts:67</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">MEDIUM</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-blue-400">Improvement Suggestion</h3>
                                    <p className="text-sm text-slate-400">Consider using TypeScript strict mode</p>
                                    <p className="text-xs text-slate-500 mt-1">tsconfig.json</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">LOW</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <h2 className="text-2xl font-bold mb-6">Optimization Suggestions</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <h3 className="font-semibold text-emerald-400 mb-2">Performance Optimization</h3>
                                <p className="text-sm text-slate-400 mb-3">Implement lazy loading for React components</p>
                                <div className="bg-slate-800 p-3 rounded text-xs">
                                    <div className="text-red-400">// Before</div>
                                    <div className="text-slate-300">import Component from &apos;./Component&apos;</div>
                                    <div className="text-emerald-400 mt-2">// After</div>
                                    <div className="text-slate-300">const Component = lazy(() =&gt; import(&apos;./Component&apos;))</div>
                                </div>
                                <p className="text-xs text-emerald-400 mt-2">Estimated improvement: 25% faster load time</p>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <h3 className="font-semibold text-blue-400 mb-2">Code Quality</h3>
                                <p className="text-sm text-slate-400 mb-3">Extract reusable hook for data fetching</p>
                                <div className="bg-slate-800 p-3 rounded text-xs">
                                    <div className="text-emerald-400">// Suggested</div>
                                    <div className="text-slate-300">const useDataFetcher = (url) =&gt; &#123;</div>
                                    <div className="text-slate-300">  // Hook implementation</div>
                                    <div className="text-slate-300">&#125;</div>
                                </div>
                                <p className="text-xs text-blue-400 mt-2">Reduces code duplication by 40%</p>
                            </div>

                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <h3 className="font-semibold text-purple-400 mb-2">Security Enhancement</h3>
                                <p className="text-sm text-slate-400 mb-3">Add input validation middleware</p>
                                <div className="bg-slate-800 p-3 rounded text-xs">
                                    <div className="text-emerald-400">// Recommended</div>
                                    <div className="text-slate-300">app.use(validateInput())</div>
                                </div>
                                <p className="text-xs text-purple-400 mt-2">Prevents 95% of injection attacks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Code Metrics */}
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                    <h2 className="text-2xl font-bold mb-6">Code Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-blue-400 mb-4">Lines of Code</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">TypeScript</span>
                                    <span className="text-blue-400">15,234</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-400">JavaScript</span>
                                    <span className="text-purple-400">8,765</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '35%' }}></div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-400">CSS/SCSS</span>
                                    <span className="text-orange-400">2,341</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Quality Trends</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-2xl font-bold text-emerald-400 mb-1">↗ +5.2%</div>
                                    <p className="text-sm text-slate-400">Quality improvement</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-400 mb-1">↗ +12%</div>
                                    <p className="text-sm text-slate-400">Test coverage increase</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-400 mb-1">↘ -8%</div>
                                    <p className="text-sm text-slate-400">Complexity reduction</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-purple-400 mb-4">Technical Debt</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-2xl font-bold text-purple-400 mb-1">2.4h</div>
                                    <p className="text-sm text-slate-400">Estimated fix time</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-400 mb-1">15</div>
                                    <p className="text-sm text-slate-400">TODO comments</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-400 mb-1">3</div>
                                    <p className="text-sm text-slate-400">FIXME comments</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* File Analysis */}
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                    <h2 className="text-2xl font-bold mb-6">File Analysis</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-400">TS</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold">src/components/Dashboard.tsx</h3>
                                    <p className="text-sm text-slate-400">234 lines • Grade: A</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">CLEAN</span>
                                <span className="text-slate-400">92%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-orange-500/20 rounded flex items-center justify-center">
                                    <span className="text-xs font-bold text-orange-400">JS</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold">src/utils/helpers.js</h3>
                                    <p className="text-sm text-slate-400">156 lines • Grade: C</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">COMPLEX</span>
                                <span className="text-slate-400">67%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                                    <span className="text-xs font-bold text-purple-400">TS</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold">src/api/endpoints.ts</h3>
                                    <p className="text-sm text-slate-400">89 lines • Grade: B</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">GOOD</span>
                                <span className="text-slate-400">84%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold">
                        Run Full Analysis
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold">
                        Export Report
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-semibold">
                        Configure Rules
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold">
                        Schedule Scans
                    </button>
                </div>
            </div>
        </div>
    )
}
