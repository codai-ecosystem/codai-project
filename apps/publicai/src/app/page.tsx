'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PublicaiPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Redirecting to PublicAI Dashboard...</p>
      </div>
    </div>
  )
}
