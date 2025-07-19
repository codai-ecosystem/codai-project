'use client'

import { GuestRoute, SignupForm } from '@codai/shared-ui'
import { Activity } from 'lucide-react'

export default function SignupPage() {
    return (
        <GuestRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* App Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl mb-4">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Join LOGAI</h1>
                        <p className="text-slate-400">Transform your log analysis with AI</p>
                    </div>

                    {/* Signup Form */}
                    <SignupForm
                        onSubmit={async (data) => {
                            console.log('Signup attempt:', data.email, data.password, data.name)
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
                            © 2025 LOGAI. Part of the CODAI ecosystem.
                        </p>
                    </div>
                </div>
            </div>
        </GuestRoute>
    )
}
