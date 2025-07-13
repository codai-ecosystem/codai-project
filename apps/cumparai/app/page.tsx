export default function CumparAIPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">CumparAI</h1>
        <p className="text-xl text-gray-300 mb-8">AI Shopping & Price Comparison Platform</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Price Comparison</h2>
            <p className="text-gray-300">Advanced price comparison capabilities with AI optimization</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">AI Recommendations</h2>
            <p className="text-gray-300">Smart recommendations powered by artificial intelligence</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Product Search</h2>
            <p className="text-gray-300">Intelligent product search with advanced filtering</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Shopping Analytics</h2>
            <p className="text-gray-300">Comprehensive analytics for your shopping patterns</p>
          </div>
        </div>
      </div>
    </div>
  )
}
