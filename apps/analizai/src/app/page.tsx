'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Database,
  FileText,
  Brain,
  Share2,
  Settings,
  TrendingUp,
  Users,
  Target,
  Activity,
  DollarSign,
  Eye,
  ArrowRight,
  Zap,
  Globe,
  Clock,
  Star,
  Award,
  Shield,
  Layers
} from 'lucide-react'

export default function AnalizAILanding() {
  const router = useRouter()

  React.useEffect(() => {
    // Redirect to dashboard immediately
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BarChart3 className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          AnalizAI
        </h1>
        <p className="text-gray-600">Advanced Analytics & Business Intelligence</p>
      </div>
    </div>
  )
}