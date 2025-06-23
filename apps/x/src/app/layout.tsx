import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'X - Codai Ecosystem',
  description: 'AI Trading Platform',
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