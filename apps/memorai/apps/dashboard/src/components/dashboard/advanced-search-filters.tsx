/**
 * Advanced Search Filters for Memorai V3.0
 * Multi-criteria search with saved queries and smart suggestions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMemoryStore } from '../../stores/memory-store';
import {
  Search,
  Filter,
  Save,
  Star,
  Calendar,
  User,
  Tag,
  BarChart3,
  Clock,
  Target,
  Zap,
  History,
  BookmarkPlus,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Eye,
  Download,
  RefreshCw,
  Settings,
  MapPin,
  FileType,
  Layers,
} from 'lucide-react';

interface SearchFilter {
  id: string;
  type: 'text' | 'date' | 'select' | 'multiselect' | 'range' | 'boolean';
  label: string;
  field: string;
  value: any;
  options?: { label: string; value: any }[];
  enabled: boolean;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'between' | 'in' | 'not_in';
}

interface SavedQuery {
  id: string;
  name: string;
  description: string;
  filters: SearchFilter[];
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
  isStarred: boolean;
  isPublic: boolean;
  createdBy: string;
  resultCount?: number;
}

interface SearchResult {
  memory: any;
  relevanceScore: number;
  matchedFields: string[];
  highlights: Record<string, string>;
}

interface SearchAnalytics {
  totalSearches: number;
  averageResultCount: number;
  topSearchTerms: { term: string; count: number }[];
  searchSuccess: number;
  popularFilters: { filter: string; usage: number }[];
}

export const AdvancedSearchFilters: React.FC = () => {
  const { memories, fetchMemories } = useMemoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<SavedQuery | null>(null);
  const [analytics, setAnalytics] = useState<SearchAnalytics>({
    totalSearches: 0,
    averageResultCount: 0,
    topSearchTerms: [],
    searchSuccess: 0,
    popularFilters: [],
  });

  // Available filter definitions
  const availableFilters: Omit<SearchFilter, 'id' | 'value' | 'enabled'>[] = [
    {
      type: 'text',
      label: 'Content Contains',
      field: 'content',
      operator: 'contains',
    },
    {
      type: 'date',
      label: 'Created Date',
      field: 'createdAt',
      operator: 'between',
    },
    {
      type: 'select',
      label: 'Memory Type',
      field: 'type',
      operator: 'equals',
      options: [
        { label: 'Conversation', value: 'conversation' },
        { label: 'Document', value: 'document' },
        { label: 'Note', value: 'note' },
        { label: 'Task', value: 'task' },
        { label: 'Thread', value: 'thread' },
      ],
    },
    {
      type: 'multiselect',
      label: 'Tags',
      field: 'tags',
      operator: 'in',
      options: [
        { label: 'Important', value: 'important' },
        { label: 'Project', value: 'project' },
        { label: 'Meeting', value: 'meeting' },
        { label: 'Personal', value: 'personal' },
        { label: 'Research', value: 'research' },
      ],
    },
    {
      type: 'select',
      label: 'Agent',
      field: 'agentId',
      operator: 'equals',
      options: [
        { label: 'System', value: 'system' },
        { label: 'User', value: 'user' },
        { label: 'Assistant', value: 'assistant' },
        { label: 'API', value: 'api' },
      ],
    },
    {
      type: 'range',
      label: 'Importance Score',
      field: 'importance',
      operator: 'between',
    },
    {
      type: 'range',
      label: 'Content Length',
      field: 'contentLength',
      operator: 'between',
    },
    {
      type: 'boolean',
      label: 'Has Attachments',
      field: 'hasAttachments',
      operator: 'equals',
    },
    {
      type: 'text',
      label: 'Source',
      field: 'source',
      operator: 'contains',
    },
    {
      type: 'select',
      label: 'Confidence Level',
      field: 'confidence',
      operator: 'gt',
      options: [
        { label: 'High (90%+)', value: 0.9 },
        { label: 'Medium (70%+)', value: 0.7 },
        { label: 'Low (50%+)', value: 0.5 },
      ],
    },
  ];

  // Initialize with sample data
  useEffect(() => {
    const sampleQueries: SavedQuery[] = [
      {
        id: 'q1',
        name: 'Recent Project Discussions',
        description: 'All project-related conversations from the last 30 days',
        filters: [
          {
            id: 'f1',
            type: 'text',
            label: 'Content Contains',
            field: 'content',
            value: 'project',
            enabled: true,
            operator: 'contains',
          },
          {
            id: 'f2',
            type: 'date',
            label: 'Created Date',
            field: 'createdAt',
            value: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
            enabled: true,
            operator: 'between',
          },
        ],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        useCount: 23,
        isStarred: true,
        isPublic: false,
        createdBy: 'user',
        resultCount: 47,
      },
      {
        id: 'q2',
        name: 'High Importance Notes',
        description: 'Important notes and documents with high confidence scores',
        filters: [
          {
            id: 'f3',
            type: 'range',
            label: 'Importance Score',
            field: 'importance',
            value: [0.8, 1.0],
            enabled: true,
            operator: 'between',
          },
          {
            id: 'f4',
            type: 'select',
            label: 'Memory Type',
            field: 'type',
            value: 'note',
            enabled: true,
            operator: 'equals',
            options: [
              { label: 'Note', value: 'note' },
              { label: 'Document', value: 'document' },
            ],
          },
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        useCount: 15,
        isStarred: false,
        isPublic: true,
        createdBy: 'system',
        resultCount: 89,
      },
      {
        id: 'q3',
        name: 'Meeting Action Items',
        description: 'Tasks and action items from meeting notes',
        filters: [
          {
            id: 'f5',
            type: 'multiselect',
            label: 'Tags',
            field: 'tags',
            value: ['meeting', 'task'],
            enabled: true,
            operator: 'in',
            options: [
              { label: 'Meeting', value: 'meeting' },
              { label: 'Task', value: 'task' },
            ],
          },
          {
            id: 'f6',
            type: 'text',
            label: 'Content Contains',
            field: 'content',
            value: 'action item|todo|follow up',
            enabled: true,
            operator: 'contains',
          },
        ],
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        useCount: 31,
        isStarred: true,
        isPublic: false,
        createdBy: 'user',
        resultCount: 124,
      },
    ];

    setSavedQueries(sampleQueries);
    fetchMemories();

    // Initialize analytics
    setAnalytics({
      totalSearches: 1247,
      averageResultCount: 23.4,
      topSearchTerms: [
        { term: 'project', count: 156 },
        { term: 'meeting', count: 134 },
        { term: 'task', count: 98 },
        { term: 'api', count: 87 },
        { term: 'design', count: 76 },
      ],
      searchSuccess: 89.3,
      popularFilters: [
        { filter: 'Date Range', usage: 78 },
        { filter: 'Memory Type', usage: 65 },
        { filter: 'Tags', usage: 54 },
        { filter: 'Importance', usage: 43 },
        { filter: 'Agent', usage: 32 },
      ],
    });
  }, [fetchMemories]);

  // Execute search with filters
  const executeSearch = async () => {
    if (!searchQuery.trim() && filters.filter(f => f.enabled).length === 0) {
      return;
    }

    setIsSearching(true);

    try {
      // Remove artificial delay - use real search timing
      const results = performAdvancedSearch(searchQuery, filters.filter(f => f.enabled));
      setSearchResults(results);

      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        totalSearches: prev.totalSearches + 1,
        averageResultCount: (prev.averageResultCount * prev.totalSearches + results.length) / (prev.totalSearches + 1),
      }));

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Advanced search algorithm
  const performAdvancedSearch = (query: string, activeFilters: SearchFilter[]): SearchResult[] => {
    if (!memories) return [];

    return memories
      .map(memory => {
        let relevanceScore = 0;
        const matchedFields: string[] = [];
        const highlights: Record<string, string> = {};

        // Text query matching
        if (query.trim()) {
          const content = memory.content?.toLowerCase() || '';
          const queryLower = query.toLowerCase();

          if (content.includes(queryLower)) {
            relevanceScore += 0.5;
            matchedFields.push('content');
            highlights.content = highlightText(memory.content || '', query);
          }

          // Boost for entity matches
          if (memory.metadata?.entities?.some(entity => entity.toLowerCase().includes(queryLower))) {
            relevanceScore += 0.3;
            matchedFields.push('entities');
          }
        }

        // Filter matching
        for (const filter of activeFilters) {
          const fieldValue = getFieldValue(memory, filter.field);
          if (matchesFilter(fieldValue, filter)) {
            relevanceScore += 0.2;
            matchedFields.push(filter.field);
          }
        }

        return {
          memory,
          relevanceScore,
          matchedFields,
          highlights,
        };
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  // Helper functions
  const getFieldValue = (memory: any, field: string): any => {
    switch (field) {
      case 'content':
        return memory.content;
      case 'createdAt':
        return new Date(memory.metadata?.timestamp || Date.now());
      case 'type':
        return memory.type;
      case 'tags':
        return memory.metadata?.tags || [];
      case 'agentId':
        return memory.metadata?.agentId;
      case 'importance':
        return memory.metadata?.importance || 0;
      case 'contentLength':
        return memory.content?.length || 0;
      case 'hasAttachments':
        return memory.metadata?.attachments?.length > 0;
      case 'source':
        return memory.metadata?.source;
      case 'confidence':
        return memory.metadata?.confidence || 0;
      default:
        return null;
    }
  };

  const matchesFilter = (fieldValue: any, filter: SearchFilter): boolean => {
    switch (filter.operator) {
      case 'equals':
        return fieldValue === filter.value;
      case 'contains':
        return fieldValue?.toString().toLowerCase().includes(filter.value.toLowerCase());
      case 'startsWith':
        return fieldValue?.toString().toLowerCase().startsWith(filter.value.toLowerCase());
      case 'endsWith':
        return fieldValue?.toString().toLowerCase().endsWith(filter.value.toLowerCase());
      case 'gt':
        return Number(fieldValue) > Number(filter.value);
      case 'lt':
        return Number(fieldValue) < Number(filter.value);
      case 'between':
        return Array.isArray(filter.value) &&
          Number(fieldValue) >= Number(filter.value[0]) &&
          Number(fieldValue) <= Number(filter.value[1]);
      case 'in':
        return Array.isArray(filter.value) &&
          Array.isArray(fieldValue) &&
          filter.value.some(v => fieldValue.includes(v));
      case 'not_in':
        return Array.isArray(filter.value) &&
          Array.isArray(fieldValue) &&
          !filter.value.some(v => fieldValue.includes(v));
      default:
        return false;
    }
  };

  const highlightText = (text: string, query: string): string => {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // Filter management
  const addFilter = (filterType: string) => {
    const filterDef = availableFilters.find(f => f.label === filterType);
    if (!filterDef) return;

    const newFilter: SearchFilter = {
      ...filterDef,
      id: `filter-${Date.now()}`,
      value: getDefaultValue(filterDef.type),
      enabled: true,
    };

    setFilters(prev => [...prev, newFilter]);
  };

  const updateFilter = (filterId: string, updates: Partial<SearchFilter>) => {
    setFilters(prev => prev.map(f =>
      f.id === filterId ? { ...f, ...updates } : f
    ));
  };

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const getDefaultValue = (type: string): any => {
    switch (type) {
      case 'text':
        return '';
      case 'date':
        return [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()];
      case 'select':
        return '';
      case 'multiselect':
        return [];
      case 'range':
        return [0, 100];
      case 'boolean':
        return true;
      default:
        return null;
    }
  };

  // Saved query management
  const saveCurrentQuery = (name: string, description: string) => {
    const newQuery: SavedQuery = {
      id: `query-${Date.now()}`,
      name,
      description,
      filters: [...filters],
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0,
      isStarred: false,
      isPublic: false,
      createdBy: 'user',
      resultCount: searchResults.length,
    };

    setSavedQueries(prev => [...prev, newQuery]);
  };

  const loadSavedQuery = (query: SavedQuery) => {
    setFilters(query.filters);
    setSelectedQuery(query);

    // Update usage stats
    setSavedQueries(prev => prev.map(q =>
      q.id === query.id
        ? { ...q, lastUsed: new Date(), useCount: q.useCount + 1 }
        : q
    ));
  };

  const toggleQueryStar = (queryId: string) => {
    setSavedQueries(prev => prev.map(q =>
      q.id === queryId ? { ...q, isStarred: !q.isStarred } : q
    ));
  };

  const deleteSavedQuery = (queryId: string) => {
    setSavedQueries(prev => prev.filter(q => q.id !== queryId));
  };

  // Render filter components
  const renderFilterControl = (filter: SearchFilter) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm";

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder={`Enter ${filter.label.toLowerCase()}`}
            className={baseClasses}
          />
        );

      case 'select':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className={baseClasses}
          >
            <option value="">Select {filter.label}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(filter.value) && filter.value.includes(option.value)}
                  onChange={(e) => {
                    const currentValue = Array.isArray(filter.value) ? filter.value : [];
                    const newValue = e.target.checked
                      ? [...currentValue, option.value]
                      : currentValue.filter(v => v !== option.value);
                    updateFilter(filter.id, { value: newValue });
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={Array.isArray(filter.value) ? filter.value[0] : 0}
              onChange={(e) => {
                const currentValue = Array.isArray(filter.value) ? filter.value : [0, 100];
                updateFilter(filter.id, { value: [Number(e.target.value), currentValue[1]] });
              }}
              placeholder="Min"
              className={baseClasses}
            />
            <input
              type="number"
              value={Array.isArray(filter.value) ? filter.value[1] : 100}
              onChange={(e) => {
                const currentValue = Array.isArray(filter.value) ? filter.value : [0, 100];
                updateFilter(filter.id, { value: [currentValue[0], Number(e.target.value)] });
              }}
              placeholder="Max"
              className={baseClasses}
            />
          </div>
        );

      case 'date':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={Array.isArray(filter.value) ? filter.value[0].toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const currentValue = Array.isArray(filter.value) ? filter.value : [new Date(), new Date()];
                updateFilter(filter.id, { value: [new Date(e.target.value), currentValue[1]] });
              }}
              className={baseClasses}
            />
            <input
              type="date"
              value={Array.isArray(filter.value) ? filter.value[1].toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const currentValue = Array.isArray(filter.value) ? filter.value : [new Date(), new Date()];
                updateFilter(filter.id, { value: [currentValue[0], new Date(e.target.value)] });
              }}
              className={baseClasses}
            />
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filter.value || false}
              onChange={(e) => updateFilter(filter.id, { value: e.target.checked })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Yes</span>
          </label>
        );

      default:
        return <div>Unknown filter type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Search Filters
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-criteria search with saved queries and smart suggestions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced
          </Button>

          <Button
            onClick={executeSearch}
            disabled={isSearching}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isSearching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalSearches.toLocaleString()}
                </p>
              </div>
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Results</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.averageResultCount.toFixed(1)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.searchSuccess.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Queries</p>
                <p className="text-2xl font-bold text-orange-600">
                  {savedQueries.length}
                </p>
              </div>
              <BookmarkPlus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Results</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {searchResults.length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Query
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter your search query..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && executeSearch()}
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvanced && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Advanced Filters
                    </h3>
                    <div className="relative">
                      <select
                        onChange={(e) => e.target.value && addFilter(e.target.value)}
                        value=""
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                      >
                        <option value="">Add Filter</option>
                        {availableFilters.map(filter => (
                          <option key={filter.label} value={filter.label}>
                            {filter.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filters.map((filter) => (
                      <div
                        key={filter.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filter.enabled}
                              onChange={(e) => updateFilter(filter.id, { enabled: e.target.checked })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {filter.label}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFilter(filter.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {filter.enabled && (
                          <div>
                            {renderFilterControl(filter)}
                          </div>
                        )}
                      </div>
                    ))}

                    {filters.length === 0 && (
                      <div className="text-center py-8">
                        <Filter className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No filters added yet.
                        </p>
                        <p className="text-sm text-gray-500">
                          Use the dropdown above to add search filters.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Results */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Search Results ({searchResults.length})
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {result.memory.type || 'unknown'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {(result.relevanceScore * 100).toFixed(0)}% match
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-900 dark:text-white mb-2">
                            {result.highlights.content ? (
                              <span dangerouslySetInnerHTML={{ __html: result.highlights.content }} />
                            ) : (
                              result.memory.content?.substring(0, 150) + '...'
                            )}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              {new Date(result.memory.metadata?.timestamp || Date.now()).toLocaleDateString()}
                            </span>
                            <span>
                              Matched: {result.matchedFields.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {searchResults.length === 0 && !isSearching && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No search results found.
                      </p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search query or filters.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Queries */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookmarkPlus className="h-5 w-5 mr-2" />
                  Saved Queries
                </div>
                <Badge variant="secondary">{savedQueries.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedQueries.slice(0, 10).map((query) => (
                  <div
                    key={query.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadSavedQuery(query)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {query.name}
                          </h4>
                          {query.isStarred && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                          {query.isPublic && (
                            <Badge variant="outline" className="text-xs">Public</Badge>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {query.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{query.useCount} uses</span>
                          <span>{query.resultCount} results</span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQueryStar(query.id);
                          }}
                        >
                          <Star className={`h-3 w-3 ${query.isStarred ? 'fill-current text-yellow-500' : ''}`} />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedQuery(query.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Current Query */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const name = prompt('Query name:');
                    const description = prompt('Query description:');
                    if (name && description) {
                      saveCurrentQuery(name, description);
                    }
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Current Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Popular Search Terms */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Popular Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.topSearchTerms.map((term, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {term.term}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {term.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchFilters;
