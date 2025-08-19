import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    MapPin,
    Users,
    Ticket,
    Clock,
    DollarSign,
    Plus,
    Edit,
    Copy,
    Trash2,
    Settings,
    ExternalLink,
    QrCode,
    Mail,
    Phone,
    Globe,
    CheckCircle,
    AlertCircle,
    TrendingUp
} from 'lucide-react'

interface FundraisingEvent {
    id: string
    name: string
    type: 'gala' | 'marathon' | 'auction' | 'concert' | 'conference' | 'workshop'
    date: string
    location: string
    capacity: number
    registered: number
    ticketPrice: number
    expectedRevenue: number
    status: 'planning' | 'active' | 'completed' | 'cancelled'
    campaignId?: string
}

interface Campaign {
    id: string
    title: string
    goal: number
    raised: number
    status: 'draft' | 'active' | 'paused' | 'completed'
}

interface EventManagementProps {
    events: FundraisingEvent[]
    campaigns: Campaign[]
}

export function EventManagement({ events, campaigns }: EventManagementProps) {
    const [activeView, setActiveView] = useState<'calendar' | 'events' | 'create' | 'analytics'>('calendar')
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const [newEvent, setNewEvent] = useState({
        name: '',
        type: 'gala' as const,
        date: '',
        time: '',
        location: '',
        capacity: '',
        ticketPrice: '',
        description: '',
        campaignId: '',
        requiresRegistration: true,
        publicEvent: true,
        enableDonations: true
    })

    const eventTypes = [
        { value: 'gala', label: 'Charity Gala', icon: '🎭', description: 'Formal fundraising dinner event' },
        { value: 'marathon', label: 'Marathon/Run', icon: '🏃‍♂️', description: 'Athletic fundraising event' },
        { value: 'auction', label: 'Charity Auction', icon: '🔨', description: 'Item bidding fundraiser' },
        { value: 'concert', label: 'Benefit Concert', icon: '🎵', description: 'Musical fundraising event' },
        { value: 'conference', label: 'Conference', icon: '🎤', description: 'Educational fundraising event' },
        { value: 'workshop', label: 'Workshop', icon: '🛠️', description: 'Skills-based fundraising event' }
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getEventTypeInfo = (type: string) => {
        return eventTypes.find(t => t.value === type) || eventTypes[0]
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700'
            case 'planning':
                return 'bg-blue-100 text-blue-700'
            case 'completed':
                return 'bg-gray-100 text-gray-700'
            case 'cancelled':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getRegistrationProgress = (registered: number, capacity: number) => {
        return Math.min((registered / capacity) * 100, 100)
    }

    const handleCreateEvent = () => {
        // Here you would typically call an API to create the event
        console.log('Creating event:', newEvent)
        setShowCreateModal(false)
        setNewEvent({
            name: '',
            type: 'gala',
            date: '',
            time: '',
            location: '',
            capacity: '',
            ticketPrice: '',
            description: '',
            campaignId: '',
            requiresRegistration: true,
            publicEvent: true,
            enableDonations: true
        })
    }

    const renderCalendar = () => (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Event Calendar</h3>
                    <div className="flex items-center space-x-2">
                        <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option>August 2025</option>
                            <option>September 2025</option>
                            <option>October 2025</option>
                        </select>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Event</span>
                        </motion.button>
                    </div>
                </div>

                {/* Mini Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                        <div key={index} className="text-center text-sm font-medium text-gray-600 py-2">
                            {day}
                        </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                        const day = i - 3 // Adjusting for calendar start
                        const isCurrentMonth = day > 0 && day <= 31
                        const hasEvent = isCurrentMonth && [15, 20, 25].includes(day)

                        return (
                            <motion.div
                                key={i}
                                whileHover={hasEvent ? { scale: 1.1 } : {}}
                                className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all ${isCurrentMonth
                                        ? hasEvent
                                            ? 'bg-green-500 text-white font-bold hover:bg-green-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        : 'text-gray-300'
                                    }`}
                            >
                                {isCurrentMonth ? day : ''}
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Upcoming Events</h3>
                <div className="space-y-4">
                    {events.filter(e => e.status === 'active').map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="text-2xl">{getEventTypeInfo(event.type).icon}</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-1">{event.name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-3 w-3" />
                                        <span>{event.registered}/{event.capacity}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full"
                                        style={{ width: `${getRegistrationProgress(event.registered, event.capacity)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(event.expectedRevenue)}
                                </div>
                                <div className="text-xs text-gray-500">Expected</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderEvents = () => (
        <div className="space-y-6">
            {/* Events List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">All Events</h3>
                    <div className="flex items-center space-x-2">
                        <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="all">All Events</option>
                            <option value="active">Active</option>
                            <option value="planning">Planning</option>
                            <option value="completed">Completed</option>
                        </select>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Event</span>
                        </motion.button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                    <div className="text-3xl">{getEventTypeInfo(event.type).icon}</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">{event.name}</h4>
                                        <p className="text-gray-600 text-sm mb-2">{getEventTypeInfo(event.type).description}</p>
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Ticket className="h-4 w-4" />
                                    <span>{formatCurrency(event.ticketPrice)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{formatCurrency(event.expectedRevenue)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm">
                                        <span className="text-gray-600">Registration: </span>
                                        <span className="font-medium text-gray-900">
                                            {event.registered} / {event.capacity}
                                        </span>
                                    </div>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                                            style={{ width: `${getRegistrationProgress(event.registered, event.capacity)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {getRegistrationProgress(event.registered, event.capacity).toFixed(0)}%
                                    </span>
                                </div>

                                <div className="flex space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center space-x-1"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        <span>View Page</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center space-x-1"
                                    >
                                        <QrCode className="h-3 w-3" />
                                        <span>QR Code</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderCreate = () => (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Create New Event</h3>

                <div className="space-y-6">
                    {/* Event Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {eventTypes.map((type) => (
                                <motion.div
                                    key={type.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setNewEvent(prev => ({ ...prev, type: type.value as any }))}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${newEvent.type === type.value
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-green-300'
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">{type.icon}</div>
                                        <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                            <input
                                type="text"
                                value={newEvent.name}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter event name..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Associated Campaign</label>
                            <select
                                value={newEvent.campaignId}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, campaignId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select a campaign (optional)</option>
                                {campaigns.map(campaign => (
                                    <option key={campaign.id} value={campaign.id}>
                                        {campaign.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                            <input
                                type="time"
                                value={newEvent.time}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input
                                type="text"
                                value={newEvent.location}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Enter venue or address..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                            <input
                                type="number"
                                value={newEvent.capacity}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, capacity: e.target.value }))}
                                placeholder="Maximum attendees..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Price (RON)</label>
                            <input
                                type="number"
                                value={newEvent.ticketPrice}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, ticketPrice: e.target.value }))}
                                placeholder="0 for free events..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Description</label>
                        <textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your event, include agenda, speakers, activities..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Settings */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Event Settings</label>
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={newEvent.requiresRegistration}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, requiresRegistration: e.target.checked }))}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Requires Registration</span>
                            </label>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={newEvent.publicEvent}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, publicEvent: e.target.checked }))}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Public Event (visible in listings)</span>
                            </label>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={newEvent.enableDonations}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, enableDonations: e.target.checked }))}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Enable Donations at Event</span>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Save as Draft
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            Preview
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreateEvent}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                        >
                            Create Event
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-900">{events.length}</div>
                            <div className="text-sm text-blue-700">Total Events</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-900">
                                {events.reduce((sum, e) => sum + e.registered, 0)}
                            </div>
                            <div className="text-sm text-green-700">Total Registrations</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-900">
                                {formatCurrency(events.reduce((sum, e) => sum + e.expectedRevenue, 0))}
                            </div>
                            <div className="text-sm text-purple-700">Expected Revenue</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-900">
                                {events.filter(e => e.status === 'active').length}
                            </div>
                            <div className="text-sm text-orange-700">Active Events</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Event Performance</h3>
                <div className="space-y-4">
                    {events.map((event, index) => {
                        const progress = getRegistrationProgress(event.registered, event.capacity)
                        const revenueProgress = (event.registered * event.ticketPrice / event.expectedRevenue) * 100

                        return (
                            <div key={event.id} className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{event.name}</h4>
                                        <p className="text-sm text-gray-600">{formatDate(event.date)} • {event.location}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                        {event.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Registration Progress</span>
                                            <span className="font-medium">{event.registered} / {event.capacity}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% filled</div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Revenue Progress</span>
                                            <span className="font-medium">{formatCurrency(event.registered * event.ticketPrice)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(revenueProgress, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{revenueProgress.toFixed(1)}% of target</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white/50 p-1 rounded-xl">
                {[
                    { id: 'calendar', label: 'Calendar', icon: Calendar },
                    { id: 'events', label: 'Manage Events', icon: Settings },
                    { id: 'create', label: 'Create Event', icon: Plus },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveView(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${activeView === tab.id
                                ? 'bg-white text-green-600 shadow-md'
                                : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeView === 'calendar' && renderCalendar()}
                {activeView === 'events' && renderEvents()}
                {activeView === 'create' && renderCreate()}
                {activeView === 'analytics' && renderAnalytics()}
            </motion.div>
        </div>
    )
}
