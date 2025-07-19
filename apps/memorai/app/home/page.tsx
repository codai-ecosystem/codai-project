'use client'

// Temporary simplified home page for production build
export default function HomePageAuthenticated() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Welcome to MEMORAI</h1>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-2">Your AI Memory Enhancement Platform</h2>
                <p className="text-gray-600">
                    MEMORAI helps you enhance your memory and knowledge retention through advanced AI technologies.
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => window.location.href = '/memories'} className="bg-purple-100 p-4 rounded-lg hover:bg-purple-200">
                    <h3 className="font-semibold">Memory Training</h3>
                    <p className="text-sm text-gray-600">Start cognitive enhancement</p>
                </button>
                <button onClick={() => window.location.href = '/data'} className="bg-blue-100 p-4 rounded-lg hover:bg-blue-200">
                    <h3 className="font-semibold">Knowledge Base</h3>
                    <p className="text-sm text-gray-600">Browse stored memories</p>
                </button>
                <button onClick={() => window.location.href = '/search'} className="bg-green-100 p-4 rounded-lg hover:bg-green-200">
                    <h3 className="font-semibold">Smart Search</h3>
                    <p className="text-sm text-gray-600">AI-powered search</p>
                </button>
                <button onClick={() => window.location.href = '/analytics'} className="bg-orange-100 p-4 rounded-lg hover:bg-orange-200">
                    <h3 className="font-semibold">Learning Path</h3>
                    <p className="text-sm text-gray-600">View progress</p>
                </button>
            </div>
        </div>
    )
}
