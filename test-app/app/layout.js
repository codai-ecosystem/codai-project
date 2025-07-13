export const metadata = {
    title: 'Codai Test App',
    description: 'Test deployment for Codai ecosystem',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
