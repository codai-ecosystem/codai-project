import type { Metadata } from 'next'
import BancaiSessionProvider from '../components/BancaiSessionProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bancai - AI Banking Platform',
  description: 'Secure AI-powered banking with enterprise SSO authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <BancaiSessionProvider>
          {children}
        </BancaiSessionProvider>
      </body>
    </html>
  )
}