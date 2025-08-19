'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, MessageSquare } from 'lucide-react'

export default function ConversAIPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/inbox')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <MessageSquare className="h-12 w-12" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ConversAI</h1>
        <p className="text-gray-600 mb-4">Loading Professional Communication Platform...</p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </motion.div>
    </div>
  )
}
