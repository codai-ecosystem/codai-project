'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [email, setEmail] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate sending reset email - replace with actual logic
        setTimeout(() => {
            setIsEmailSent(true)
            setIsLoading(false)
        }, 2000)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{
                        x: [0, 50, -25, 0],
                        y: [0, -50, 25, 0],
                        scale: [1, 1.1, 0.9, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{
                        x: [0, -25, 50, 0],
                        y: [0, 25, -50, 0],
                        scale: [1, 0.9, 1.1, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, delay: 3 }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Login</span>
                    </Link>
                </motion.div>

                {/* Forgot Password Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl"
                >
                    {!isEmailSent ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                        <Mail className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                                <p className="text-gray-300">
                                    No worries, we'll send you reset instructions.
                                </p>
                            </div>

                            {/* Reset Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>

                            {/* Sign In Link */}
                            <div className="mt-8 text-center">
                                <p className="text-gray-300">
                                    Remember your password?{' '}
                                    <Link
                                        href="/auth/login"
                                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-4">Check your email</h1>
                                <p className="text-gray-300 mb-6">
                                    We sent a password reset link to<br />
                                    <span className="font-medium text-indigo-400">{email}</span>
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => window.open('mailto:', '_blank')}
                                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        Open email app
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsEmailSent(false)
                                            setEmail('')
                                        }}
                                        className="w-full py-3 bg-white/5 border border-white/20 rounded-xl text-white font-medium hover:bg-white/10 transition-all"
                                    >
                                        Try another email
                                    </button>
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-gray-400 text-sm">
                                        Didn't receive the email? Check your spam folder or{' '}
                                        <button
                                            onClick={() => {
                                                setIsEmailSent(false)
                                                // Trigger resend logic here
                                            }}
                                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            try again
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
