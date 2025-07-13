/**
 * Voice Search Integration for Memorai Dashboard V3.0
 * Advanced voice search with multi-language support and real-time transcription
 */

import React, { useState, useEffect, useRef } from 'react';
import { useMemoryStore } from '../../stores/memory-store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Mic,
  MicOff,
  Settings,
  Volume2,
  VolumeX,
  Languages,
  Search,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Brain,
  Waves,
  Activity,
  CheckCircle,
  AlertCircle,
  Globe,
  Headphones
} from 'lucide-react';

interface VoiceSearchDashboardProps {
  onVoiceQuery?: (query: string) => void;
  className?: string;
}

export const VoiceSearchDashboard: React.FC<VoiceSearchDashboardProps> = ({
  onVoiceQuery,
  className = ''
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    continuous: false,
    confidenceThreshold: 0.7
  });
  const [showSettings, setShowSettings] = useState(false);
  const recognitionRef = useRef<any>(null);

  const { searchMemories, searchResults: storeSearchResults } = useMemoryStore();

  // Voice recognition functions
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = voiceSettings.continuous;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = voiceSettings.language;

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript && event.results[event.results.length - 1].isFinal) {
        handleVoiceSearch(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleVoiceSearch = async (query: string): Promise<any[]> => {
    if (!query.trim()) return [];

    setIsSearching(true);
    try {
      console.log('🎤 Voice Search Query:', query);

      // Call the onVoiceQuery callback if provided
      if (onVoiceQuery) {
        onVoiceQuery(query);
      }

      // Perform memory search via store
      await searchMemories(query);

      // Get the updated search results from store
      const { searchResults: updatedResults } = useMemoryStore.getState();
      const searchResults = Array.isArray(updatedResults) ? updatedResults : [];
      setSearchResults(searchResults);

      // Add voice search analytics
      logVoiceSearchEvent(query, searchResults.length);

      return searchResults;
    } catch (error) {
      console.error('Voice search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const logVoiceSearchEvent = (query: string, resultCount: number) => {
    // Analytics tracking for voice search usage
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'voice_search', {
        query_length: query.length,
        result_count: resultCount,
        language: voiceSettings.language
      });
    }
  };

  const availableLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' }
  ];

  return (
    <Card className={`voice-search-dashboard ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Voice Search
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Search your memories using voice commands
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Voice Search Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Language Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={voiceSettings.language}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {availableLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Continuous Listening */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Continuous Listening
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={voiceSettings.continuous}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, continuous: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stay listening
                  </span>
                </label>
              </div>

              {/* Confidence Threshold */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confidence Threshold
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={voiceSettings.confidenceThreshold}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(voiceSettings.confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Voice Recording Interface */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                {isRecording ? (
                  <MicOff className="h-8 w-8 text-white" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </Button>
            </div>

            {isRecording && (
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Waves className="h-4 w-4 text-blue-600 animate-pulse" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Listening... Speak your search query
                  </span>
                  <Waves className="h-4 w-4 text-blue-600 animate-pulse" />
                </div>
              </div>
            )}

            {transcript && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-900 dark:text-white">
                  "{transcript}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Searching memories...
              </span>
            </div>
          </div>
        )}

        {searchResults.length > 0 && !isSearching && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Voice Search Results
              </h3>
              <Badge variant="secondary" className="text-xs">
                {searchResults.length} results
              </Badge>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((memory, index) => (
                <div
                  key={memory.id || index}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white mb-2">
                        {memory.content || memory.text || 'No content available'}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        {memory.score && (
                          <span className="flex items-center space-x-1">
                            <span>Relevance:</span>
                            <Badge variant="outline" className="text-xs">
                              {(memory.score * 100).toFixed(1)}%
                            </Badge>
                          </span>
                        )}

                        {memory.timestamp && (
                          <span>
                            {new Date(memory.timestamp).toLocaleDateString()}
                          </span>
                        )}

                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span>Tags:</span>
                            {memory.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && !isSearching && (
          <div className="text-center py-8">
            <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use voice search to find your memories naturally
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Try saying "Find notes about project planning" or "Show me yesterday's meetings"
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .voice-search-dashboard {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .dark .voice-search-dashboard {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-spin {
            animation: none;
          }
        }
      `}</style>
    </Card>
  );
};

// Enhanced Voice Search Hook for Dashboard
export const useVoiceSearchDashboard = () => {
  const [voiceSearchHistory, setVoiceSearchHistory] = useState<string[]>([]);
  const [voiceSearchStats, setVoiceSearchStats] = useState({
    totalSearches: 0,
    avgConfidence: 0,
    mostUsedLanguage: 'en-US',
    successRate: 0
  });

  const addVoiceSearchToHistory = (query: string, confidence: number) => {
    setVoiceSearchHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 searches

    setVoiceSearchStats(prev => ({
      ...prev,
      totalSearches: prev.totalSearches + 1,
      avgConfidence: (prev.avgConfidence * prev.totalSearches + confidence) / (prev.totalSearches + 1)
    }));
  };

  const clearVoiceSearchHistory = () => {
    setVoiceSearchHistory([]);
  };

  return {
    voiceSearchHistory,
    voiceSearchStats,
    addVoiceSearchToHistory,
    clearVoiceSearchHistory
  };
};

export default VoiceSearchDashboard;
