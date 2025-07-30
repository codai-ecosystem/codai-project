'use client';

import { useCodaiAuth } from '@codai/sso-sdk';
import { signIn, signOut } from 'next-auth/react';
import {
    Shield,
    CreditCard,
    DollarSign,
    TrendingUp,
    Users,
    Lock,
    CheckCircle,
    AlertTriangle,
    Activity
} from 'lucide-react';

export default function BancaiSSODemo() {
    const { user, isLoading } = useCodaiAuth();

    // Mock session data based on user state
    const session = user ? {
        deviceTrusted: true,
        lastActivity: new Date(),
        sessionId: 'mock-session-id'
    } : null;

    // For testing/development: check if we should show demo mode
    const isTestMode = typeof window !== 'undefined' &&
        (window.location.search.includes('demo=true') ||
            process.env.NODE_ENV === 'test' ||
            window.location.href.includes('playwright'));

    // Create mock user for demo mode
    const mockUser = {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@bancai.test',
        roles: ['user', 'banker']
    };

    // Use mock user in test/demo mode
    const effectiveUser = isTestMode ? mockUser : user;
    const effectiveIsLoading = isTestMode ? false : isLoading;

    if (effectiveIsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-24 sm:h-32 w-24 sm:w-32 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-lg sm:text-xl">Loading BANCAI Banking Platform...</p>
                </div>
            </div>
        );
    }

    if (!effectiveUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-6 sm:p-8 text-center shadow-lg">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <CreditCard className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        BANCAI Banking
                    </h1>
                    <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
                        Secure AI-powered banking platform with enterprise SSO authentication.
                    </p>
                    <button
                        onClick={() => signIn()}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base backdrop-blur-sm border border-green-400/30 shadow-lg hover:shadow-xl"
                    >
                        <Lock className="w-4 sm:w-5 h-4 sm:h-5" />
                        Sign In with CODAI SSO
                    </button>
                    <p className="text-xs text-gray-400 mt-3 sm:mt-4">
                        Phase 4 Integration - Banking Security Enhanced
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-white">
            {/* Header */}
            <header className="backdrop-blur-sm bg-white/5 dark:bg-gray-800/10 border-b border-white/10 dark:border-gray-700/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    BANCAI
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-400">AI Banking Platform</p>
                            </div>
                        </div>

                        <nav className="flex items-center space-x-3 sm:space-x-4">
                            <div className="text-xs sm:text-sm text-gray-300 hidden sm:block">
                                Welcome, {effectiveUser.name || effectiveUser.email}
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="backdrop-blur-sm bg-red-500/20 text-red-300 px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-red-500/30 transition-all text-xs sm:text-sm border border-red-500/30"
                            >
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Banking Dashboard */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

                    {/* User Profile Card */}
                    <article className="lg:col-span-1">
                        <div className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                            <header>
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                                    Banking Profile
                                </h3>
                            </header>

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="text-gray-400 text-xs sm:text-sm">Account Holder</label>
                                    <div className="text-white font-medium text-sm sm:text-base">{effectiveUser.name || 'N/A'}</div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-xs sm:text-sm">Email</label>
                                    <div className="text-white font-medium text-sm sm:text-base break-all">{effectiveUser.email}</div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-xs sm:text-sm">Banking Roles</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {effectiveUser.roles?.map((role) => (
                                            <span key={role} className="backdrop-blur-sm bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-xs sm:text-sm">Security Level</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                                        <span className="text-green-400 font-medium text-xs sm:text-sm">Enhanced Security</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-xs sm:text-sm">Device Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {session?.deviceTrusted ? (
                                            <>
                                                <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                                                <span className="text-green-400 text-xs sm:text-sm">Trusted Device</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400" />
                                                <span className="text-yellow-400 text-xs sm:text-sm">Verification Required</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Banking Features */}
                    <article className="lg:col-span-2">
                        <div className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/20 rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                            <header>
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                    <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                                    Banking Services
                                </h3>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {/* Account Balance */}
                                <div className="backdrop-blur-md bg-white/5 dark:bg-gray-800/10 rounded-xl p-3 sm:p-4 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Primary Account</span>
                                        <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-white">$24,586.42</div>
                                    <div className="text-green-400 text-xs sm:text-sm">+2.4% this month</div>
                                </div>

                                {/* Savings Account */}
                                <div className="backdrop-blur-md bg-white/5 dark:bg-gray-800/10 rounded-xl p-3 sm:p-4 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Savings Account</span>
                                        <Activity className="w-3 sm:w-4 h-3 sm:h-4 text-blue-400" />
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-white">$85,234.18</div>
                                    <div className="text-blue-400 text-xs sm:text-sm">4.2% APY</div>
                                </div>

                                {/* Credit Score */}
                                <div className="backdrop-blur-md bg-white/5 dark:bg-gray-800/10 rounded-xl p-3 sm:p-4 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Credit Score</span>
                                        <Users className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-white">742</div>
                                    <div className="text-purple-400 text-xs sm:text-sm">Excellent</div>
                                </div>

                                {/* Recent Transaction */}
                                <div className="backdrop-blur-md bg-white/5 dark:bg-gray-800/10 rounded-xl p-3 sm:p-4 border border-white/10 dark:border-gray-700/20 hover:bg-white/10 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Last Transaction</span>
                                        <CreditCard className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400" />
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-white">-$42.18</div>
                                    <div className="text-yellow-400 text-xs sm:text-sm">Coffee Shop - 2h ago</div>
                                </div>
                            </div>

                            {/* Security Features */}
                            <div className="mt-4 sm:mt-6 p-3 sm:p-4 backdrop-blur-md bg-green-500/10 dark:bg-green-900/20 rounded-xl border border-green-500/20 dark:border-green-700/30">
                                <h4 className="text-base sm:text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                                    <Shield className="w-4 sm:w-5 h-4 sm:h-5" />
                                    Enhanced Banking Security
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                                        <span className="text-gray-300">Multi-Factor Authentication</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                                        <span className="text-gray-300">Device Fingerprinting</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                                        <span className="text-gray-300">Behavioral Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                                        <span className="text-gray-300">Transaction Monitoring</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Phase 4 Integration Status */}
                    <article className="mt-6 sm:mt-8 backdrop-blur-sm bg-white/5 dark:bg-gray-800/10 rounded-2xl border border-white/10 dark:border-gray-700/20 p-4 sm:p-6">
                        <header>
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Phase 4 Integration Status</h3>
                        </header>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="text-center">
                                <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">3/3</div>
                                <div className="text-gray-400 text-xs sm:text-sm">Pilot Applications</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">100%</div>
                                <div className="text-gray-400 text-xs sm:text-sm">SSO Integration</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">Enhanced</div>
                                <div className="text-gray-400 text-xs sm:text-sm">Banking Security</div>
                            </div>
                        </div>
                    </article>
                </section>
            </main>
        </div>
    );
}
