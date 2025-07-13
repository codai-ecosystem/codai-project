
export const metadata = {
  title: 'Admin - AI Administration Platform',
  description: 'Comprehensive administration and management platform for system operations',
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
