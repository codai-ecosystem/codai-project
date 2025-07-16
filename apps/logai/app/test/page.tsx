// Simple test page to verify LogAI is working
export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">LogAI Test Page</h1>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">LogAI is Working!</h2>
          <p className="text-gray-300 text-lg">
            This is a test page to verify LogAI application is running correctly.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300">Service Status</h3>
              <p className="text-green-400">✓ Online</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300">Port</h3>
              <p className="text-blue-400">4032</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
