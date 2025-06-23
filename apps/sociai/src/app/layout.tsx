import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sociai - Codai Ecosystem',
  description: 'AI Social Platform',
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