'use client'

import React from 'react'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    Paperclip,
    Bot,
    X,
    Bold,
    Italic,
    Underline,
    Link,
    Image,
    Smile,
    Clock,
    Users,
    Tag
} from 'lucide-react'

interface EmailComposerProps {
    isOpen: boolean
    onClose: () => void
    replyTo?: {
        subject: string
        to: string
        from: string
    }
}

export default function EmailComposer({ isOpen, onClose, replyTo }: EmailComposerProps) {
    const [to, setTo] = useState(replyTo?.from || '')
    const [cc, setCc] = useState('')
    const [bcc, setBcc] = useState('')
    const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '')
    const [message, setMessage] = useState('')
    const [showCc, setShowCc] = useState(false)
    const [showBcc, setShowBcc] = useState(false)
    const [showAiSuggestions, setShowAiSuggestions] = useState(false)
    const [attachments, setAttachments] = useState<File[]>([])
    const [isScheduled, setIsScheduled] = useState(false)
    const [priority, setPriority] = useState('normal')

    const aiSuggestions = [
        "Thank you for reaching out. I'll review this and get back to you shortly.",
        "I appreciate your interest. Let me schedule a call to discuss this further.",
        "Thanks for the update. I'll share this with the relevant team members.",
        "Could you provide more details about your requirements?",
        "I'd be happy to help with this. Let me know your timeline."
    ]

    const handleSend = () => {
        // Here you would integrate with your email API
        console.log({
            to,
            cc,
            bcc,
            subject,
            message,
            priority,
            attachments,
            isScheduled
        })
        onClose()
    }

    const insertAiSuggestion = (suggestion: string) => {
        setMessage(prev => prev + (prev ? '\n\n' : '') + suggestion)
        setShowAiSuggestions(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {replyTo ? 'Reply' : 'New Message'}
                                </h2>
                                {priority !== 'normal' && (
                                    <span className={`px-2 py-1 text-xs rounded-full ${priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {priority} priority
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                                    className={`p-2 rounded-lg transition-colors ${showAiSuggestions ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'
                                        }`}
                                    title="AI Suggestions"
                                >
                                    <Bot className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-1 min-h-0">
                            {/* Main Composer */}
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                {/* Recipients */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-medium text-gray-700 w-12">To</label>
                                        <input
                                            type="email"
                                            value={to}
                                            onChange={(e) => setTo(e.target.value)}
                                            placeholder="Enter recipient email..."
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            multiple
                                        />
                                        <div className="flex gap-2">
                                            {!showCc && (
                                                <button
                                                    onClick={() => setShowCc(true)}
                                                    className="text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    Cc
                                                </button>
                                            )}
                                            {!showBcc && (
                                                <button
                                                    onClick={() => setShowBcc(true)}
                                                    className="text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    Bcc
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {showCc && (
                                        <motion.div
                                            className="flex items-center gap-3"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="text-sm font-medium text-gray-700 w-12">Cc</label>
                                            <input
                                                type="email"
                                                value={cc}
                                                onChange={(e) => setCc(e.target.value)}
                                                placeholder="Carbon copy recipients..."
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => setShowCc(false)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {showBcc && (
                                        <motion.div
                                            className="flex items-center gap-3"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="text-sm font-medium text-gray-700 w-12">Bcc</label>
                                            <input
                                                type="email"
                                                value={bcc}
                                                onChange={(e) => setBcc(e.target.value)}
                                                placeholder="Blind carbon copy recipients..."
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => setShowBcc(false)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Subject */}
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-gray-700 w-12">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Enter subject..."
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Formatting Toolbar */}
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-gray-200 rounded text-gray-600">
                                            <Bold className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 rounded text-gray-600">
                                            <Italic className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 rounded text-gray-600">
                                            <Underline className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="w-px h-6 bg-gray-300" />
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-gray-200 rounded text-gray-600">
                                            <Link className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 rounded text-gray-600">
                                            <Image className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 rounded text-gray-600">
                                            <Smile className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={12}
                                        placeholder="Compose your message..."
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                {/* Attachments */}
                                {attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
                                        {attachments.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Paperclip className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{file.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        ({(file.size / 1024).toFixed(1)} KB)
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* AI Suggestions Sidebar */}
                            <AnimatePresence>
                                {showAiSuggestions && (
                                    <motion.div
                                        className="w-80 border-l border-gray-200 p-6 bg-gray-50"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <Bot className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-medium text-gray-900">AI Suggestions</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {aiSuggestions.map((suggestion, index) => (
                                                <motion.button
                                                    key={index}
                                                    className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm"
                                                    onClick={() => insertAiSuggestion(suggestion)}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    {suggestion}
                                                </motion.button>
                                            ))}
                                        </div>
                                        <div className="mt-6">
                                            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                                            <div className="space-y-2">
                                                <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-sm flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-green-600" />
                                                    Schedule for later
                                                </button>
                                                <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-sm flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-purple-600" />
                                                    Add from contacts
                                                </button>
                                                <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-sm flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-orange-600" />
                                                    Use template
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    id="file-attachment"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="file-attachment"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Paperclip className="h-4 w-4" />
                                    Attach
                                </label>

                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High Priority</option>
                                </select>

                                <button
                                    onClick={() => setIsScheduled(!isScheduled)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isScheduled ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Clock className="h-4 w-4" />
                                    Schedule
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    onClick={handleSend}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!to || !subject || !message}
                                >
                                    <Send className="h-4 w-4" />
                                    {isScheduled ? 'Schedule' : 'Send'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

