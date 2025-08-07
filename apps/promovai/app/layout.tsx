import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PromovAI - AI-Powered Crowdfunding Platform',
  description: 'Launch successful crowdfunding campaigns with AI-powered insights and promotion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}

