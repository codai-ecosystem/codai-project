import React from 'react'
import { Heart, Dog, Cat } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">AdoptAI</h1>
          </div>
          <p className="text-xl text-gray-600">AI-Powered Pet Adoption Platform</p>
          <p className="text-gray-500 mt-2">Connect pets with loving families using intelligent matching</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Dog className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">AI algorithms match pets with families based on lifestyle, preferences, and compatibility</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Cat className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pet Profiles</h3>
            <p className="text-gray-600">Comprehensive profiles with photos, health records, and personality traits</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Success Stories</h3>
            <p className="text-gray-600">Track successful adoptions and build lasting relationships</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
            Start Matching
          </button>
        </div>
      </div>
    </div>
  )
}

