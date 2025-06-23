import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Codai - Codai Ecosystem',
  description: 'Central Platform & AIDE Hub',
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