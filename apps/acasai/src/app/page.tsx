'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Home } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white mx-auto mb-4">
          <Home className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AcasAI</h1>
        <p className="text-gray-600 mb-4">Smart Home Automation Platform</p>
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
