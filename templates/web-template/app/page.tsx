import { Button } from '@codai/ui'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        Welcome to CODAI Ecosystem
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
                    >
                        Modern Web App
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {" "}Template
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                    >
                        Built with Next.js 15, Tailwind CSS, Framer Motion, and the complete CODAI ecosystem.
                        Start building amazing web applications with shared components and services.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Button size="lg" asChild>
                            <Link href="/dashboard" className="group">
                                Get Started
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>

                        <Button variant="outline" size="lg" asChild>
                            <Link href="/docs">
                                View Documentation
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-16 relative"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FeatureCard
                                    icon="⚡"
                                    title="Lightning Fast"
                                    description="Built with Next.js 15 and optimized for performance"
                                />
                                <FeatureCard
                                    icon="🎨"
                                    title="Beautiful UI"
                                    description="Tailwind CSS with custom animations and components"
                                />
                                <FeatureCard
                                    icon="🔗"
                                    title="Interconnected"
                                    description="Full CODAI ecosystem integration out of the box"
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </main>
    )
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: string
    title: string
    description: string
}) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
        >
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </motion.div>
    )
}
