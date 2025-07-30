import { CheckCircle, AlertCircle, Activity, Server } from 'lucide-react'

export default function HealthPage() {
    const healthData = {
        status: 'healthy',
        service: 'MOD',
        version: '3.1.2',
        port: 4056,
        uptime: '5h 18m',
        checks: [
            { name: 'Module Registry', status: 'healthy', responseTime: '5ms' },
            { name: 'Workflow Engine', status: 'healthy', responseTime: '8ms' },
            { name: 'Connection Broker', status: 'healthy', responseTime: '12ms' },
            { name: 'Execution Queue', status: 'healthy', responseTime: '15ms' }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center space-x-3">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">MOD Health Status</h1>
                        <p className="text-gray-600">Modular automation system monitoring</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-semibold text-green-700 capitalize">{healthData.status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Server className="h-6 w-6 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-600">Service</p>
                                <p className="font-semibold text-gray-900">{healthData.service}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs">
                                v{healthData.version}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Version</p>
                                <p className="font-semibold text-gray-900">Port {healthData.port}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Activity className="h-6 w-6 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-600">Uptime</p>
                                <p className="font-semibold text-gray-900">{healthData.uptime}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Checks</h3>
                    <div className="space-y-4">
                        {healthData.checks.map((check) => (
                            <div key={check.name} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3">
                                    {check.status === 'healthy' ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <span className="font-medium text-gray-900">{check.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">{check.responseTime}</span>
                                    <div className={`px-2 py-1 rounded text-xs ${check.status === 'healthy'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {check.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
