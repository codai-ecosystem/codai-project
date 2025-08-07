import React from 'react'
/**
 * TeamCommunication Component - Communication hub placeholder
 */
'use client'

import { TeamMember } from '../page'

interface TeamCommunicationProps {
    members: TeamMember[]
    communicationMode: 'chat' | 'video' | 'voice'
    onModeChange: (mode: 'chat' | 'video' | 'voice') => void
}

export function TeamCommunication({ members, communicationMode }: TeamCommunicationProps) {
    return (
        <div className="text-center py-12">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Team Communication Hub
            </div>
            <p className="text-gray-600 dark:text-gray-400">
                {communicationMode} communication with {members.length} team members will be implemented here.
            </p>
        </div>
    )
}

