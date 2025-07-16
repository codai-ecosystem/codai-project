export default function HealthPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-primary">AIDE Health Check</h1>
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-lg text-muted-foreground">Service Running - Next.js 15.4.1</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    <p>Port: 4030 | Status: Active | Framework: Next.js 15</p>
                    <p>AI Development Environment - CODAI Ecosystem</p>
                </div>
            </div>
        </div>
    )
}
