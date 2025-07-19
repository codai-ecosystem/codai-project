'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Home, Bug } from 'lucide-react'

interface ErrorPageProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log the error to your error reporting service
        console.error('Page Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-md mx-auto"
            >
                <div className="w-24 h-24 bg-red-500/20 rounded-xl flex items-center justify-center mb-8 mx-auto">
                    <Bug className="w-12 h-12 text-red-400" />
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">
                    Something went wrong!
                </h1>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    An unexpected error occurred in CODAI. Our team has been notified and is working on a fix.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8 text-left">
                        <p className="text-red-400 font-mono text-sm break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={reset}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-xl transition-all"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = '/'}
                        className="border border-slate-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}
