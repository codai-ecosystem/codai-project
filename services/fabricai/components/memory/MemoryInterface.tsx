/**
 * Memory Management Interface
 * Interactive component for MemorAI operations
 */

'use client';

import { useState, useEffect } from 'react';
import { MemoryEntry } from '@/lib/services';

export function MemoryInterface() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMemory, setNewMemory] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);

  const searchMemories = async (query: string) => {
    if (!query.trim()) {
      setMemories([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/memory?query=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      
      if (data.success) {
        setMemories(data.memories || []);
      } else {
        console.error('Memory search failed:', data.error);
        setMemories([]);
      }
    } catch (error) {
      console.error('Memory search error:', error);
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const storeMemory = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          metadata: {
            entityType: 'user_input',
            source: 'fabricai',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNewMemory('');
        // Refresh search if there's an active query
        if (searchQuery.trim()) {
          await searchMemories(searchQuery);
        }
      } else {
        console.error('Memory store failed:', data.error);
      }
    } catch (error) {
      console.error('Memory store error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMemories(searchQuery);
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storeMemory(newMemory);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Memory Management
        </h3>

        {/* Store New Memory */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Store New Memory
          </h4>
          <form onSubmit={handleStoreSubmit} className="space-y-3">
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="Enter information to store in memory..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newMemory.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Storing...
                </div>
              ) : (
                'Store Memory'
              )}
            </button>
          </form>
        </div>

        {/* Search Memories */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Search Memories
          </h4>
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="flex space-x-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stored memories..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Memory Results */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {!isLoading && memories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Search Results ({memories.length})
            </h4>
            <div className="space-y-3">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedMemory(memory)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-clamp-3">
                        {memory.content}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTimestamp(memory.timestamp)}</span>
                        {memory.relevance && (
                          <span>
                            Relevance: {(memory.relevance * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400 ml-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && searchQuery && memories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No memories found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Memory Details
                </h3>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedMemory.content}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatTimestamp(selectedMemory.timestamp)}
                    </p>
                  </div>
                  {selectedMemory.relevance && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Relevance</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {(selectedMemory.relevance * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
                {selectedMemory.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                    <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedMemory.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
