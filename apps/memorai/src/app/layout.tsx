import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memorai - Codai Ecosystem',
  description: 'AI Memory & Database Core',
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