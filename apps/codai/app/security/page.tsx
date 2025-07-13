export default function SecurityCenterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        Security Center
                    </h1>
                    <p className="text-slate-400 mt-2">Advanced threat detection and security monitoring</p>
                </div>

                {/* Security Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-emerald-400">Security Score</h3>
                                <p className="text-3xl font-bold text-emerald-400">95/100</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Excellent security posture</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-400">Threats Blocked</h3>
                                <p className="text-3xl font-bold text-blue-400">127</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Last 24 hours</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-orange-400">Active Scans</h3>
                                <p className="text-3xl font-bold text-orange-400">8</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Real-time monitoring</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-purple-400">Vulnerabilities</h3>
                                <p className="text-3xl font-bold text-purple-400">2</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 bg-purple-400 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Low priority issues</p>
                    </div>
                </div>

                {/* Recent Threats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <h2 className="text-2xl font-bold mb-6">Recent Threats</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-red-400">SQL Injection Attempt</h3>
                                    <p className="text-sm text-slate-400">192.168.1.100 • 2 minutes ago</p>
                                </div>
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">BLOCKED</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-orange-400">Brute Force Attack</h3>
                                    <p className="text-sm text-slate-400">10.0.0.5 • 15 minutes ago</p>
                                </div>
                                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">MITIGATED</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-yellow-400">Suspicious Activity</h3>
                                    <p className="text-sm text-slate-400">172.16.0.1 • 1 hour ago</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">MONITORING</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                        <h2 className="text-2xl font-bold mb-6">Security Features</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-emerald-400">Real-time Threat Detection</h3>
                                    <p className="text-sm text-slate-400">AI-powered anomaly detection</p>
                                </div>
                                <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-emerald-400">Automated Response</h3>
                                    <p className="text-sm text-slate-400">Instant threat mitigation</p>
                                </div>
                                <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-emerald-400">Vulnerability Scanning</h3>
                                    <p className="text-sm text-slate-400">Continuous security assessment</p>
                                </div>
                                <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-emerald-400">Encryption Management</h3>
                                    <p className="text-sm text-slate-400">Advanced data protection</p>
                                </div>
                                <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Analytics */}
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                    <h2 className="text-2xl font-bold mb-6">Security Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">Threat Types</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">SQL Injection</span>
                                    <span className="text-blue-400">45%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">XSS Attacks</span>
                                    <span className="text-purple-400">30%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Brute Force</span>
                                    <span className="text-orange-400">25%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Response Times</h3>
                            <div className="text-3xl font-bold text-emerald-400 mb-2">1.2s</div>
                            <p className="text-sm text-slate-400">Average detection time</p>
                            <div className="mt-4">
                                <div className="text-2xl font-bold text-blue-400 mb-2">0.8s</div>
                                <p className="text-sm text-slate-400">Average response time</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-purple-400 mb-2">System Health</h3>
                            <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
                            <p className="text-sm text-slate-400">Uptime this month</p>
                            <div className="mt-4">
                                <div className="text-2xl font-bold text-orange-400 mb-2">0.01%</div>
                                <p className="text-sm text-slate-400">False positive rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Actions */}
                <div className="mt-8 flex flex-wrap gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold">
                        Run Security Scan
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold">
                        View Detailed Report
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-semibold">
                        Configure Alerts
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold">
                        Security Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
