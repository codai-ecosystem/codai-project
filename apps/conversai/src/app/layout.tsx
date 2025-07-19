import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Conversai - CODAI Ecosystem',
  description: 'Part of the CODAI ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}