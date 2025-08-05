import Head from 'next/head';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            <Head>
                <title>MemorAI Documentation</title>
                <meta name="description" content="AI memory infrastructure platform for developers. Build intelligent applications with persistent memory, vector search, and real-time collaboration." />
            </Head>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">MemorAI Documentation</h1>
                    <p className="text-xl text-gray-600">
                        AI memory infrastructure platform for developers. Build intelligent applications with persistent memory, vector search, and real-time collaboration.
                    </p>
                </header>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">What is MemorAI?</h2>
                    <p className="text-gray-700 mb-4">
                        MemorAI is a comprehensive AI memory platform that provides:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>🧠 Persistent Memory</strong>: Store and retrieve contextual information across sessions</li>
                        <li><strong>🔍 Vector Search</strong>: Advanced semantic search with high-performance indexing</li>
                        <li><strong>⚡ Real-time Sync</strong>: Live collaboration and memory sharing</li>
                        <li><strong>🛡️ Enterprise Security</strong>: End-to-end encryption and compliance features</li>
                        <li><strong>🔧 Developer Tools</strong>: SDKs, APIs, and CLI tools for seamless integration</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start</h2>
                    <div className="bg-gray-100 p-6 rounded-lg">
                        <pre className="text-sm">
                            {`# Install the SDK
npm install @memorai/sdk

# Initialize your project
npx memorai init

# Start building
npm run dev`}
                        </pre>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Intelligent Memory Management</h3>
                            <p className="text-gray-600">Store, organize, and retrieve memories with AI-powered categorization and semantic understanding.</p>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Vector-Powered Search</h3>
                            <p className="text-gray-600">Lightning-fast semantic search across your entire memory database with advanced filtering and ranking.</p>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Real-time Collaboration</h3>
                            <p className="text-gray-600">Share memories and collaborate in real-time with team members across different applications.</p>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibent mb-2">Enterprise-Grade Security</h3>
                            <p className="text-gray-600">Built with security-first architecture, featuring encryption, access controls, and compliance certifications.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <h3 className="text-lg font-semibold mb-2">🚀 Getting Started</h3>
                            <p className="text-gray-600 mb-4">Learn the basics and get your first MemorAI application running.</p>
                            <a href="/getting-started" className="text-blue-600 hover:text-blue-800 font-medium">
                                Start Building →
                            </a>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <h3 className="text-lg font-semibold mb-2">📚 API Reference</h3>
                            <p className="text-gray-600 mb-4">Comprehensive API documentation with examples and best practices.</p>
                            <a href="/api/overview" className="text-blue-600 hover:text-blue-800 font-medium">
                                Explore APIs →
                            </a>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <h3 className="text-lg font-semibold mb-2">🛠️ SDK Guide</h3>
                            <p className="text-gray-600 mb-4">Learn how to integrate MemorAI into your applications.</p>
                            <a href="/sdk/typescript" className="text-blue-600 hover:text-blue-800 font-medium">
                                Use the SDK →
                            </a>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <h3 className="text-lg font-semibold mb-2">💡 Examples</h3>
                            <p className="text-gray-600 mb-4">Explore real-world examples and implementation patterns.</p>
                            <a href="/examples" className="text-blue-600 hover:text-blue-800 font-medium">
                                See Examples →
                            </a>
                        </div>
                    </div>
                </section>

                <footer className="text-center mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
                    <p className="text-gray-600 mb-6">Create your first MemorAI application in under 5 minutes.</p>
                    <a
                        href="/getting-started"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Start Building Now
                    </a>
                </footer>
            </div>
        </div>
    );
}
