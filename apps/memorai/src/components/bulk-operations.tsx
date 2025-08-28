'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
    Trash2,
    Edit,
    Search,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { MemorAIMCPClient, MemorAIMCPMemory } from '../utils/memorai-mcp-client';

interface BulkOperationsProps {
    client: MemorAIMCPClient;
}

export function BulkOperations({ client }: BulkOperationsProps) {
    const [operation, setOperation] = useState<'delete' | 'update'>('delete');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MemorAIMCPMemory[]>([]);
    const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{
        type: 'success' | 'error' | 'info' | null;
        message: string;
    }>({ type: null, message: '' });

    // Update fields for bulk update
    const [updateProject, setUpdateProject] = useState('');
    const [updateTags, setUpdateTags] = useState('');
    const [updateImportance, setUpdateImportance] = useState<number | undefined>();

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setStatus({ type: 'info', message: 'Please enter a search query' });
            return;
        }

        setIsLoading(true);
        try {
            const results = await client.searchMemories(searchQuery);
            setSearchResults(results);
            setSelectedMemories([]);
            setStatus({
                type: 'success',
                message: `Found ${results.length} memories`
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedMemories.length === searchResults.length) {
            setSelectedMemories([]);
        } else {
            setSelectedMemories(searchResults.map(m => m.structuredKey));
        }
    };

    const handleSelectMemory = (structuredKey: string) => {
        setSelectedMemories(prev =>
            prev.includes(structuredKey)
                ? prev.filter(k => k !== structuredKey)
                : [...prev, structuredKey]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedMemories.length === 0) {
            setStatus({ type: 'info', message: 'Please select memories to delete' });
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedMemories.length} memories? This action cannot be undone.`)) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await client.bulkDeleteMemories(selectedMemories);
            setStatus({
                type: result.success ? 'success' : 'error',
                message: `Deleted ${result.deleted} memories. ${result.errors.length > 0 ? `Errors: ${result.errors.length}` : ''}`
            });

            if (result.success) {
                // Refresh search results
                await handleSearch();
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: `Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedMemories.length === 0) {
            setStatus({ type: 'info', message: 'Please select memories to update' });
            return;
        }

        if (!updateProject && !updateTags && updateImportance === undefined) {
            setStatus({ type: 'info', message: 'Please specify at least one field to update' });
            return;
        }

        setIsLoading(true);
        try {
            const result = await client.bulkUpdateMemories(selectedMemories, {
                project: updateProject || undefined,
                tags: updateTags ? updateTags.split(',').map(t => t.trim()) : undefined,
                importance: updateImportance
            });

            setStatus({
                type: result.success ? 'success' : 'error',
                message: `Updated ${result.updated} memories. ${result.errors.length > 0 ? `Errors: ${result.errors.length}` : ''}`
            });

            if (result.success) {
                // Clear update fields
                setUpdateProject('');
                setUpdateTags('');
                setUpdateImportance(undefined);
                // Refresh search results
                await handleSearch();
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: `Bulk update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-800">Bulk Operations</h3>
                </div>
                <p className="text-sm text-orange-700">
                    Perform mass operations on your memories. Use with caution as some operations cannot be undone.
                </p>
            </div>

            {/* Operation Type Selection */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="operation-type">Operation Type</Label>
                    <Select value={operation} onValueChange={(value: string) => setOperation(value as 'delete' | 'update')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select operation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="delete">
                                <div className="flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Bulk Delete
                                </div>
                            </SelectItem>
                            <SelectItem value="update">
                                <div className="flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Bulk Update
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Search Section */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="search-query">Search Memories</Label>
                    <div className="flex gap-2">
                        <Input
                            id="search-query"
                            placeholder="Enter keywords to find memories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isLoading}>
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            {/* Status Message */}
            {status.type && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                        status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                    {status.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    {status.type === 'error' && <XCircle className="w-4 h-4" />}
                    {status.message}
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                {selectedMemories.length === searchResults.length ? 'Deselect All' : 'Select All'}
                            </Button>
                            <Badge variant="secondary">
                                {selectedMemories.length} selected
                            </Badge>
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                        {searchResults.map((memory) => (
                            <div
                                key={memory.structuredKey}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedMemories.includes(memory.structuredKey)
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white hover:bg-gray-50'
                                    }`}
                                onClick={() => handleSelectMemory(memory.structuredKey)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium line-clamp-2">
                                            {memory.content.slice(0, 100)}...
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            {memory.project && (
                                                <Badge variant="outline" className="text-xs">
                                                    {memory.project}
                                                </Badge>
                                            )}
                                            <span>Importance: {memory.importance}/10</span>
                                            <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedMemories.includes(memory.structuredKey)}
                                        onChange={() => handleSelectMemory(memory.structuredKey)}
                                        className="ml-2"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Update Fields (for bulk update) */}
            {operation === 'update' && selectedMemories.length > 0 && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold">Update Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="update-project">Project</Label>
                            <Input
                                id="update-project"
                                placeholder="New project name"
                                value={updateProject}
                                onChange={(e) => setUpdateProject(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="update-tags">Tags</Label>
                            <Input
                                id="update-tags"
                                placeholder="tag1, tag2, tag3"
                                value={updateTags}
                                onChange={(e) => setUpdateTags(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="update-importance">Importance</Label>
                            <Input
                                id="update-importance"
                                type="number"
                                min="1"
                                max="10"
                                placeholder="1-10"
                                value={updateImportance || ''}
                                onChange={(e) => setUpdateImportance(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {selectedMemories.length > 0 && (
                <div className="flex gap-2 pt-4 border-t">
                    {operation === 'delete' ? (
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete {selectedMemories.length} Memories
                        </Button>
                    ) : (
                        <Button
                            onClick={handleBulkUpdate}
                            disabled={isLoading}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Update {selectedMemories.length} Memories
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
