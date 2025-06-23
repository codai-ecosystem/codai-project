import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Studiai - Codai Ecosystem',
  description: 'AI Education Platform',
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