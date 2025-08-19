'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white mx-auto mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CumparAI</h1>
        <p className="text-gray-600 mb-4">AI-Powered Shopping Platform</p>
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
