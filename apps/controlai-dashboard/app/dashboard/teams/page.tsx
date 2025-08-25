'use client'

import React from 'react'
/**
 * Enhanced Teams Management Page - Real-time Team Collaboration Center
 * Comprehensive team management with communication and performance tracking
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Users, UserPlus, MessageSquare, Video, Phone, Mail, Calendar,
    Settings, Search, Filter, MoreHorizontal, Star, Crown, Shield,
    Activity, Clock, Target, TrendingUp, BarChart3, PieChart,
    MapPin, Globe, Wifi, Signal, Bell, BellOff
} from 'lucide-react'

// Import modular components
import { TeamHeader } from './components/TeamHeader'
import { TeamStats } from './components/TeamStats'
import { TeamNavigation } from './components/TeamNavigation'
import { TeamMemberGrid } from './components/TeamMemberGrid'
import { TeamMemberList } from './components/TeamMemberList'
import { TeamCommunication } from './components/TeamCommunication'
import { TeamAnalytics } from './components/TeamAnalytics'
import { TeamFooter } from './components/TeamFooter'

// Enhanced Types
interface TeamsState {
    activeView: 'grid' | 'list' | 'communication' | 'analytics'
    selectedMembers: string[]
    filters: TeamFilters
    searchQuery: string
    showOffline: boolean
    realTimeUpdates: boolean
    communicationMode: 'chat' | 'video' | 'voice'
}

interface TeamFilters {
    roles: string[]
    departments: string[]
    skills: string[]
    availability: 'all' | 'online' | 'busy' | 'away'
    location: string[]
}

export interface TeamMember {
    id: string
    name: string
    email: string
    avatar: string
    role: string
    department: string
    skills: string[]
    status: 'online' | 'offline' | 'busy' | 'away'
    location: string
    timezone: string
    joinDate: string
    lastActive: string
    tasksCount: number
    completedTasks: number
    productivity: number
    communicationPreference: 'chat' | 'email' | 'video'
    isManager: boolean
    isTeamLead: boolean
}

// Mock data
const mockTeamMembers: TeamMember[] = [
    {
        id: 'member-1',
        name: 'Alex Chen',
        email: 'alex.chen@controlai.com',
        avatar: '/avatars/alex.jpg',
        role: 'Senior Developer',
        department: 'Engineering',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        status: 'online',
        location: 'San Francisco, CA',
        timezone: 'PST',
        joinDate: '2023-01-15',
        lastActive: new Date().toISOString(),
        tasksCount: 12,
        completedTasks: 10,
        productivity: 92,
        communicationPreference: 'chat',
        isManager: false,
        isTeamLead: true
    },
    {
        id: 'member-2',
        name: 'Sarah Kim',
        email: 'sarah.kim@controlai.com',
        avatar: '/avatars/sarah.jpg',
        role: 'Product Manager',
        department: 'Product',
        skills: ['Strategy', 'Analytics', 'Agile', 'Leadership'],
        status: 'busy',
        location: 'New York, NY',
        timezone: 'EST',
        joinDate: '2022-08-10',
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        tasksCount: 8,
        completedTasks: 7,
        productivity: 88,
        communicationPreference: 'video',
        isManager: true,
        isTeamLead: false
    },
    {
        id: 'member-3',
        name: 'David Rodriguez',
        email: 'david.rodriguez@controlai.com',
        avatar: '/avatars/david.jpg',
        role: 'ML Engineer',
        department: 'AI/ML',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'],
        status: 'online',
        location: 'Austin, TX',
        timezone: 'CST',
        joinDate: '2023-03-20',
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        tasksCount: 15,
        completedTasks: 12,
        productivity: 85,
        communicationPreference: 'email',
        isManager: false,
        isTeamLead: false
    },
    {
        id: 'member-4',
        name: 'Emma Wilson',
        email: 'emma.wilson@controlai.com',
        avatar: '/avatars/emma.jpg',
        role: 'UX Designer',
        department: 'Design',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        status: 'away',
        location: 'Remote',
        timezone: 'GMT',
        joinDate: '2023-05-12',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tasksCount: 6,
        completedTasks: 5,
        productivity: 78,
        communicationPreference: 'chat',
        isManager: false,
        isTeamLead: false
    }
]

// Mock hooks
const useTeamMembers = () => ({
    members: mockTeamMembers,
    loading: false,
    error: null,
    addMember: (member: Partial<TeamMember>) => console.log('Adding member:', member),
    updateMember: (id: string, updates: Partial<TeamMember>) => console.log('Updating member:', id, updates),
    removeMember: (id: string) => console.log('Removing member:', id)
})

export default function TeamsPage() {
    // Enhanced state management
    const [teamsState, setTeamsState] = useState<TeamsState>({
        activeView: 'grid',
        selectedMembers: [],
        filters: {
            roles: [],
            departments: [],
            skills: [],
            availability: 'all',
            location: []
        },
        searchQuery: '',
        showOffline: true,
        realTimeUpdates: true,
        communicationMode: 'chat'
    })

    // Data hooks
    const { members, loading, error, addMember, updateMember, removeMember } = useTeamMembers()

    // Computed values
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            // Search filter
            if (teamsState.searchQuery) {
                const query = teamsState.searchQuery.toLowerCase()
                if (!member.name.toLowerCase().includes(query) &&
                    !member.email.toLowerCase().includes(query) &&
                    !member.role.toLowerCase().includes(query) &&
                    !member.department.toLowerCase().includes(query) &&
                    !member.skills.some(skill => skill.toLowerCase().includes(query))) {
                    return false
                }
            }

            // Availability filter
            if (teamsState.filters.availability !== 'all' && member.status !== teamsState.filters.availability) {
                return false
            }

            // Show offline filter
            if (!teamsState.showOffline && member.status === 'offline') {
                return false
            }

            return true
        })
    }, [members, teamsState.searchQuery, teamsState.filters, teamsState.showOffline])

    // Team analytics
    const teamAnalytics = useMemo(() => {
        const totalMembers = filteredMembers.length
        const onlineMembers = filteredMembers.filter(m => m.status === 'online').length
        const avgProductivity = totalMembers > 0 ? filteredMembers.reduce((sum, m) => sum + m.productivity, 0) / totalMembers : 0
        const totalTasks = filteredMembers.reduce((sum, m) => sum + m.tasksCount, 0)
        const completedTasks = filteredMembers.reduce((sum, m) => sum + m.completedTasks, 0)
        const managers = filteredMembers.filter(m => m.isManager).length
        const teamLeads = filteredMembers.filter(m => m.isTeamLead).length

        return {
            totalMembers,
            onlineMembers,
            avgProductivity,
            totalTasks,
            completedTasks,
            managers,
            teamLeads,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        }
    }, [filteredMembers])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-green-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <TeamHeader
                analytics={teamAnalytics}
                searchQuery={teamsState.searchQuery}
                onSearchChange={(query) => setTeamsState(prev => ({ ...prev, searchQuery: query }))}
                showOffline={teamsState.showOffline}
                onShowOfflineChange={(show) => setTeamsState(prev => ({ ...prev, showOffline: show }))}
                realTimeUpdates={teamsState.realTimeUpdates}
                onRealTimeToggle={(enabled) => setTeamsState(prev => ({ ...prev, realTimeUpdates: enabled }))}
            />

            <TeamStats analytics={teamAnalytics} />

            <TeamNavigation
                activeView={teamsState.activeView}
                onViewChange={(view) => setTeamsState(prev => ({ ...prev, activeView: view }))}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    key={teamsState.activeView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {teamsState.activeView === 'grid' && (
                        <TeamMemberGrid
                            members={filteredMembers}
                            selectedMembers={teamsState.selectedMembers}
                            onMemberSelect={(memberId, selected) => {
                                setTeamsState(prev => ({
                                    ...prev,
                                    selectedMembers: selected
                                        ? [...prev.selectedMembers, memberId]
                                        : prev.selectedMembers.filter(id => id !== memberId)
                                }))
                            }}
                            onMemberAction={(memberId, action) => {
                                console.log(`Member action: ${action} on ${memberId}`)
                            }}
                        />
                    )}

                    {teamsState.activeView === 'list' && (
                        <TeamMemberList
                            members={filteredMembers}
                            selectedMembers={teamsState.selectedMembers}
                            onMemberSelect={(memberId, selected) => {
                                setTeamsState(prev => ({
                                    ...prev,
                                    selectedMembers: selected
                                        ? [...prev.selectedMembers, memberId]
                                        : prev.selectedMembers.filter(id => id !== memberId)
                                }))
                            }}
                            onMemberAction={(memberId, action) => {
                                console.log(`Member action: ${action} on ${memberId}`)
                            }}
                        />
                    )}

                    {teamsState.activeView === 'communication' && (
                        <TeamCommunication
                            members={filteredMembers}
                            communicationMode={teamsState.communicationMode}
                            onModeChange={(mode) => setTeamsState(prev => ({ ...prev, communicationMode: mode }))}
                        />
                    )}

                    {teamsState.activeView === 'analytics' && (
                        <TeamAnalytics
                            members={filteredMembers}
                            analytics={teamAnalytics}
                        />
                    )}
                </motion.div>
            </main>

            <TeamFooter />

            {/* Real-time updates indicator */}
            {teamsState.realTimeUpdates && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                            <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                                Team updates active
                            </span>
                            <button
                                onClick={() => setTeamsState(prev => ({ ...prev, realTimeUpdates: false }))}
                                className="ml-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}


