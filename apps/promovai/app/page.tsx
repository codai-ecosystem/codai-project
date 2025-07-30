import { Target, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Target className="h-8 w-8 text-green-500" />
            <h1 className="text-4xl font-bold text-gray-900">PromovAI</h1>
          </div>
          <p className="text-xl text-gray-600">AI-Powered Crowdfunding Platform</p>
          <p className="text-gray-500 mt-2">Launch successful campaigns with intelligent insights and promotion</p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
            <p className="text-gray-600 text-sm">AI-powered campaign performance insights and optimization recommendations</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Audience Targeting</h3>
            <p className="text-gray-600 text-sm">Intelligent donor matching and audience segmentation for maximum reach</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <DollarSign className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Funding Goals</h3>
            <p className="text-gray-600 text-sm">AI-driven goal setting and milestone tracking for campaign success</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Target className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Campaign Optimization</h3>
            <p className="text-gray-600 text-sm">Real-time campaign adjustments based on performance data</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="space-x-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Start Campaign
            </button>
            <button className="border border-green-500 text-green-500 hover:bg-green-50 px-8 py-3 rounded-full font-semibold transition-colors">
              Browse Projects
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Featured Campaigns</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              <div className="p-6">
                <h3 className="font-semibold mb-2">Eco-Friendly Tech Startup</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-gray-600">$32,500 raised of $50,000 goal</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500"></div>
              <div className="p-6">
                <h3 className="font-semibold mb-2">Community Art Project</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-sm text-gray-600">$17,000 raised of $20,000 goal</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-green-400 to-teal-500"></div>
              <div className="p-6">
                <h3 className="font-semibold mb-2">Educational Initiative</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <p className="text-sm text-gray-600">$8,400 raised of $20,000 goal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
