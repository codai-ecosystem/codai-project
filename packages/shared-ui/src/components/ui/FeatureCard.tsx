'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'
import { cn } from '../../lib/utils'

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  status: 'active' | 'beta' | 'coming-soon'
  delay?: number
  onLearnMore?: () => void
  className?: string
}

const statusMap = {
  active: 'bg-green-500/20 text-green-400',
  beta: 'bg-yellow-500/20 text-yellow-400',
  'coming-soon': 'bg-gray-500/20 text-gray-400'
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  status,
  delay = 0,
  onLearnMore,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      <Card variant="glass" className="h-full">
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-indigo-500/20">
                {icon}
              </div>
              <div>
                <h3 className="text-white text-lg font-semibold">{title}</h3>
                <p className="text-gray-400 mt-1">{description}</p>
              </div>
            </div>
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              statusMap[status]
            )}>
              {status.replace('-', ' ')}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex justify-end">
            <Button
              variant="gradient"
              size="sm"
              className="flex items-center space-x-2"
              onClick={onLearnMore}
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default FeatureCard
