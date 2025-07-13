import { AnalizAILayout } from '../layout/AnalizAILayout'
import './globals.css'

export const metadata = {
  title: 'AnalizAI - AI Data Analysis Platform',
  description: 'Advanced AI-powered data analysis and insights platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <AnalizAILayout>
          {children}
        </AnalizAILayout>
      </body>
    </html>
  )
}
