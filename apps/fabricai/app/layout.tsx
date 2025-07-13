import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import FabricAILayout from './FabricAILayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FabricAI - AI Development Platform',
  description: 'Advanced AI development platform with code generation, workflows, and automation tools',
  keywords: ['AI', 'development', 'platform', 'code generation', 'workflows', 'automation', 'fabricai'],
  authors: [{ name: 'Codai Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <FabricAILayout>
          {children}
        </FabricAILayout>
      </body>
    </html>
  )
}