'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-md mx-auto"
            >
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-8 mx-auto">
                    <span className="text-white font-bold text-4xl">404</span>
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">
                    Page Not Found
                </h1>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    The page you're looking for doesn't exist in CODAI. It might have been moved, deleted, or you entered the wrong URL.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/')}
                        className="border border-slate-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </motion.button>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700">
                    <p className="text-slate-500 text-sm">
                        Need help? <a href="/support" className="text-blue-400 hover:text-blue-300 transition-colors">Contact Support</a>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
