import React from 'react'
/**
 * TeamMemberGrid Component - Grid view of team members
 */
'use client'

import { motion } from 'framer-motion'
import { TeamMember } from '../page'
import { TeamMemberCard } from './TeamMemberCard'

interface TeamMemberGridProps {
    members: TeamMember[]
    selectedMembers: string[]
    onMemberSelect: (memberId: string, selected: boolean) => void
    onMemberAction: (memberId: string, action: string) => void
}

export function TeamMemberGrid({
    members,
    selectedMembers,
    onMemberSelect,
    onMemberAction
}: TeamMemberGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member, index) => (
                <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <TeamMemberCard
                        member={member}
                        selected={selectedMembers.includes(member.id)}
                        onSelect={(selected) => onMemberSelect(member.id, selected)}
                        onAction={(action) => onMemberAction(member.id, action)}
                    />
                </motion.div>
            ))}
        </div>
    )
}

