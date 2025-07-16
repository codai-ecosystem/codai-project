export default function HealthPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">AIDE Health Status</h1>
                    <p className="text-gray-600 mb-4">AI Development Environment</p>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-green-800 font-semibold">✓ Service Operational</p>
                        <p className="text-green-600 text-sm">All systems running normally</p>
                    </div>
                    <div className="mt-6 text-sm text-gray-500">
                        <p>Port: 4051</p>
                        <p>Type: AI Development Environment</p>
                        <p>Status: Healthy</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
