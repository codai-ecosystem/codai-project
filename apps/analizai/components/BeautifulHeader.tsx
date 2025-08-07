'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { Cpu, Activity, Globe } from 'lucide-react'

interface BeautifulHeaderProps {
  title: string
  subtitle: string
  isOnline: boolean
  currentTime: Date
  theme: string
}

export function BeautifulHeader({ title, subtitle, isOnline, currentTime, theme }: BeautifulHeaderProps) {
  return (
    <header className="relative z-10 p-6">
      <nav className="flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className={`w-12 h-12 bg-gradient-to-r from-${theme}-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Cpu className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <motion.h1
              className={`text-3xl font-bold bg-gradient-to-r from-${theme}-400 to-blue-400 bg-clip-text text-transparent`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="text-sm text-slate-400 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {subtitle}
            </motion.p>
          </div>
        </motion.div>
        
        <motion.div
          className="flex items-center space-x-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}
              animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-slate-300 font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="text-sm text-slate-400 font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="flex items-center space-x-1">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400">Global</span>
          </div>
        </motion.div>
      </nav>
    </header>
  )
}
