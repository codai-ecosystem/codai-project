'use client'

import { ThemeProvider } from 'next-themes'
import { CodaiSDKProvider } from '@codai/sdk'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <CodaiSDKProvider
                config={{
                    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
                    enableRealtime: true,
                    enableAnalytics: true,
                }}
            >
                {children}
            </CodaiSDKProvider>
        </ThemeProvider>
    )
}
