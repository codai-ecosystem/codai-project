export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to CODAI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-Native Development Platform - The future of software development with intelligent automation
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">AI Code Generation</h3>
          <p className="text-gray-600">
            Generate high-quality code with advanced AI models
          </p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Smart Automation</h3>
          <p className="text-gray-600">
            Automate repetitive development tasks with intelligent workflows
          </p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Collaborative Development</h3>
          <p className="text-gray-600">
            Work seamlessly with AI agents and human developers
          </p>
        </div>
      </div>

      <div className="text-center">
        <a
          href="/api/health"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Check API Status
        </a>
      </div>
    </div>
  )
}
