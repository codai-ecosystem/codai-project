'use client'

// Auto-generated from mobile-static.html
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MobilePage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Converted from static HTML design */}
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold gradient-text">
          MOBILE
        </h1>
        <p className="text-slate-400 mt-4">
          Beautiful design converted from static HTML
        </p>
        <div className="text-sm text-slate-500 mt-2">
          {currentTime.toLocaleString()}
        </div>
      </div>
      
      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(45deg, #10b981, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
        }
      `}</style>
    </div>
  )
}