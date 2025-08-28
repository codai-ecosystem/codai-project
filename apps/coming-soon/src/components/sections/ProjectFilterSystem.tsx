'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Search, Filter, Grid, List, Star, Clock, TrendingUp, ChevronDown, X, Tag } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { colors, gradients } from '@/design-system/colors'
import { durations, easings, springs } from '@/design-system/animations'
import { codaiProjects, type Project } from '@/data/projects'

// Filter Types
type ProjectTier = 1 | 2 | 3 | 4 | 5
type ProjectStatus = 'production' | 'development' | 'beta' | 'coming-soon' | 'planned'
type FilterCategory = 'tier' | 'status' | 'category' | 'tag'
type SortOption = 'name' | 'priority' | 'status' | 'recently_updated'
type ViewMode = 'grid' | 'list'

interface FilterState {
    search: string
    selectedTiers: ProjectTier[]
    selectedStatuses: ProjectStatus[]
    selectedCategories: string[]
    selectedTags: string[]
    sortBy: SortOption
    sortOrder: 'asc' | 'desc'
    viewMode: ViewMode
}

interface FilterSystemProps {
    onFiltersChange: (filteredProjects: typeof codaiProjects) => void
    className?: string
}

export default function ProjectFilterSystem({ onFiltersChange, className = '' }: FilterSystemProps) {
    const { theme } = useTheme()
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        selectedTiers: [],
        selectedStatuses: [],
        selectedCategories: [],
        selectedTags: [],
        sortBy: 'name',
        sortOrder: 'asc',
        viewMode: 'grid'
    })

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<FilterCategory | null>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Animation values
    const filterPanelY = useMotionValue(0)
    const filterPanelOpacity = useTransform(filterPanelY, [-100, 0], [0, 1])

    // Extract unique values for filters
    const filterOptions = useMemo(() => ({
        tiers: Array.from(new Set(codaiProjects.map(p => p.tier))) as ProjectTier[],
        statuses: Array.from(new Set(codaiProjects.map(p => p.status))) as ProjectStatus[],
        categories: Array.from(new Set(codaiProjects.map(p => p.category))),
        tags: Array.from(new Set(codaiProjects.flatMap(p => p.techStack || [])))
    }), [])

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        const result = codaiProjects.filter(project => {
            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase()
                const matchesSearch =
                    project.name.toLowerCase().includes(searchTerm) ||
                    project.description.toLowerCase().includes(searchTerm) ||
                    project.techStack?.some((tag: string) => tag.toLowerCase().includes(searchTerm)) ||
                    project.category.toLowerCase().includes(searchTerm)

                if (!matchesSearch) return false
            }

            // Tier filter
            if (filters.selectedTiers.length > 0 && !filters.selectedTiers.includes(project.tier)) {
                return false
            }

            // Status filter
            if (filters.selectedStatuses.length > 0 && !filters.selectedStatuses.includes(project.status)) {
                return false
            }

            // Category filter
            if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(project.category)) {
                return false
            }

            // Tag filter
            if (filters.selectedTags.length > 0) {
                const hasMatchingTag = filters.selectedTags.some(tag =>
                    project.techStack?.includes(tag)
                )
                if (!hasMatchingTag) return false
            }

            return true
        })

        // Sort results
        result.sort((a, b) => {
            let compareValue = 0

            switch (filters.sortBy) {
                case 'name':
                    compareValue = a.name.localeCompare(b.name)
                    break
                case 'priority':
                    const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
                    compareValue = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
                    break
                case 'status':
                    const statusOrder: Record<string, number> = {
                        production: 5,
                        beta: 4,
                        development: 3,
                        'coming-soon': 2,
                        planned: 1
                    }
                    compareValue = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0)
                    break
                case 'recently_updated':
                    // Mock recent update logic - in real app would use actual dates
                    compareValue = a.name.localeCompare(b.name) // Placeholder
                    break
            }

            return filters.sortOrder === 'desc' ? -compareValue : compareValue
        })

        return result
    }, [filters])

    // Update parent component when filters change
    useEffect(() => {
        onFiltersChange(filteredProjects)
    }, [filteredProjects, onFiltersChange])

    // Filter handlers
    const handleSearchChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, search: value }))
    }, [])

    const handleFilterToggle = useCallback((
        category: FilterCategory,
        value: string,
        isSelected: boolean
    ) => {
        setFilters(prev => {
            if (category === 'tier') {
                const tierValue = parseInt(value) as ProjectTier
                return {
                    ...prev,
                    selectedTiers: isSelected
                        ? prev.selectedTiers.filter(v => v !== tierValue)
                        : [...prev.selectedTiers, tierValue]
                }
            }

            const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}s` as keyof FilterState
            const currentValues = prev[key] as string[]

            return {
                ...prev,
                [key]: isSelected
                    ? currentValues.filter(v => v !== value)
                    : [...currentValues, value]
            }
        })
    }, [])

    const handleSortChange = useCallback((sortBy: SortOption, sortOrder?: 'asc' | 'desc') => {
        setFilters(prev => ({
            ...prev,
            sortBy,
            sortOrder: sortOrder || (prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc')
        }))
    }, [])

    const handleViewModeChange = useCallback((viewMode: ViewMode) => {
        setFilters(prev => ({ ...prev, viewMode }))
    }, [])

    const clearAllFilters = useCallback(() => {
        setFilters({
            search: '',
            selectedTiers: [],
            selectedStatuses: [],
            selectedCategories: [],
            selectedTags: [],
            sortBy: 'name',
            sortOrder: 'asc',
            viewMode: 'grid'
        })
        if (searchInputRef.current) {
            searchInputRef.current.value = ''
        }
    }, [])

    const hasActiveFilters = useMemo(() => {
        return filters.search ||
            filters.selectedTiers.length > 0 ||
            filters.selectedStatuses.length > 0 ||
            filters.selectedCategories.length > 0 ||
            filters.selectedTags.length > 0
    }, [filters])

    // Get filter badge count
    const getFilterBadgeCount = useCallback((category: FilterCategory): number => {
        switch (category) {
            case 'tier': return filters.selectedTiers.length
            case 'status': return filters.selectedStatuses.length
            case 'category': return filters.selectedCategories.length
            case 'tag': return filters.selectedTags.length
            default: return 0
        }
    }, [filters])

    const TierBadge: React.FC<{ tier: ProjectTier; isSelected: boolean }> = ({ tier, isSelected }) => {
        const tierColors: Record<number, string> = {
            1: 'from-blue-500 to-blue-600',
            2: 'from-emerald-500 to-emerald-600',
            3: 'from-purple-500 to-purple-600',
            4: 'from-amber-500 to-amber-600',
            5: 'from-pink-500 to-pink-600'
        }

        const tierNames: Record<number, string> = {
            1: 'Foundation',
            2: 'New Generation',
            3: 'Infrastructure',
            4: 'Specialized',
            5: 'Emerging'
        }

        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterToggle('tier', tier.toString(), isSelected)}
                className={`
          px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
          ${isSelected
                        ? `bg-gradient-to-r ${tierColors[tier]} text-white shadow-lg`
                        : `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`
                    }
        `}
            >
                {tierNames[tier]}
                {isSelected && <X className="inline-block w-3 h-3 ml-1" />}
            </motion.button>
        )
    }

    const FilterDropdown: React.FC<{
        category: FilterCategory
        label: string
        icon: React.ComponentType<{ className?: string }>
    }> = ({ category, label, icon: Icon }) => {
        const isOpen = activeDropdown === category
        const badgeCount = getFilterBadgeCount(category)

        return (
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveDropdown(isOpen ? null : category)}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200 border
            ${isOpen || badgeCount > 0
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
          `}
                >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    {badgeCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                            {badgeCount}
                        </motion.span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: durations.fast, ease: easings.smooth }}
                            className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 min-w-[200px] max-h-64 overflow-y-auto"
                        >
                            {/* Tier filters */}
                            {category === 'tier' && (
                                <div className="p-3 space-y-2">
                                    {filterOptions.tiers.map(tier => {
                                        const isSelected = filters.selectedTiers.includes(tier)
                                        return (
                                            <TierBadge key={tier} tier={tier} isSelected={isSelected} />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Status filters */}
                            {category === 'status' && (
                                <div className="p-2">
                                    {filterOptions.statuses.map(status => {
                                        const isSelected = filters.selectedStatuses.includes(status)
                                        return (
                                            <motion.button
                                                key={status}
                                                whileHover={{ backgroundColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.8)' }}
                                                onClick={() => handleFilterToggle('status', status, isSelected)}
                                                className={`
                          w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                          ${isSelected ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'}
                        `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="capitalize">{status}</span>
                                                    {isSelected && <Star className="w-4 h-4" />}
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Category filters */}
                            {category === 'category' && (
                                <div className="p-2">
                                    {filterOptions.categories.map(cat => {
                                        const isSelected = filters.selectedCategories.includes(cat)
                                        return (
                                            <motion.button
                                                key={cat}
                                                whileHover={{ backgroundColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.8)' }}
                                                onClick={() => handleFilterToggle('category', cat, isSelected)}
                                                className={`
                          w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                          ${isSelected ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'}
                        `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{cat}</span>
                                                    {isSelected && <Star className="w-4 h-4" />}
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Tag filters */}
                            {category === 'tag' && (
                                <div className="p-3 space-y-1">
                                    {filterOptions.tags.map(tag => {
                                        const isSelected = filters.selectedTags.includes(tag)
                                        return (
                                            <motion.button
                                                key={tag}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleFilterToggle('tag', tag, isSelected)}
                                                className={`
                          inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mr-2 mb-1
                          transition-all duration-200
                          ${isSelected
                                                        ? 'bg-blue-500 text-white shadow-sm'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }
                        `}
                                            >
                                                <Tag className="w-3 h-3" />
                                                {tag}
                                                {isSelected && <X className="w-3 h-3" />}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (activeDropdown && !(event.target as Element)?.closest('[data-dropdown]')) {
                setActiveDropdown(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [activeDropdown])

    return (
        <div className={`w-full ${className}`}>
            {/* Search and Main Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search projects by name, description, or tags..."
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {filters.search && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                handleSearchChange('')
                                if (searchInputRef.current) searchInputRef.current.value = ''
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewModeChange('grid')}
                        className={`p-2 rounded-md transition-colors ${filters.viewMode === 'grid'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                    >
                        <Grid className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewModeChange('list')}
                        className={`p-2 rounded-md transition-colors ${filters.viewMode === 'list'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                    >
                        <List className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Advanced Filter Toggle */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className={`
            flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 border
            ${isFilterPanelOpen || hasActiveFilters
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
          `}
                >
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                            {Object.values(filters).flat().filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length}
                        </motion.span>
                    )}
                </motion.button>
            </div>

            {/* Advanced Filter Panel */}
            <AnimatePresence>
                {isFilterPanelOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: durations.slow, ease: easings.smooth }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                            {/* Filter Controls */}
                            <div className="flex flex-wrap gap-4 mb-4" data-dropdown>
                                <FilterDropdown category="tier" label="Tier" icon={Star} />
                                <FilterDropdown category="status" label="Status" icon={Clock} />
                                <FilterDropdown category="category" label="Category" icon={Tag} />
                                <FilterDropdown category="tag" label="Tags" icon={TrendingUp} />
                            </div>

                            {/* Sort Controls */}
                            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                                {(['name', 'priority', 'status', 'recently_updated'] as SortOption[]).map(option => (
                                    <motion.button
                                        key={option}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSortChange(option)}
                                        className={`
                      flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${filters.sortBy === option
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }
                    `}
                                    >
                                        <span className="capitalize">{option.replace('_', ' ')}</span>
                                        {filters.sortBy === option && (
                                            <span className={`transform transition-transform ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                                                ↑
                                            </span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Clear All Button */}
                            {hasActiveFilters && (
                                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={clearAllFilters}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear All Filters
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProjects.length}</span> of{' '}
                    <span className="font-semibold">{codaiProjects.length}</span> projects
                    {hasActiveFilters && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                            Filtered
                        </span>
                    )}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>View:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{filters.viewMode}</span>
                </div>
            </div>
        </div>
    )
}