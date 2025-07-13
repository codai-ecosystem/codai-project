'use client'

import { motion } from 'framer-motion'
import { Users, MessageCircle, Video, Calendar, FileText, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface TeamMember {
  id: string
  name: string
  avatar: string
  status: 'online' | 'busy' | 'away' | 'offline'
  role: string
  currentTask?: string
}

interface RecentActivity {
  id: string
  user: string
  action: string
  target: string
  timestamp: Date
  type: 'edit' | 'comment' | 'share' | 'create'
}

export function CollaborationHub({ theme }: { theme: string }) {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      status: 'online',
      role: 'Product Manager',
      currentTask: 'Reviewing quarterly roadmap'
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      avatar: '/avatars/marcus.jpg',
      status: 'busy',
      role: 'Senior Developer',
      currentTask: 'Code review session'
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      avatar: '/avatars/emma.jpg',
      status: 'online',
      role: 'UX Designer',
      currentTask: 'Prototyping new features'
    },
    {
      id: '4',
      name: 'David Kim',
      avatar: '/avatars/david.jpg',
      status: 'away',
      role: 'DevOps Engineer',
      currentTask: 'Deployment monitoring'
    }
  ])

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      user: 'Sarah Chen',
      action: 'created',
      target: 'Q4 Product Roadmap',
      timestamp: new Date(Date.now() - 300000),
      type: 'create'
    },
    {
      id: '2',
      user: 'Marcus Johnson',
      action: 'commented on',
      target: 'API Documentation',
      timestamp: new Date(Date.now() - 600000),
      type: 'comment'
    },
    {
      id: '3',
      user: 'Emma Rodriguez',
      action: 'shared',
      target: 'Design System Updates',
      timestamp: new Date(Date.now() - 900000),
      type: 'share'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'emerald'
      case 'busy': return 'red'
      case 'away': return 'yellow'
      default: return 'slate'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return FileText
      case 'comment': return MessageCircle
      case 'share': return Users
      default: return Clock
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Team Members */}
      <div className="glassmorphism rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Team Members</h3>
          <motion.button
            className={`bg-${theme}-500/20 text-${theme}-400 px-4 py-2 rounded-lg hover:bg-${theme}-500/30 transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Video className="w-4 h-4 inline mr-2" />
            Start Meeting
          </motion.button>
        </div>
        
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-${getStatusColor(member.status)}-500 rounded-full border-2 border-slate-900`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-slate-400">{member.role}</span>
                </div>
                {member.currentTask && (
                  <div className="text-sm text-slate-400 mt-1">{member.currentTask}</div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <motion.button
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle className="w-4 h-4" />
                </motion.button>
                <motion.button
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Video className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glassmorphism rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <motion.button
            className="text-slate-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            View All
          </motion.button>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            
            return (
              <motion.div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-8 h-8 bg-${theme}-500/20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${theme}-400`} />
                </div>
                
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-slate-400"> {activity.action} </span>
                    <span className="font-medium">{activity.target}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {activity.timestamp.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              className={`bg-${theme}-500/20 text-${theme}-400 p-3 rounded-lg hover:bg-${theme}-500/30 transition-colors text-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="w-4 h-4 mx-auto mb-1" />
              Schedule
            </motion.button>
            <motion.button
              className="bg-emerald-500/20 text-emerald-400 p-3 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-4 h-4 mx-auto mb-1" />
              Chat
            </motion.button>
            <motion.button
              className="bg-blue-500/20 text-blue-400 p-3 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-4 h-4 mx-auto mb-1" />
              Docs
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}