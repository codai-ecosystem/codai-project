import './globals.css'

export const metadata = {
  title: 'AJUTAI - Universal Support System',
  description: 'AI-powered support platform with chatbot, knowledge base, and ticketing system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
