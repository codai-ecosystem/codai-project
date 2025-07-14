'use client';

import React, { useState, useEffect } from 'react';
import {
    Mail, Send, Search, Settings, User, Bell, Archive, Trash2, Star, Plus,
    BarChart3, Users, Calendar, Filter, SortAsc, RefreshCw, Paperclip,
    Reply, ReplyAll, Forward, MoreHorizontal, Clock, AlertCircle
} from 'lucide-react';

interface Email {
    id: string;
    sender: string;
    subject: string;
    preview: string;
    timestamp: Date;
    unread: boolean;
    starred: boolean;
    hasAttachment: boolean;
    priority: 'high' | 'normal' | 'low';
    category: 'primary' | 'work' | 'personal' | 'marketing';
}

export default function EmailDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedTab, setSelectedTab] = useState('inbox');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Mock email data
    const [emails, setEmails] = useState<Email[]>([
        {
            id: '1',
            sender: 'Adrian Popescu <adrian@techstart.ro>',
            subject: 'Propunere de colaborare - Proiect AI',
            preview: 'Bună ziua! Am citit despre platforma CODAI și sunt foarte interesat de o posibilă colaborare...',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            unread: true,
            starred: false,
            hasAttachment: true,
            priority: 'high',
            category: 'work'
        },
        {
            id: '2',
            sender: 'Maria Ionescu <maria@designcorp.ro>',
            subject: 'Design sistem pentru aplicația ConversAI',
            preview: 'Salut! Attached găsești mockup-urile pentru interfața de email. Te rog să arunci o privire...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            unread: true,
            starred: true,
            hasAttachment: true,
            priority: 'normal',
            category: 'work'
        },
        {
            id: '3',
            sender: 'CODAI Newsletter <newsletter@codai.ro>',
            subject: 'Actualizări săptămânale - Platforme noi în ecosistem',
            preview: 'Descoperă noile funcționalități adăugate săptămâna aceasta în STOCAI, PREZENTAI și ROMAI...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
            unread: false,
            starred: false,
            hasAttachment: false,
            priority: 'normal',
            category: 'marketing'
        },
        {
            id: '4',
            sender: 'GitHub <noreply@github.com>',
            subject: '[CODAI] New pull request merged in codai-project',
            preview: 'A new pull request has been merged into the main branch. Check out the latest changes...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            unread: false,
            starred: false,
            hasAttachment: false,
            priority: 'low',
            category: 'work'
        },
        {
            id: '5',
            sender: 'Familie Andrei <andrei.pop@gmail.com>',
            subject: 'Planuri pentru weekend - Ieșire la munte',
            preview: 'Salut! Am găsit o cabană foarte frumoasă în Brașov. Ce zici să mergem săptămâna viitoare?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            unread: false,
            starred: true,
            hasAttachment: false,
            priority: 'normal',
            category: 'personal'
        }
    ]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const unreadCount = emails.filter(email => email.unread).length;
    const starredCount = emails.filter(email => email.starred).length;

    const filteredEmails = emails.filter(email => {
        const matchesSearch = email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.preview.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterCategory === 'all' || email.category === filterCategory;

        return matchesSearch && matchesFilter;
    });

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}d`;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'low': return 'text-gray-400';
            default: return 'text-gray-600';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'work': return 'bg-blue-100 text-blue-800';
            case 'personal': return 'bg-green-100 text-green-800';
            case 'marketing': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-8 w-8 text-blue-600" />
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ConversAI
                                </h1>
                            </div>
                            <span className="text-sm text-gray-500">Dashboard Email</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                {currentTime.toLocaleTimeString('ro-RO')}
                            </div>
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                                <Bell className="h-5 w-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Settings className="h-5 w-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <User className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 mb-6 transition-colors">
                                <Plus className="h-4 w-4" />
                                <span>Compune Email</span>
                            </button>

                            <nav className="space-y-1">
                                <button
                                    onClick={() => setSelectedTab('inbox')}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${selectedTab === 'inbox' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <Mail className="h-4 w-4" />
                                    <span>Primite</span>
                                    {unreadCount > 0 && (
                                        <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setSelectedTab('sent')}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${selectedTab === 'sent' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <Send className="h-4 w-4" />
                                    <span>Trimise</span>
                                </button>

                                <button
                                    onClick={() => setSelectedTab('starred')}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${selectedTab === 'starred' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <Star className="h-4 w-4" />
                                    <span>Marcate</span>
                                    {starredCount > 0 && (
                                        <span className="ml-auto text-xs text-gray-500">{starredCount}</span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setSelectedTab('archive')}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${selectedTab === 'archive' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <Archive className="h-4 w-4" />
                                    <span>Arhivate</span>
                                </button>

                                <button
                                    onClick={() => setSelectedTab('trash')}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${selectedTab === 'trash' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Șters</span>
                                </button>
                            </nav>

                            {/* Quick Stats */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Statistici Rapide</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Neprocesate</span>
                                        <span className="font-medium text-orange-600">{unreadCount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Trimise azi</span>
                                        <span className="font-medium text-green-600">8</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Răspuns mediu</span>
                                        <span className="font-medium text-blue-600">2.4h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-6">
                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                            <div className="flex space-x-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Caută în emailuri..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Toate</option>
                                    <option value="work">Muncă</option>
                                    <option value="personal">Personal</option>
                                    <option value="marketing">Marketing</option>
                                </select>
                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <Filter className="h-4 w-4 text-gray-600" />
                                </button>
                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <RefreshCw className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Email List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-gray-900">
                                        {selectedTab === 'inbox' ? 'Primite' :
                                            selectedTab === 'sent' ? 'Trimise' :
                                                selectedTab === 'starred' ? 'Marcate' :
                                                    selectedTab === 'archive' ? 'Arhivate' : 'Șters'}
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {filteredEmails.length} emailuri
                                    </span>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {filteredEmails.map((email) => (
                                    <div
                                        key={email.id}
                                        onClick={() => setSelectedEmail(email)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${email.unread ? 'bg-blue-50/30' : ''
                                            } ${selectedEmail?.id === email.id ? 'bg-blue-100' : ''}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${email.unread ? 'bg-blue-600' : 'bg-transparent'}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-sm font-medium truncate ${email.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {email.sender.split('<')[0].trim()}
                                                        </span>
                                                        {email.hasAttachment && (
                                                            <Paperclip className="h-3 w-3 text-gray-400" />
                                                        )}
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(email.category)}`}>
                                                            {email.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {email.starred && (
                                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                        )}
                                                        <span className="text-xs text-gray-500">{formatTime(email.timestamp)}</span>
                                                    </div>
                                                </div>

                                                <h3 className={`text-sm mb-1 truncate ${email.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {email.subject}
                                                </h3>

                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {email.preview}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Email Detail Panel */}
                    <div className="col-span-3">
                        {selectedEmail ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Detalii Email</h3>
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">De la</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedEmail.sender}</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subiect</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{selectedEmail.subject}</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primit</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedEmail.timestamp.toLocaleString('ro-RO')}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prioritate</label>
                                        <p className={`text-sm mt-1 capitalize ${getPriorityColor(selectedEmail.priority)}`}>
                                            {selectedEmail.priority}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conținut</label>
                                        <div className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                                            {selectedEmail.preview}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="flex items-center justify-center space-x-2 p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                                <Reply className="h-4 w-4" />
                                                <span>Răspunde</span>
                                            </button>
                                            <button className="flex items-center justify-center space-x-2 p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                                <Forward className="h-4 w-4" />
                                                <span>Redirecționează</span>
                                            </button>
                                            <button className="flex items-center justify-center space-x-2 p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                                <Archive className="h-4 w-4" />
                                                <span>Arhivează</span>
                                            </button>
                                            <button className="flex items-center justify-center space-x-2 p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                                <Star className="h-4 w-4" />
                                                <span>Marchează</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Selectează un email</h3>
                                <p className="text-sm text-gray-600">
                                    Alege un email din lista din stânga pentru a vedea detaliile complete.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
