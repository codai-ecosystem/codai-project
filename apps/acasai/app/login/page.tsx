'use client'

import { GuestRoute, LoginForm } from '@codai/shared-ui'
import { Home } from 'lucide-react'

export default function LoginPage() {
    return (
        <GuestRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* App Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl mb-4">
                            <Home className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome to ACASAI</h1>
                        <p className="text-slate-400">Smart Home Intelligence Platform</p>
                    </div>

                    {/* Login Form */}
                    <LoginForm
                        onSubmit={async (data) => {
                            console.log('Login attempt:', data.email, data.password)
                            // TODO: Implement actual login logic
                        }}
                        onForgotPasswordClick={() => {
                            console.log('Forgot password')
                            // TODO: Implement forgot password
                        }}
                        onSignupClick={() => {
                            window.location.href = '/signup'
                        }}
                        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl"
                    />

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-slate-400 text-sm">
                            © 2025 ACASAI. Part of the CODAI ecosystem.
                        </p>
                    </div>
                </div>
            </div>
        </GuestRoute>
    )
}
