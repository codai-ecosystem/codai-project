/**
 * MemorAI Dashboard Page (Simplified for Production)
 * Post-authentication landing page
 */

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400 text-2xl">
                            🧠
                        </div>
                        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                            MemorAI Dashboard
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Your AI-powered memory management platform is being optimized for production deployment.
                        </p>
                        <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
