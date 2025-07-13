import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'AIDE - AI Development Environment',
    description: 'Ultimate AI Development Orchestration Platform - VS Code-like interface with GitHub Copilot chat integration',
}

export default function RootLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} h-full overflow-hidden bg-slate-900`}>
                {children}
            </body>
        </html>
    )
}
