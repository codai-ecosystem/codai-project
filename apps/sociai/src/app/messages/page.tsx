'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, Send, Search, Phone, Video, MoreHorizontal,
  Smile, Paperclip, Image, Mic, User, Bot, Check, CheckCheck,
  Star, Archive, Trash2, Filter, Settings, Plus, Users,
  Circle, Clock, Volume2, VolumeX, Camera, FileText,
  Zap, Sparkles, Heart, ThumbsUp, Reply, Forward,
  Info, Bell, BellOff, Pin, Unpin, Eye, EyeOff,
  Download, Copy, Edit3, Quote, Shield, Flag,
  X, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice' | 'ai-suggestion';
  status: 'sent' | 'delivered' | 'read';
  isAI?: boolean;
  reactions?: Array<{ emoji: string; count: number; users: string[] }>;
  replyTo?: string;
}

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
    isVerified?: boolean;
  }>;
  lastMessage: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isGroup: boolean;
  groupName?: string;
  type: 'direct' | 'group' | 'ai-assistant';
}

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations: Conversation[] = [
    {
      id: '1',
      participants: [
        {
          id: 'ai-assistant',
          name: 'SociAI Assistant',
          username: '@sociai_bot',
          isOnline: true,
          isVerified: true
        }
      ],
      lastMessage: {
        id: 'msg1',
        senderId: 'ai-assistant',
        senderName: 'SociAI Assistant',
        content: 'I can help you create engaging content for your next post! What topic would you like to explore?',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        status: 'read',
        isAI: true
      },
      unreadCount: 1,
      isPinned: true,
      isMuted: false,
      isGroup: false,
      type: 'ai-assistant'
    },
    {
      id: '2',
      participants: [
        {
          id: 'user2',
          name: 'Sarah Chen',
          username: '@sarahchen_ai',
          isOnline: true,
          isVerified: true
        }
      ],
      lastMessage: {
        id: 'msg2',
        senderId: 'user2',
        senderName: 'Sarah Chen',
        content: 'Thanks for the collaboration tips! The AI insights were really helpful 🚀',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
        status: 'read'
      },
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isGroup: false,
      type: 'direct'
    },
    {
      id: '3',
      participants: [
        {
          id: 'user3',
          name: 'Marcus Johnson',
          username: '@marcus_tech',
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000),
          isVerified: false
        }
      ],
      lastMessage: {
        id: 'msg3',
        senderId: 'current-user',
        senderName: 'You',
        content: 'Looking forward to our video call tomorrow!',
        timestamp: new Date(Date.now() - 7200000),
        type: 'text',
        status: 'delivered'
      },
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isGroup: false,
      type: 'direct'
    },
    {
      id: '4',
      participants: [
        {
          id: 'user4',
          name: 'AI Content Creators',
          username: '@ai_creators',
          isOnline: true,
          isVerified: true
        }
      ],
      lastMessage: {
        id: 'msg4',
        senderId: 'user4',
        senderName: 'Emily Zhang',
        content: 'The new AI features are amazing! Has anyone tried the automated scheduling?',
        timestamp: new Date(Date.now() - 14400000),
        type: 'text',
        status: 'read'
      },
      unreadCount: 3,
      isPinned: false,
      isMuted: false,
      isGroup: true,
      groupName: 'AI Content Creators',
      type: 'group'
    }
  ];

  const messages: Message[] = [
    {
      id: 'msg1',
      senderId: 'ai-assistant',
      senderName: 'SociAI Assistant',
      content: 'Hello! I\'m your AI assistant here to help you create amazing content and engage with your audience. How can I assist you today?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'read',
      isAI: true
    },
    {
      id: 'msg2',
      senderId: 'current-user',
      senderName: 'You',
      content: 'I need help creating a post about AI trends for next week.',
      timestamp: new Date(Date.now() - 3300000),
      type: 'text',
      status: 'read'
    },
    {
      id: 'msg3',
      senderId: 'ai-assistant',
      senderName: 'SociAI Assistant',
      content: 'Great topic! Here are some trending AI topics for next week:\n\n🤖 Generative AI in creative industries\n🧠 AI-powered social media analytics\n⚡ Real-time AI content optimization\n🎯 Personalized AI recommendations\n\nWhich one interests you most?',
      timestamp: new Date(Date.now() - 3000000),
      type: 'ai-suggestion',
      status: 'read',
      isAI: true,
      reactions: [
        { emoji: '👍', count: 1, users: ['current-user'] },
        { emoji: '🚀', count: 1, users: ['current-user'] }
      ]
    },
    {
      id: 'msg4',
      senderId: 'current-user',
      senderName: 'You',
      content: 'The AI-powered social media analytics sounds perfect! Can you help me create a post outline?',
      timestamp: new Date(Date.now() - 2700000),
      type: 'text',
      status: 'read'
    },
    {
      id: 'msg5',
      senderId: 'ai-assistant',
      senderName: 'SociAI Assistant',
      content: 'Perfect choice! Here\'s a comprehensive post outline for AI-powered social media analytics:\n\n📊 **Hook**: "Your social media strategy is about to get a major upgrade"\n\n🎯 **Main Points**:\n• Real-time engagement prediction\n• Automated content optimization\n• Audience behavior insights\n• ROI tracking and analysis\n\n💡 **Call to Action**: "What AI analytics feature would transform your strategy?"\n\nWould you like me to expand on any section?',
      timestamp: new Date(Date.now() - 2400000),
      type: 'ai-suggestion',
      status: 'read',
      isAI: true
    },
    {
      id: 'msg6',
      senderId: 'current-user',
      senderName: 'You',
      content: 'This is fantastic! Can you also suggest some engaging visuals for this post?',
      timestamp: new Date(Date.now() - 2100000),
      type: 'text',
      status: 'read'
    },
    {
      id: 'msg7',
      senderId: 'ai-assistant',
      senderName: 'SociAI Assistant',
      content: 'I can help you create engaging content for your next post! What topic would you like to explore?',
      timestamp: new Date(Date.now() - 300000),
      type: 'text',
      status: 'delivered',
      isAI: true
    }
  ];

  const aiSuggestions = [
    'Generate post ideas for this week',
    'Analyze my recent content performance',
    'Create a content calendar',
    'Suggest trending hashtags',
    'Help with engagement strategies'
  ];

  const emojis = ['😀', '😂', '❤️', '👍', '🔥', '💯', '🚀', '💡', '🎯', '✨'];

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || conv.groupName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Message sending logic here
      setMessageInput('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <MessageCircle className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Messages</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-white/80">
                <div className="text-center">
                  <div className="text-lg font-semibold">{conversations.length}</div>
                  <div className="text-xs">Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                  </div>
                  <div className="text-xs">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {conversations.filter(conv => conv.participants.some(p => p.isOnline)).length}
                  </div>
                  <div className="text-xs">Online</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    <Filter className="h-3 w-3" />
                    <span>All</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    <Bot className="h-3 w-3" />
                    <span>AI</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    <Users className="h-3 w-3" />
                    <span>Groups</span>
                  </button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    onClick={() => setActiveConversation(conversation.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      activeConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          {conversation.type === 'ai-assistant' ? (
                            <Bot className="h-6 w-6 text-white" />
                          ) : conversation.isGroup ? (
                            <Users className="h-6 w-6 text-white" />
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        {conversation.participants[0]?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.groupName || conversation.participants[0]?.name}
                            </h3>
                            {conversation.participants[0]?.isVerified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="h-2 w-2 text-white" />
                              </div>
                            )}
                            {conversation.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                            {conversation.isMuted && <VolumeX className="h-3 w-3 text-gray-400" />}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.senderId === 'current-user' && 'You: '}
                          {conversation.lastMessage.content}
                        </p>
                        {conversation.type === 'ai-assistant' && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Sparkles className="h-3 w-3 text-purple-500" />
                            <span className="text-xs text-purple-600">AI Assistant</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <span>SociAI Assistant</span>
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="h-2 w-2 text-white" />
                            </div>
                          </h3>
                          <p className="text-sm text-green-600 flex items-center space-x-1">
                            <Circle className="h-2 w-2 fill-current" />
                            <span>Online • AI Assistant</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Phone className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Video className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowChatSettings(!showChatSettings)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${message.senderId === 'current-user' ? 'order-1' : 'order-2'}`}>
                          {message.senderId !== 'current-user' && (
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                {message.isAI ? <Bot className="h-3 w-3 text-white" /> : <User className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-xs text-gray-600">{message.senderName}</span>
                            </div>
                          )}
                          <div className={`rounded-2xl px-4 py-2 ${
                            message.senderId === 'current-user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : message.isAI
                              ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-gray-900 border border-purple-200'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {message.type === 'ai-suggestion' ? (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm font-medium text-purple-600">AI Suggestion</span>
                                </div>
                                <div className="whitespace-pre-wrap">{message.content}</div>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            )}
                          </div>
                          
                          {/* Message Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex items-center space-x-1 mt-1">
                              {message.reactions.map((reaction, index) => (
                                <div key={index} className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 border border-gray-200">
                                  <span className="text-sm">{reaction.emoji}</span>
                                  <span className="text-xs text-gray-600">{reaction.count}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Message Status */}
                          <div className={`flex items-center justify-end space-x-1 mt-1 ${
                            message.senderId === 'current-user' ? 'block' : 'hidden'
                          }`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.status === 'sent' && <Check className="h-3 w-3 text-gray-400" />}
                            {message.status === 'delivered' && <CheckCheck className="h-3 w-3 text-gray-400" />}
                            {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl px-4 py-2">
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

                  {/* AI Suggestions */}
                  <div className="p-3 border-t border-gray-100 bg-purple-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">Quick AI Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setMessageInput(suggestion)}
                          className="px-3 py-1 bg-white border border-purple-200 rounded-full text-sm text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end space-x-3">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message..."
                            className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Smile className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Paperclip className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Image className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Mic className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Emoji Picker */}
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                            >
                              <div className="grid grid-cols-5 gap-2">
                                {emojis.map((emoji, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleEmojiSelect(emoji)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                // No Conversation Selected
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversation selected</h3>
                    <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Bot className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
              <p className="text-white/80">Get intelligent help with content creation, analytics, and social strategy.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Users className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Group Messaging</h3>
              <p className="text-white/80">Collaborate with teams and communities in organized group conversations.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Zap className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Features</h3>
              <p className="text-white/80">Advanced messaging with AI suggestions, smart replies, and content optimization.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
