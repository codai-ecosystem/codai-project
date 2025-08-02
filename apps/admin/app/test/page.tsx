/**
 * Super Simple Test Page
 * Minimal page to test if Next.js is working
 */

export default function TestPage() {
    return (
        <html>
            <head>
                <title>CODAI Admin Test</title>
            </head>
            <body>
                <h1>✅ CODAI Admin Test Page</h1>
                <p>If you can see this, the admin service is working!</p>
                <p>Time: {new Date().toISOString()}</p>
            </body>
        </html>
    );
}
