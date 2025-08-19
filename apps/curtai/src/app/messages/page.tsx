'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle,
    Send,
    Search,
    Filter,
    MoreVertical,
    Phone,
    Video,
    Image as ImageIcon,
    Paperclip,
    Smile,
    User,
    Camera,
    Clock,
    Check,
    CheckCheck,
    ArrowLeft,
    Settings,
    Pin,
    Shield,
    X,
    Zap,
    Gift
} from 'lucide-react'
import Link from 'next/link'

// TypeScript interfaces for messaging system
interface Match {
    id: string
    name: string
    age: number
    avatar: string
    lastMessage: Message | null
    unreadCount: number
    isOnline: boolean
    lastSeen: string
    matchedAt: string
    compatibility: number
    isVerified: boolean
    isPinned: boolean
    isArchived: boolean
    location: string
    mutualFriends: number
}

interface Message {
    id: string
    senderId: string
    receiverId: string
    content: string
    type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'gif' | 'sticker'
    timestamp: string
    status: 'sending' | 'sent' | 'delivered' | 'read'
    replyTo?: string
    attachments?: MessageAttachment[]
    reactions?: MessageReaction[]
    isEdited?: boolean
    editedAt?: string
}

interface MessageAttachment {
    id: string
    type: 'image' | 'video' | 'audio' | 'file'
    url: string
    filename: string
    size: number
    thumbnail?: string
}

interface MessageReaction {
    emoji: string
    userId: string
    timestamp: string
}

interface ChatSettings {
    notifications: boolean
    readReceipts: boolean
    typingIndicators: boolean
    allowMedia: boolean
    autoDownload: boolean
    soundEnabled: boolean
}

export default function MessagesAndChat() {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showMatchFilters, setShowMatchFilters] = useState(false)
    const [showChatSettings, setShowChatSettings] = useState(false)
    const [isTyping] = useState(false)
    const [chatSettings, setChatSettings] = useState<ChatSettings>({
        notifications: true,
        readReceipts: true,
        typingIndicators: true,
        allowMedia: true,
        autoDownload: false,
        soundEnabled: true
    })

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageInputRef = useRef<HTMLInputElement>(null)

    // Initialize sample data
    useEffect(() => {
        const sampleMatches: Match[] = [
            {
                id: 'match-1',
                name: 'Emma Rodriguez',
                age: 28,
                avatar: '/api/placeholder/100/100',
                lastMessage: {
                    id: 'msg-1',
                    senderId: 'match-1',
                    receiverId: 'user-123',
                    content: 'Looking forward to our coffee date tomorrow! ☕',
                    type: 'text',
                    timestamp: '2025-08-09T11:30:00Z',
                    status: 'read'
                },
                unreadCount: 0,
                isOnline: true,
                lastSeen: '2025-08-09T11:30:00Z',
                matchedAt: '2025-08-07T10:00:00Z',
                compatibility: 94,
                isVerified: true,
                isPinned: true,
                isArchived: false,
                location: 'Bucharest, Romania',
                mutualFriends: 3
            },
            {
                id: 'match-2',
                name: 'Sofia Chen',
                age: 26,
                avatar: '/api/placeholder/100/100',
                lastMessage: {
                    id: 'msg-2',
                    senderId: 'match-2',
                    receiverId: 'user-123',
                    content: 'Thanks for the great conversation! 😊',
                    type: 'text',
                    timestamp: '2025-08-09T09:15:00Z',
                    status: 'delivered'
                },
                unreadCount: 2,
                isOnline: false,
                lastSeen: '2025-08-09T09:20:00Z',
                matchedAt: '2025-08-06T14:30:00Z',
                compatibility: 91,
                isVerified: true,
                isPinned: false,
                isArchived: false,
                location: 'Cluj-Napoca, Romania',
                mutualFriends: 1
            },
            {
                id: 'match-3',
                name: 'Ana Popescu',
                age: 30,
                avatar: '/api/placeholder/100/100',
                lastMessage: {
                    id: 'msg-3',
                    senderId: 'user-123',
                    receiverId: 'match-3',
                    content: 'That hiking trail looks amazing! When are you free?',
                    type: 'text',
                    timestamp: '2025-08-08T16:45:00Z',
                    status: 'read'
                },
                unreadCount: 0,
                isOnline: false,
                lastSeen: '2025-08-08T18:00:00Z',
                matchedAt: '2025-08-05T09:15:00Z',
                compatibility: 88,
                isVerified: true,
                isPinned: false,
                isArchived: false,
                location: 'Timișoara, Romania',
                mutualFriends: 5
            },
            {
                id: 'match-4',
                name: 'Maria Ionescu',
                age: 27,
                avatar: '/api/placeholder/100/100',
                lastMessage: {
                    id: 'msg-4',
                    senderId: 'match-4',
                    receiverId: 'user-123',
                    content: 'Hey! How was your weekend?',
                    type: 'text',
                    timestamp: '2025-08-08T10:30:00Z',
                    status: 'sent'
                },
                unreadCount: 1,
                isOnline: true,
                lastSeen: '2025-08-09T12:00:00Z',
                matchedAt: '2025-08-04T11:20:00Z',
                compatibility: 86,
                isVerified: false,
                isPinned: false,
                isArchived: false,
                location: 'Brașov, Romania',
                mutualFriends: 2
            }
        ]
        setMatches(sampleMatches)
        setSelectedMatch(sampleMatches[0])
    }, [])

    // Initialize sample messages for selected match
    useEffect(() => {
        if (selectedMatch) {
            const sampleMessages: Message[] = [
                {
                    id: 'msg-conv-1',
                    senderId: 'user-123',
                    receiverId: selectedMatch.id,
                    content: 'Hi Emma! Great to match with you. I love your photography work!',
                    type: 'text',
                    timestamp: '2025-08-07T10:30:00Z',
                    status: 'read'
                },
                {
                    id: 'msg-conv-2',
                    senderId: selectedMatch.id,
                    receiverId: 'user-123',
                    content: 'Thank you! I checked out your profile too. That hiking photo in the Carpathians is amazing! 📸',
                    type: 'text',
                    timestamp: '2025-08-07T10:45:00Z',
                    status: 'read'
                },
                {
                    id: 'msg-conv-3',
                    senderId: 'user-123',
                    receiverId: selectedMatch.id,
                    content: 'Would you like to grab coffee sometime? I know a great place downtown.',
                    type: 'text',
                    timestamp: '2025-08-07T11:00:00Z',
                    status: 'read'
                },
                {
                    id: 'msg-conv-4',
                    senderId: selectedMatch.id,
                    receiverId: 'user-123',
                    content: 'I\'d love that! How about tomorrow at 3 PM?',
                    type: 'text',
                    timestamp: '2025-08-07T11:15:00Z',
                    status: 'read'
                },
                {
                    id: 'msg-conv-5',
                    senderId: 'user-123',
                    receiverId: selectedMatch.id,
                    content: 'Perfect! See you there ☕',
                    type: 'text',
                    timestamp: '2025-08-07T11:20:00Z',
                    status: 'read'
                },
                {
                    id: 'msg-conv-6',
                    senderId: selectedMatch.id,
                    receiverId: 'user-123',
                    content: 'Looking forward to our coffee date tomorrow! ☕',
                    type: 'text',
                    timestamp: '2025-08-09T11:30:00Z',
                    status: 'read'
                }
            ]
            setMessages(sampleMessages)
        }
    }, [selectedMatch])

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedMatch) return

        const message: Message = {
            id: `msg-${Date.now()}`,
            senderId: 'user-123',
            receiverId: selectedMatch.id,
            content: newMessage.trim(),
            type: 'text',
            timestamp: new Date().toISOString(),
            status: 'sending'
        }

        setMessages(prev => [...prev, message])
        setNewMessage('')

        // Simulate message delivery
        setTimeout(() => {
            setMessages(prev => prev.map(msg =>
                msg.id === message.id ? { ...msg, status: 'sent' } : msg
            ))
        }, 500)

        setTimeout(() => {
            setMessages(prev => prev.map(msg =>
                msg.id === message.id ? { ...msg, status: 'delivered' } : msg
            ))
        }, 1000)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const getMessageStatus = (message: Message) => {
        switch (message.status) {
            case 'sent':
                return <Check className="w-3 h-3 text-gray-400" />
            case 'delivered':
                return <CheckCheck className="w-3 h-3 text-gray-400" />
            case 'read':
                return <CheckCheck className="w-3 h-3 text-blue-500" />
            default:
                return <Clock className="w-3 h-3 text-gray-300" />
        }
    }

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        } else if (diffInHours < 168) { // 1 week
            return date.toLocaleDateString('en-US', { weekday: 'short' })
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        }
    }

    const getLastMessageTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

        if (diffInMinutes < 1) return 'now'
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
        return `${Math.floor(diffInMinutes / 1440)}d`
    }

    const filteredMatches = matches.filter(match =>
        match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
            {/* Enhanced Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-6 shadow-xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Link href="/curtai" className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Messages & Chat</h1>
                                <p className="text-pink-100">Connect with your matches</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-pink-100">Active Matches</div>
                                <div className="text-xl font-bold">{matches.filter(m => !m.isArchived).length}</div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowMatchFilters(!showMatchFilters)}
                                    className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowChatSettings(!showChatSettings)}
                                    className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
                    {/* Matches Sidebar */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* Search and Filters */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search matches..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium">
                                    All
                                </button>
                                <button className="flex-1 bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                    Unread
                                </button>
                                <button className="flex-1 bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                    Online
                                </button>
                            </div>
                        </div>

                        {/* Matches List */}
                        <div className="overflow-y-auto h-full">
                            {filteredMatches.map((match) => (
                                <motion.div
                                    key={match.id}
                                    onClick={() => setSelectedMatch(match)}
                                    whileHover={{ backgroundColor: '#fef2f2' }}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${selectedMatch?.id === match.id ? 'bg-pink-50 border-l-4 border-l-pink-500' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                            {match.isOnline && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                            {match.isPinned && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                                    <Pin className="w-2 h-2 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">{match.name}</h3>
                                                    {match.isVerified && (
                                                        <Shield className="w-3 h-3 text-blue-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <span className="text-xs text-gray-500">
                                                        {match.lastMessage ? getLastMessageTime(match.lastMessage.timestamp) : ''}
                                                    </span>
                                                    {match.unreadCount > 0 && (
                                                        <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            {match.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate mt-1">
                                                {match.lastMessage?.content || 'No messages yet'}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-gray-400">{match.compatibility}% match</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-400">{match.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
                        {selectedMatch ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-red-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                {selectedMatch.isOnline && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h2 className="text-lg font-semibold text-gray-900">{selectedMatch.name}</h2>
                                                    {selectedMatch.isVerified && (
                                                        <Shield className="w-4 h-4 text-blue-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {selectedMatch.isOnline ? 'Online now' : `Last seen ${getLastMessageTime(selectedMatch.lastSeen)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Phone className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Video className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                                <MoreVertical className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100% - 180px)' }}>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${message.senderId === 'user-123' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] ${message.senderId === 'user-123' ? 'order-2' : 'order-1'}`}>
                                                <div
                                                    className={`px-4 py-2 rounded-2xl ${message.senderId === 'user-123'
                                                            ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                </div>
                                                <div className={`flex items-center space-x-1 mt-1 ${message.senderId === 'user-123' ? 'justify-end' : 'justify-start'
                                                    }`}>
                                                    <span className="text-xs text-gray-500">
                                                        {formatMessageTime(message.timestamp)}
                                                    </span>
                                                    {message.senderId === 'user-123' && (
                                                        <div className="flex items-center">
                                                            {getMessageStatus(message)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-6 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex space-x-2">
                                            <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                                                <Paperclip className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                                                <ImageIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                                                <Camera className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                ref={messageInputRef}
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type a message..."
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Smile className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                        <motion.button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-3 rounded-xl transition-all duration-200 ${newMessage.trim()
                                                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <Send className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* No Chat Selected */
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                                    <p className="text-gray-600">Choose a match to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Match Filters Modal */}
            <AnimatePresence>
                {showMatchFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowMatchFilters(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Filter Matches</h2>
                                <button
                                    onClick={() => setShowMatchFilters(false)}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Unread', 'Online', 'Verified', 'Recent'].map((filter) => (
                                        <button
                                            key={filter}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-pink-100 hover:text-pink-600 transition-colors"
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => setShowMatchFilters(false)}
                                        className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-red-600 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Settings Modal */}
            <AnimatePresence>
                {showChatSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowChatSettings(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Chat Settings</h2>
                                <button
                                    onClick={() => setShowChatSettings(false)}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(chatSettings).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-gray-700 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={(e) => setChatSettings(prev => ({
                                                    ...prev,
                                                    [key]: e.target.checked
                                                }))}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modern Footer */}
            <footer className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Shield className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Secure Messaging</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                End-to-end encryption keeps your conversations private
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Learn More
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Zap className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Real-time Chat</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Instant messaging with typing indicators and read receipts
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Try Premium
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Gift className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Virtual Gifts</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Send virtual gifts and stickers to express yourself
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Send Gift
                            </button>
                        </motion.div>
                    </div>

                    <div className="text-center mt-8 pt-8 border-t border-white/20">
                        <p className="text-pink-100">
                            © 2025 CurtAI - AI-Powered Matchmaking Platform. Part of the CODAI Ecosystem.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
