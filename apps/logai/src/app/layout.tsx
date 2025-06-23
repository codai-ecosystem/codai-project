import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logai - Codai Ecosystem',
  description: 'Identity & Authentication Hub',
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