import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fabricai - Codai Ecosystem',
  description: 'AI Services Platform',
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