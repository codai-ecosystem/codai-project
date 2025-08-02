/**
 * 📊 Simple Admin Dashboard Page
 * Simplified version for testing
 */

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    🚀 CODAI Admin Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            ✅ Service Status
                        </h2>
                        <p className="text-green-600">All systems operational</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            📊 Quick Stats
                        </h2>
                        <p className="text-blue-600">Dashboard loaded successfully</p>
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        🧪 UI Testing Elements
                    </h3>

                    <div className="space-y-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Test Button
                        </button>

                        <input
                            type="text"
                            placeholder="Test input field"
                            className="w-full p-2 border border-gray-300 rounded"
                        />

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="test-check" />
                            <label htmlFor="test-check">Test checkbox</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
