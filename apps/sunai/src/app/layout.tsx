import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'

import { useLogAI, setupGlobalErrorHandling, logPerformanceMetrics } from '@codai/logai-integration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SunAI - Real-time AI Translation & Communication',
    description: 'Advanced real-time translation platform with AI-powered video calls and chat',
    keywords: ['AI translation', 'real-time communication', 'video calls', 'multilingual chat'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Initialize LogAI integration
    const { logEvent, logError, logUserAction } = useLogAI()

    useEffect(() => {
        // Setup global error handling and performance monitoring
        setupGlobalErrorHandling('sunai')
        logPerformanceMetrics('sunai')

        // Log app initialization
        logEvent('app_initialized', {
            service: 'sunai',
            version: process.env.npm_package_version || '1.0.0',
            timestamp: new Date().toISOString()
        })
    }, [])

    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-orange-900">
                    {children}
                </div>
            </body>
        </html>
    )
}

