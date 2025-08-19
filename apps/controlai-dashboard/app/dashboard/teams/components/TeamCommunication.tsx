import React from 'react'
/**
 * TeamCommunication Component - Comprehensive team communication hub
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare, Video, Phone, Send, Smile, Paperclip, Settings,
    Search, Filter, MoreHorizontal, UserPlus, Bell, Calendar,
    Star, Reply, Share, Download, Mic, MicOff, Camera, CameraOff,
    Volume2, VolumeX, Monitor, Users, Clock, Circle
} from 'lucide-react'
import { TeamMember } from '../page'

interface Message {
    id: string
    senderId: string
    senderName: string
    content: string
    timestamp: string
    type: 'text' | 'file' | 'image' | 'system'
    reactions?: { emoji: string; users: string[] }[]
    replyTo?: string
}

interface ChatChannel {
    id: string
    name: string
    type: 'general' | 'project' | 'direct' | 'announcement'
    members: string[]
    unreadCount: number
    lastMessage?: Message
}

interface TeamCommunicationProps {
    members: TeamMember[]
    communicationMode: 'chat' | 'video' | 'voice'
    onModeChange: (mode: 'chat' | 'video' | 'voice') => void
}

export function TeamCommunication({ members, communicationMode, onModeChange }: TeamCommunicationProps) {
    const [selectedChannel, setSelectedChannel] = useState('general')
    const [message, setMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [videoCall, setVideoCall] = useState({ active: false, participants: [] as string[] })
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Mock data
    const channels: ChatChannel[] = [
        {
            id: 'general',
            name: 'General',
            type: 'general',
            members: members.map(m => m.id),
            unreadCount: 3,
            lastMessage: {
                id: '1',
                senderId: 'member-1',
                senderName: 'Alex Chen',
                content: 'Hey team! Great progress on the latest sprint 🚀',
                timestamp: new Date().toISOString(),
                type: 'text'
            }
        },
        {
            id: 'project-alpha',
            name: 'Project Alpha',
            type: 'project',
            members: ['member-1', 'member-2', 'member-3'],
            unreadCount: 1,
            lastMessage: {
                id: '2',
                senderId: 'member-2',
                senderName: 'Sarah Kim',
                content: 'Updated the deployment pipeline',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                type: 'text'
            }
        },
        {
            id: 'announcements',
            name: 'Announcements',
            type: 'announcement',
            members: members.map(m => m.id),
            unreadCount: 0,
            lastMessage: {
                id: '3',
                senderId: 'member-2',
                senderName: 'Sarah Kim',
                content: 'Team meeting tomorrow at 10 AM',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                type: 'text'
            }
        }
    ]

    const messages: Message[] = [
        {
            id: '1',
            senderId: 'member-2',
            senderName: 'Sarah Kim',
            content: 'Good morning team! Ready for our sprint review?',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            type: 'text'
        },
        {
            id: '2',
            senderId: 'member-1',
            senderName: 'Alex Chen',
            content: 'Yes! I\'ve prepared the demo for the new features',
            timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
            type: 'text',
            reactions: [{ emoji: '👍', users: ['member-2', 'member-3'] }]
        },
        {
            id: '3',
            senderId: 'member-3',
            senderName: 'David Rodriguez',
            content: 'The ML model performance has improved by 15%',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            type: 'text',
            reactions: [{ emoji: '🎉', users: ['member-1', 'member-2'] }]
        },
        {
            id: '4',
            senderId: 'member-4',
            senderName: 'Emma Wilson',
            content: 'I\'ll share the updated designs after the meeting',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            type: 'text'
        }
    ]

    const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🚀', '💯']

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = () => {
        if (message.trim()) {
            // Handle message sending logic here
            console.log('Sending message:', message)
            setMessage('')
        }
    }

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'general': return '💬'
            case 'project': return '📋'
            case 'direct': return '👤'
            case 'announcement': return '📢'
            default: return '💬'
        }
    }

    const onlineMembers = members.filter(m => m.status === 'online')

    return (
        <div className="flex h-[calc(100vh-200px)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
                {/* Communication Mode Selector */}
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-2 mb-4">
                        <button
                            onClick={() => onModeChange('chat')}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${communicationMode === 'chat'
                                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat
                        </button>
                        <button
                            onClick={() => onModeChange('video')}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${communicationMode === 'video'
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Video
                        </button>
                        <button
                            onClick={() => onModeChange('voice')}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${communicationMode === 'voice'
                                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Voice
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search channels or members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Channels List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Channels</h3>
                        <div className="space-y-1">
                            {channels.map((channel) => (
                                <motion.button
                                    key={channel.id}
                                    onClick={() => setSelectedChannel(channel.id)}
                                    whileHover={{ x: 2 }}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${selectedChannel === channel.id
                                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{getChannelIcon(channel.type)}</span>
                                        <div>
                                            <div className="font-medium">{channel.name}</div>
                                            {channel.lastMessage && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-32">
                                                    {channel.lastMessage.content}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {channel.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {channel.unreadCount}
                                        </span>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Online Members */}
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Online ({onlineMembers.length})
                        </h3>
                        <div className="space-y-2">
                            {onlineMembers.map((member) => (
                                <div key={member.id} className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                            {member.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {member.role}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-xl">
                                {getChannelIcon(channels.find(c => c.id === selectedChannel)?.type || 'general')}
                            </span>
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    {channels.find(c => c.id === selectedChannel)?.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {channels.find(c => c.id === selectedChannel)?.members.length} members
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {communicationMode === 'video' && (
                                <button
                                    onClick={() => setVideoCall({ active: !videoCall.active, participants: [] })}
                                    className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <Video className="w-4 h-4 mr-2" />
                                    Start Call
                                </button>
                            )}
                            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg">
                                <Bell className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start space-x-3"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-medium text-sm">
                                    {msg.senderName.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {msg.senderName}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 max-w-lg">
                                    <p className="text-gray-900 dark:text-white">{msg.content}</p>

                                    {msg.reactions && msg.reactions.length > 0 && (
                                        <div className="flex items-center space-x-1 mt-2">
                                            {msg.reactions.map((reaction, index) => (
                                                <button
                                                    key={index}
                                                    className="flex items-center space-x-1 px-2 py-1 bg-white dark:bg-gray-600 rounded-full text-xs hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                                                >
                                                    <span>{reaction.emoji}</span>
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        {reaction.users.length}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-24"
                            />

                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <Smile className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <Paperclip className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Emoji Picker */}
                    <AnimatePresence>
                        {showEmojiPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-20 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3"
                            >
                                <div className="grid grid-cols-5 gap-2">
                                    {emojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setMessage(prev => prev + emoji)
                                                setShowEmojiPicker(false)
                                            }}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

