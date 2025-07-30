import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AdoptAI - AI-Powered Pet Adoption Platform',
  description: 'Connect pets with loving families using AI-powered matching',
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
