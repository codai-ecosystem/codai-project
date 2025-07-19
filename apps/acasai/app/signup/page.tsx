'use client'

import { GuestRoute, SignupForm } from '@codai/shared-ui'
import { Home } from 'lucide-react'

export default function SignupPage() {
    return (
        <GuestRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* App Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl mb-4">
                            <Home className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Join ACASAI</h1>
                        <p className="text-slate-400">Start your smart home journey today</p>
                    </div>

                    {/* Signup Form */}
                    <SignupForm
                        onSubmit={async (data) => {
                            console.log('Signup attempt:', data)
                            // TODO: Implement actual signup logic
                        }}
                        onSigninClick={() => {
                            window.location.href = '/login'
                        }}
                        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl"
                    />

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-slate-400 text-sm">
                            By signing up, you agree to our{' '}
                            <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </GuestRoute>
    )
}
