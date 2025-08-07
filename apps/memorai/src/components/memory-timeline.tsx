'use client'

import React from 'react';

import { useState, useEffect, useMemo } from 'react';
import { Memory } from '../types/memory';
import {
    TimelineGroup,
    TimelinePeriod,
    TIMELINE_PERIODS,
    groupMemoriesByDate,
    filterTimelineByPeriod,
    findMemoryConnections,
    getTimelineStats
} from '../lib/timeline-data';
import {
    Calendar,
    Clock,
    Edit,
    Eye,
    Filter,
    Link2,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Search,
    Tag,
    FolderIcon
} from 'lucide-react';

interface MemoryTimelineProps {
    memories: Memory[];
    onMemorySelect: (memory: Memory) => void;
    onMemoryEdit?: (memory: Memory) => void;
    selectedPeriod?: string;
    onPeriodChange?: (period: string) => void;
}

export default function MemoryTimeline({
    memories,
    onMemorySelect,
    onMemoryEdit,
    selectedPeriod = 'month',
    onPeriodChange
}: MemoryTimelineProps) {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['today', 'yesterday']));
    const [searchQuery, setSearchQuery] = useState('');
    const [showStats, setShowStats] = useState(false);

    // Group and filter memories
    const timelineGroups = useMemo(() => {
        const groups = groupMemoriesByDate(memories);
        const filtered = filterTimelineByPeriod(groups, selectedPeriod);

        // Apply search filter if query exists
        if (searchQuery.trim()) {
            return filtered.map(group => ({
                ...group,
                items: group.items.filter(item =>
                    item.memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.memory.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.memory.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            })).filter(group => group.items.length > 0);
        }

        return filtered;
    }, [memories, selectedPeriod, searchQuery]);

    const stats = useMemo(() => getTimelineStats(timelineGroups), [timelineGroups]);

    const toggleGroup = (dateKey: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(dateKey)) {
            newExpanded.delete(dateKey);
        } else {
            newExpanded.add(dateKey);
        }
        setExpandedGroups(newExpanded);
    };

    const getEventIcon = (type: 'created' | 'updated' | 'accessed') => {
        switch (type) {
            case 'created':
                return <Calendar className="h-4 w-4 text-green-600" />;
            case 'updated':
                return <Edit className="h-4 w-4 text-blue-600" />;
            case 'accessed':
                return <Eye className="h-4 w-4 text-gray-600" />;
        }
    };

    const getEventColor = (type: 'created' | 'updated' | 'accessed') => {
        switch (type) {
            case 'created':
                return 'border-green-500 bg-green-50 dark:bg-green-900/20';
            case 'updated':
                return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'accessed':
                return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    if (memories.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Timeline Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Create some memories to see your timeline visualization
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Memory Timeline
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({stats.totalItems} events)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        >
                            <BarChart3 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                        {TIMELINE_PERIODS.map((period) => (
                            <button
                                key={period.value}
                                onClick={() => onPeriodChange?.(period.value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${selectedPeriod === period.value
                                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search timeline events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Stats Panel */}
                {showStats && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.totalItems}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Total Events
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats.totalDays}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Active Days
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.avgItemsPerDay}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Avg/Day
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {stats.mostActiveDayCount}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Best Day
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline Content */}
            <div className="p-6">
                {timelineGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No events found for the selected period</p>
                        {searchQuery && (
                            <p className="text-sm mt-1">
                                Try adjusting your search query or time period
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {timelineGroups.map((group) => (
                            <div key={group.date} className="relative">
                                {/* Date Header */}
                                <button
                                    onClick={() => toggleGroup(group.date)}
                                    className="flex items-center gap-3 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                >
                                    {expandedGroups.has(group.date) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {group.displayDate}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {group.count} event{group.count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </button>

                                {/* Timeline Items */}
                                {expandedGroups.has(group.date) && (
                                    <div className="ml-7 mt-3 space-y-3">
                                        {group.items.map((item, index) => {
                                            const connections = findMemoryConnections(item.memory, memories);
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`relative pl-8 pb-4 ${index !== group.items.length - 1
                                                            ? 'border-l-2 border-gray-200 dark:border-gray-600'
                                                            : ''
                                                        }`}
                                                >
                                                    {/* Event Icon */}
                                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${getEventColor(item.type)}`}>
                                                        {getEventIcon(item.type)}
                                                    </div>

                                                    {/* Event Content */}
                                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                                        onClick={() => onMemorySelect(item.memory)}>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex-1">
                                                                <h5 className="font-medium text-gray-900 dark:text-white">
                                                                    {item.memory.title || 'Untitled Memory'}
                                                                </h5>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    {item.memory.content.length > 100
                                                                        ? item.memory.content.substring(0, 100) + '...'
                                                                        : item.memory.content
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                                                                {item.date.toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Memory Metadata */}
                                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                            {item.memory.category && (
                                                                <div className="flex items-center gap-1">
                                                                    <FolderIcon className="h-3 w-3" />
                                                                    {item.memory.category}
                                                                </div>
                                                            )}
                                                            {item.memory.tags && item.memory.tags.length > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <Tag className="h-3 w-3" />
                                                                    {item.memory.tags.slice(0, 2).join(', ')}
                                                                    {item.memory.tags.length > 2 && (
                                                                        <span>+{item.memory.tags.length - 2}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {connections.length > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <Link2 className="h-3 w-3" />
                                                                    {connections.length} connected
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onMemorySelect(item.memory);
                                                                }}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                View
                                                            </button>
                                                            {onMemoryEdit && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onMemoryEdit(item.memory);
                                                                    }}
                                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

