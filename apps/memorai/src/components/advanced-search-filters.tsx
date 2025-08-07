'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
    Search,
    Filter,
    Calendar,
    Star,
    Tag,
    FolderOpen,
    X,
    AlertCircle,
    Clock
} from 'lucide-react';
import { memoraiMCPClient } from '../utils/memorai-mcp-client';

interface Memory {
    structuredKey: string;
    content: string;
    agentId: string;
    importance: number;
    project?: string;
    tags?: string[];
    createdAt: string;
    updatedAt?: string;
}

interface SearchFilters {
    query: string;
    project: string;
    tags: string[];
    importanceMin: number;
    importanceMax: number;
    dateFrom: string;
    dateTo: string;
    limit: number;
}

export default function AdvancedSearch() {
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        project: '',
        tags: [],
        importanceMin: 0,
        importanceMax: 10,
        dateFrom: '',
        dateTo: '',
        limit: 50
    });

    const [results, setResults] = useState<Memory[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [availableProjects, setAvailableProjects] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Load available projects and tags on component mount
    useEffect(() => {
        loadAvailableFilters();
    }, []);

    const loadAvailableFilters = async () => {
        try {
            const allMemories = await memoraiMCPClient.getAllMemories();

            // Extract unique projects
            const projects = Array.from(
                new Set(
                    allMemories
                        .map(m => m.project)
                        .filter(p => p && p.trim() !== '')
                )
            ).sort();

            // Extract unique tags
            const tags = Array.from(
                new Set(
                    allMemories
                        .flatMap(m => m.tags || [])
                        .filter(t => t && t.trim() !== '')
                )
            ).sort();

            setAvailableProjects(projects);
            setAvailableTags(tags);
        } catch (error) {
            console.error('Failed to load filter options:', error);
        }
    };

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const searchOptions = {
                query: filters.query || undefined,
                project: filters.project || undefined,
                tags: filters.tags.length > 0 ? filters.tags : undefined,
                importanceMin: filters.importanceMin > 0 ? filters.importanceMin : undefined,
                importanceMax: filters.importanceMax < 10 ? filters.importanceMax : undefined,
                dateFrom: filters.dateFrom || undefined,
                dateTo: filters.dateTo || undefined,
                limit: filters.limit
            };

            const memories = await memoraiMCPClient.searchMemoriesAdvanced(searchOptions);
            setResults(memories);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
            setFilters(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const clearFilters = () => {
        setFilters({
            query: '',
            project: '',
            tags: [],
            importanceMin: 0,
            importanceMax: 10,
            dateFrom: '',
            dateTo: '',
            limit: 50
        });
        setResults([]);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getImportanceColor = (importance: number) => {
        if (importance >= 8) return 'bg-red-100 text-red-800';
        if (importance >= 6) return 'bg-yellow-100 text-yellow-800';
        if (importance >= 4) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Search Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-600" />
                        Advanced Search
                    </CardTitle>
                    <CardDescription>
                        Search and filter your memories with advanced criteria
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search Query */}
                    <div className="space-y-2">
                        <Label htmlFor="search-query">Search Query</Label>
                        <Input
                            id="search-query"
                            placeholder="Enter keywords to search..."
                            value={filters.query}
                            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                        />
                    </div>

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Project Filter */}
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select value={filters.project} onValueChange={(value) => setFilters(prev => ({ ...prev, project: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All projects</SelectItem>
                                    {availableProjects.map(project => (
                                        <SelectItem key={project} value={project}>{project}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Importance Range */}
                        <div className="space-y-2">
                            <Label>Importance Min</Label>
                            <Select value={filters.importanceMin.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, importanceMin: parseInt(value) }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 11 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Importance Max</Label>
                            <Select value={filters.importanceMax.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, importanceMax: parseInt(value) }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 11 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <Label>Date From</Label>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Date To</Label>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                            />
                        </div>

                        {/* Result Limit */}
                        <div className="space-y-2">
                            <Label>Result Limit</Label>
                            <Select value={filters.limit.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value) }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 results</SelectItem>
                                    <SelectItem value="25">25 results</SelectItem>
                                    <SelectItem value="50">50 results</SelectItem>
                                    <SelectItem value="100">100 results</SelectItem>
                                    <SelectItem value="200">200 results</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tags Filter */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                className="flex-1"
                            />
                            <Button onClick={addTag} variant="outline" size="sm">
                                <Tag className="w-4 h-4" />
                            </Button>
                        </div>
                        {filters.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {filters.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                        <button onClick={() => removeTag(tag)}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {availableTags.length > 0 && (
                            <div className="text-xs text-gray-500">
                                Available tags: {availableTags.slice(0, 10).join(', ')}
                                {availableTags.length > 10 && '...'}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button onClick={handleSearch} disabled={isSearching} className="flex-1">
                            <Search className="w-4 h-4 mr-2" />
                            {isSearching ? 'Searching...' : 'Search'}
                        </Button>
                        <Button onClick={clearFilters} variant="outline">
                            <X className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Search Results */}
            {results.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-green-600" />
                            Search Results ({results.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {results.map((memory) => (
                                <Card key={memory.structuredKey} className="border-l-4 border-l-blue-500">
                                    <CardContent className="pt-4">
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm text-gray-900 leading-relaxed">
                                                    {memory.content}
                                                </p>
                                                <Badge className={getImportanceColor(memory.importance)}>
                                                    <Star className="w-3 h-3 mr-1" />
                                                    {memory.importance}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(memory.createdAt)}
                                                </div>
                                                {memory.project && (
                                                    <div className="flex items-center gap-1">
                                                        <FolderOpen className="w-3 h-3" />
                                                        {memory.project}
                                                    </div>
                                                )}
                                            </div>

                                            {memory.tags && memory.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {memory.tags.map(tag => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            <Tag className="w-2 h-2 mr-1" />
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Results */}
            {results.length === 0 && !isSearching && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-gray-500 py-8">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No memories found matching your search criteria.</p>
                            <p className="text-sm mt-2">Try adjusting your filters or search query.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
