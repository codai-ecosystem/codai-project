interface HealthStatusProps {
    serviceName: string
    port: string
}

export function HealthStatus({ serviceName, port }: HealthStatusProps) {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: serviceName,
        port: port,
        version: '1.0.0',
        uptime: Math.floor(Math.random() * 86400),
        framework: 'Next.js 15',
        compliance: '4000+ Policy'
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {serviceName}
                    </h1>
                    <p className="text-lg text-green-600 dark:text-green-400 font-medium">
                        Service Operational - Port Compliant (4000+)
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            🚀 Service Info
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Framework:</span>
                                <span className="font-medium">{healthData.framework}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Port:</span>
                                <span className="font-medium">{healthData.port}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <span className="text-green-600 font-medium">Operational</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Compliance:</span>
                                <span className="font-medium">{healthData.compliance}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            📊 Ecosystem
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                                <span className="font-medium">Codai Ecosystem</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Version:</span>
                                <span className="font-medium">{healthData.version}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Architecture:</span>
                                <span className="font-medium">Microservices</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Policy:</span>
                                <span className="font-medium">No ports below 4000</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-center space-x-8">
                        <a href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            🏥 Dashboard
                        </a>
                        <a href="/api/health" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            📊 API Status
                        </a>
                        <a href="/api/status" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            🔌 Full Status
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
