import React from 'react'
/**
 * TeamMemberList Component - List view placeholder
 */
'use client'

import { TeamMember } from '../page'

interface TeamMemberListProps {
    members: TeamMember[]
    selectedMembers: string[]
    onMemberSelect: (memberId: string, selected: boolean) => void
    onMemberAction: (memberId: string, action: string) => void
}

export function TeamMemberList({ members }: TeamMemberListProps) {
    return (
        <div className="text-center py-12">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Team Member List View
            </div>
            <p className="text-gray-600 dark:text-gray-400">
                Detailed list view with {members.length} team members will be implemented here.
            </p>
        </div>
    )
}

