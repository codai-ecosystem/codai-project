'use client';

import { useCodaiAuth } from '@codai/sso-sdk/hooks';
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
    const { user, session, isLoading, signIn, signOut } = useCodaiAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-xl">Loading BANCAI Banking Platform...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-white flex items-center justify-center">
                <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        BANCAI Banking
                    </h1>
                    <p className="text-gray-300 mb-8">
                        Secure AI-powered banking platform with enterprise SSO authentication.
                    </p>
                    <button
                        onClick={() => signIn()}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium flex items-center justify-center gap-2"
                    >
                        <Lock className="w-5 h-5" />
                        Sign In with CODAI SSO
                    </button>
                    <p className="text-xs text-gray-400 mt-4">
                        Phase 4 Integration - Banking Security Enhanced
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-white">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    BANCAI
                                </h1>
                                <p className="text-sm text-gray-400">AI Banking Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-300">
                                Welcome, {user.name || user.email}
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Banking Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* User Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-400" />
                                Banking Profile
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm">Account Holder</label>
                                    <div className="text-white font-medium">{user.name || 'N/A'}</div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">Email</label>
                                    <div className="text-white font-medium">{user.email}</div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">Banking Roles</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {user.roles?.map((role) => (
                                            <span key={role} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">Security Level</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400 font-medium">Enhanced Security</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">Device Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {session?.deviceTrusted ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                <span className="text-green-400">Trusted Device</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                                <span className="text-yellow-400">Verification Required</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Banking Features */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-400" />
                                Banking Services
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Account Balance */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Primary Account</span>
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">$24,586.42</div>
                                    <div className="text-green-400 text-sm">+2.4% this month</div>
                                </div>

                                {/* Savings Account */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Savings Account</span>
                                        <Activity className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">$85,234.18</div>
                                    <div className="text-blue-400 text-sm">4.2% APY</div>
                                </div>

                                {/* Credit Score */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Credit Score</span>
                                        <Users className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">742</div>
                                    <div className="text-purple-400 text-sm">Excellent</div>
                                </div>

                                {/* Recent Transaction */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Last Transaction</span>
                                        <CreditCard className="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">-$42.18</div>
                                    <div className="text-yellow-400 text-sm">Coffee Shop - 2h ago</div>
                                </div>
                            </div>

                            {/* Security Features */}
                            <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                <h4 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Enhanced Banking Security
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-gray-300">Multi-Factor Authentication</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-gray-300">Device Fingerprinting</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-gray-300">Behavioral Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-gray-300">Transaction Monitoring</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phase 4 Integration Status */}
                <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Phase 4 Integration Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">3/3</div>
                            <div className="text-gray-400 text-sm">Pilot Applications</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">100%</div>
                            <div className="text-gray-400 text-sm">SSO Integration</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">Enhanced</div>
                            <div className="text-gray-400 text-sm">Banking Security</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
