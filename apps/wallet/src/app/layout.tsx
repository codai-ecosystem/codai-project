import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wallet - Codai Ecosystem',
  description: 'Programmable Wallet',
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