'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { Monitor, Activity } from 'lucide-react'

interface EnterpriseHeaderProps {
  title: string
  subtitle: string
  isOnline: boolean
  currentTime: Date
  colorScheme: { primary: string; secondary: string; accent: string }
}

export function EnterpriseHeader({ title, subtitle, isOnline, currentTime, colorScheme }: EnterpriseHeaderProps) {
  return (
    <header className="relative z-10 p-6">
      <nav className="flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={`w-10 h-10 bg-gradient-to-r from-${colorScheme.primary}-500 to-${colorScheme.secondary}-500 rounded-lg flex items-center justify-center`}>
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold bg-gradient-to-r from-${colorScheme.primary}-400 to-${colorScheme.secondary}-400 bg-clip-text text-transparent`}>
              {title}
            </h1>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </motion.div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-sm text-slate-300">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="text-sm text-slate-400">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </nav>
    </header>
  )
}
