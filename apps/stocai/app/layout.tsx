export const metadata = {
  title: 'STOCAI - AI Trading Platform',
  description: 'AI-Powered Trading Intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
