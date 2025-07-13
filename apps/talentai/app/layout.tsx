
export const metadata = {
  title: 'TalentAI - AI Talent Management Platform',
  description: 'Advanced AI-powered talent management and recruitment platform',
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
