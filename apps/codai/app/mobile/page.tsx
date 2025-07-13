export default function MobilePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Mobile Optimization Center
                    </h1>
                    <p className="text-slate-400 mt-2">Advanced mobile experience optimization and performance monitoring</p>
                </div>

                {/* Mobile Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-emerald-400">Performance Score</h3>
                                <p className="text-3xl font-bold text-emerald-400">94</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Lighthouse mobile score</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400">Load Time</h3>
                                <p className="text-3xl font-bold text-blue-400">1.2s</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">First contentful paint</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-orange-400">Bounce Rate</h3>
                                <p className="text-3xl font-bold text-orange-400">18%</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Mobile user retention</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-purple-400">Active Users</h3>
                                <p className="text-3xl font-bold text-purple-400">12.5K</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-purple-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Monthly mobile users</p>
                    </div>
                </div>

                {/* Device Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <h2 className="text-2xl font-bold mb-6">Device Distribution</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <div className="w-5 h-7 bg-blue-400 rounded-sm"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Mobile Phones</h3>
                                        <p className="text-sm text-slate-400">iOS & Android devices</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-400">68%</p>
                                    <p className="text-sm text-slate-400">8,500 users</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <div className="w-6 h-5 bg-purple-400 rounded-sm"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Tablets</h3>
                                        <p className="text-sm text-slate-400">iPad & Android tablets</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-purple-400">22%</p>
                                    <p className="text-sm text-slate-400">2,750 users</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                        <div className="w-7 h-4 bg-orange-400 rounded-sm"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Desktop</h3>
                                        <p className="text-sm text-slate-400">Windows & macOS</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-orange-400">10%</p>
                                    <p className="text-sm text-slate-400">1,250 users</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <h2 className="text-2xl font-bold mb-6">Performance Metrics</h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-400">First Contentful Paint</span>
                                    <span className="text-emerald-400">1.2s</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-400">Largest Contentful Paint</span>
                                    <span className="text-blue-400">2.1s</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-400">Cumulative Layout Shift</span>
                                    <span className="text-purple-400">0.08</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '90%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-400">Time to Interactive</span>
                                    <span className="text-orange-400">2.8s</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optimization Recommendations */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6">Optimization Recommendations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3">
                                    <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                                </div>
                                <h3 className="font-semibold text-emerald-400">Image Optimization</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">Implement next-gen image formats (WebP, AVIF)</p>
                            <div className="text-xs text-emerald-400">Potential savings: 40% load time reduction</div>
                        </div>

                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                                    <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                                </div>
                                <h3 className="font-semibold text-blue-400">Code Splitting</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">Implement route-based code splitting</p>
                            <div className="text-xs text-blue-400">Potential savings: 60% initial bundle size</div>
                        </div>

                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                                    <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                                </div>
                                <h3 className="font-semibold text-purple-400">Service Worker</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">Add offline support and caching</p>
                            <div className="text-xs text-purple-400">Potential improvement: 50% return visits</div>
                        </div>

                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mr-3">
                                    <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                                </div>
                                <h3 className="font-semibold text-orange-400">Touch Optimization</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">Increase touch target sizes to 44px minimum</p>
                            <div className="text-xs text-orange-400">Better UX: 25% fewer touch errors</div>
                        </div>

                        <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center mr-3">
                                    <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                                </div>
                                <h3 className="font-semibold text-pink-400">Viewport Optimization</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">Optimize responsive breakpoints</p>
                            <div className="text-xs text-pink-400">Better fit: 30% improved usability</div>
                        </div>

                        <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3">
                                    <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
                                </div>
                                <h3 className="font-semibold text-cyan-400">Battery Optimization</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">Reduce CPU-intensive animations</p>
                            <div className="text-xs text-cyan-400">Battery savings: 20% longer usage</div>
                        </div>
                    </div>
                </div>

                {/* Testing Framework */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6">Mobile Testing Framework</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Device Testing Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-400">iOS</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">iPhone 14 Pro</h4>
                                            <p className="text-sm text-slate-400">iOS 16.0 • 393×852</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">PASSED</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-500/20 rounded flex items-center justify-center">
                                            <span className="text-xs font-bold text-emerald-400">AND</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Samsung Galaxy S23</h4>
                                            <p className="text-sm text-slate-400">Android 13 • 360×780</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">PASSED</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                                            <span className="text-xs font-bold text-purple-400">TAB</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">iPad Air</h4>
                                            <p className="text-sm text-slate-400">iPadOS 16 • 820×1180</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">PENDING</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Automated Test Results</h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-emerald-400">Touch Interactions</h4>
                                        <span className="text-emerald-400">98%</span>
                                    </div>
                                    <p className="text-sm text-slate-400">All touch targets accessible and responsive</p>
                                </div>

                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-blue-400">Responsive Design</h4>
                                        <span className="text-blue-400">95%</span>
                                    </div>
                                    <p className="text-sm text-slate-400">Layout adapts properly across screen sizes</p>
                                </div>

                                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-orange-400">Performance Tests</h4>
                                        <span className="text-orange-400">87%</span>
                                    </div>
                                    <p className="text-sm text-slate-400">Some components need optimization</p>
                                </div>

                                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-purple-400">Accessibility</h4>
                                        <span className="text-purple-400">92%</span>
                                    </div>
                                    <p className="text-sm text-slate-400">WCAG 2.1 AA compliance on mobile</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all font-semibold">
                        Run Mobile Audit
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-semibold">
                        Device Testing
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold">
                        Performance Report
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold">
                        Optimization Guide
                    </button>
                </div>
            </div>
        </div>
    )
}
