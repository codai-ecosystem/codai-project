import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cumparai - Codai Ecosystem',
  description: 'AI Shopping Platform',
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