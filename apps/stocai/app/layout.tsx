import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StocAI - AI Stock Trading Platform",
  description: "Advanced AI-powered stock trading platform with real-time analysis, portfolio management, and intelligent trading signals.",
  keywords: ["stock trading", "AI trading", "portfolio management", "market analysis", "trading signals"],
  authors: [{ name: "CodAI Team" }],
  openGraph: {
    title: "StocAI - AI Stock Trading Platform",
    description: "Advanced AI-powered stock trading platform with real-time analysis and intelligent trading signals.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
