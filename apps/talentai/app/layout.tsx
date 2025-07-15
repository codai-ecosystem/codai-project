import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'TalentAI - AI-Powered HR Recruitment',
    description: 'Advanced AI chat system for recruiting top prompt engineers and tech talent',
    keywords: ['AI recruitment', 'HR technology', 'talent acquisition', 'prompt engineers'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
                    {children}
                </div>
            </body>
        </html>
    )
}
