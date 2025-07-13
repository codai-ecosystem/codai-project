'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Header from '../../components/Header';
import VoiceSettings from '../../components/VoiceSettings';
import useTTS from '../../hooks/useTTS';

/**
 * Enhanced Dictionary Page for DEXAI
 * Features 155,000+ Romanian words with comprehensive multilingual support
 * Integrated Azure OpenAI TTS with voice controls following TTK patterns
 */

interface DictionaryEntry {
  id: string;
  word: string;
  definitions: Array<{
    id?: string;
    text: string;
    category: string;
    register?: string;
  }>;
  translations: {
    en?: string[];
    es?: string[];
    fr?: string[];
    de?: string[];
    it?: string[];
    pt?: string[];
  };
  pronunciation?: {
    ipa?: string;
    phonetic?: string;
  };
  etymology?: string;
  partOfSpeech: string[];
  synonyms: string[];
  antonyms: string[];
  examples: Array<{
    id?: string;
    sentence: string;
    context: string;
    translation?: string;
  }>;
  difficulty: number;
  frequency: number;
  category: string;
  votes?: {
    upvotes: number;
    downvotes: number;
  };
  metadata?: {
    aiGenerated?: boolean;
    linguistVerified?: boolean;
    completeness?: number;
    hasAudio?: boolean;
  };
}

interface SearchResponse {
  entries: DictionaryEntry[];
  totalCount: number;
  searchTime: number;
  filters: {
    categories: string[];
    difficulties: number[];
    partsOfSpeech: string[];
    languages: string[];
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  suggestions?: string[];
}

export default function DictionaryPage() {
  return (
    <Suspense fallback={<div>Loading dictionary...</div>}>
      <DictionaryContent />
    </Suspense>
  );
}

function DictionaryContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // TTS integration
  const {
    speakText,
    isLoading: isTTSLoading,
    settings: ttsSettings,
  } = useTTS();

  // Search function
  const performSearch = useCallback(
    async (query: string, page: number = 1) => {
      if (!query.trim()) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);

      try {
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          limit: '20',
          language: selectedLanguage,
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedDifficulty && { difficulty: selectedDifficulty }),
        });

        const response = await fetch(`/api/dictionary/search?${params}`);
        const data: SearchResponse = await response.json();

        setSearchResults(data);
        setCurrentPage(page);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({
          entries: [],
          totalCount: 0,
          searchTime: 0,
          filters: {
            categories: [],
            difficulties: [],
            partsOfSpeech: [],
            languages: [],
          },
          pagination: {
            page: 1,
            limit: 20,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
          error: 'Eroare la căutarea în dicționar',
        } as any);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedLanguage, selectedCategory, selectedDifficulty]
  );

  // Handle search
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      performSearch(searchQuery, 1);
    },
    [searchQuery, performSearch]
  );

  // Handle TTS for word
  const handleSpeak = useCallback(
    async (word: string, pronunciation?: string) => {
      if (!ttsSettings.enabled) return;

      try {
        // Use pronunciation guide if available, otherwise use the word
        const textToSpeak = pronunciation || word;
        await speakText(textToSpeak);
      } catch (error) {
        console.error('TTS error:', error);
      }
    },
    [speakText, ttsSettings.enabled]
  );

  // Load initial search if query param exists
  useEffect(() => {
    const query = searchParams?.get('q');
    if (query) {
      setSearchQuery(query);
      // Perform search with a separate async function to avoid dependency issues
      const initialSearch = async () => {
        if (!query.trim()) return;
        
        setIsSearching(true);
        try {
          const params = new URLSearchParams({
            q: query,
            page: '1',
            limit: '20',
            language: 'en', // Use default language for initial search
          });

          const response = await fetch(`/api/dictionary/search?${params}`);
          const data: SearchResponse = await response.json();

          setSearchResults(data);
          setCurrentPage(1);
        } catch (error) {
          console.error('Initial search error:', error);
          setSearchResults({
            entries: [],
            totalCount: 0,
            searchTime: 0,
            filters: {
              categories: [],
              difficulties: [],
              partsOfSpeech: [],
              languages: [],
            },
            pagination: {
              page: 1,
              limit: 20,
              totalPages: 0,
              hasNext: false,
              hasPrevious: false,
            },
            error: 'Eroare la căutarea inițială în dicționar',
          } as any);
        } finally {
          setIsSearching(false);
        }
      };
      
      initialSearch();
    }
  }, [searchParams]); // Only depend on searchParams

  // Pagination handlers
  const handleNextPage = () => {
    if (searchResults?.pagination && searchResults.pagination.hasNext) {
      performSearch(searchQuery, currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (searchResults?.pagination && searchResults.pagination.hasPrevious) {
      performSearch(searchQuery, currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Glass morphism animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="gradient-primary absolute inset-0"></div>
        <div className="floating-shapes absolute inset-0">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
          <div className="floating-shape shape-5"></div>
        </div>
      </div>

      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Dictionary Title */}
        <div className="mb-8 text-center">
          <div className="glass-card mx-auto mb-6 max-w-4xl p-8">
            <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">
              🇷🇴 Dicționar Explicativ Român DEX
            </h1>
            <p className="text-lg text-blue-100 drop-shadow">
              75,000+ cuvinte autentice cu pronunție AI, traduceri multilingve și definiții
              complete verificate de lingviști
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="glass-card mb-8 p-6"
        >
          <div className="mb-4 flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Caută un cuvânt românesc... (ex: acasă, carte, dragoste)"
                className="glass-input w-full text-lg placeholder:text-blue-200"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-romanian-blue to-romanian-red px-8 py-3 text-white shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
              <span>Caută</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center space-x-4 space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-blue-100">
                Limba:
              </label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="glass-input rounded px-3 py-1 text-sm"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="it">🇮🇹 Italiano</option>
                <option value="pt">🇵🇹 Português</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-romanian-yellow hover:text-yellow-200"
            >
              {showAdvancedFilters ? 'Ascunde filtre' : 'Filtre avansate'}
            </button>

            <button
              type="button"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="flex items-center space-x-1 text-sm text-green-300 hover:text-green-200"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 006 0v-6a3 3 0 00-6 0v6z"
                />
              </svg>
              <span>Setări Voce</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="glass mt-4 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-100">
                    Categorie:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="">Toate categoriile</option>
                    <option value="basic_vocabulary">Vocabular de bază</option>
                    <option value="education">Educație</option>
                    <option value="technology">Tehnologie</option>
                    <option value="science">Știință</option>
                    <option value="medicine">Medicină</option>
                    <option value="philosophy">Filosofie</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-100">
                    Dificultate:
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={e => setSelectedDifficulty(e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="">Toate nivelurile</option>
                    <option value="1">Ușor (1-2)</option>
                    <option value="3">Mediu (3-5)</option>
                    <option value="6">Greu (6-8)</option>
                    <option value="9">Expert (9-10)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Voice Settings Panel */}
          {showVoiceSettings && (
            <div className="glass-green mt-4 rounded-lg p-4">
              <VoiceSettings />
            </div>
          )}
        </form>

        {/* Search Results */}
        {searchResults && (
          <div>
            {/* Results Info */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-blue-100">
                {searchResults.totalCount > 0 ? (
                  <>
                    {searchResults.totalCount.toLocaleString()} rezultate găsite
                    în {searchResults.searchTime}ms
                    {searchResults.suggestions &&
                      searchResults.suggestions.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs">Sugestii: </span>
                          {searchResults.suggestions.map(
                            (suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSearchQuery(suggestion);
                                  performSearch(suggestion);
                                }}
                                className="mr-2 text-xs text-romanian-yellow hover:underline"
                              >
                                {suggestion}
                              </button>
                            )
                          )}
                        </div>
                      )}
                  </>
                ) : (
                  'Niciun rezultat găsit'
                )}
              </div>

              {/* Pagination Info */}
              {searchResults.pagination && searchResults.pagination.totalPages > 1 && (
                <div className="text-sm text-blue-100">
                  Pagina {searchResults.pagination.page} din{' '}
                  {searchResults.pagination.totalPages}
                </div>
              )}
            </div>

            {/* Results List */}
            <div className="space-y-6">
              {searchResults.entries.map(entry => (
                <div
                  key={entry.id}
                  className="glass-card p-6"
                >
                  {/* Word Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                        {entry.word}
                      </h2>

                      {/* TTS Button */}
                      {ttsSettings.enabled && (
                        <button
                          onClick={() =>
                            handleSpeak(
                              entry.word,
                              entry.pronunciation?.phonetic
                            )
                          }
                          disabled={isTTSLoading}
                          className="rounded-full p-2 text-romanian-yellow transition-colors hover:bg-white/10"
                          title="Pronunță cuvântul"
                        >
                          {isTTSLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-romanian-yellow"></div>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 006 0v-6a3 3 0 00-6 0v6z"
                              />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-romanian-blue/30 px-2 py-1 text-xs text-blue-100 backdrop-blur-sm">
                        {entry.category}
                      </span>
                      <span className="rounded bg-green-500/30 px-2 py-1 text-xs text-green-100 backdrop-blur-sm">
                        Nivel {entry.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Pronunciation */}
                  {entry.pronunciation && (
                    <div className="mb-3">
                      <span className="text-sm text-blue-200">
                        Pronunție:{' '}
                        {entry.pronunciation.phonetic ||
                          entry.pronunciation.ipa}
                      </span>
                    </div>
                  )}

                  {/* Part of Speech */}
                  {entry.partOfSpeech.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-blue-100">
                        Partea de vorbire: {entry.partOfSpeech.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Definitions */}
                  <div className="mb-4">
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      Definiții:
                    </h3>
                    {entry.definitions.map((def, index) => (
                      <div key={def.id || index} className="mb-2">
                        <p className="text-blue-100">
                          <span className="font-medium">{index + 1}.</span>{' '}
                          {def.text}
                          {def.register && (
                            <span className="ml-2 text-xs text-blue-300">
                              ({def.register})
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Translations */}
                  {entry.translations[
                    selectedLanguage as keyof typeof entry.translations
                  ] && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        Traduceri în {selectedLanguage.toUpperCase()}:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {entry.translations[
                          selectedLanguage as keyof typeof entry.translations
                        ]?.map((translation, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-white/20 px-3 py-1 text-sm text-blue-100 backdrop-blur-sm"
                          >
                            {translation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Synonyms and Antonyms */}
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {entry.synonyms.length > 0 && (
                      <div>
                        <h3 className="mb-1 text-sm font-semibold text-white">
                          Sinonime:
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {entry.synonyms.slice(0, 5).map((synonym, index) => (
                            <span
                              key={index}
                              className="cursor-pointer rounded bg-green-500/30 px-2 py-1 text-xs text-green-100 backdrop-blur-sm hover:bg-green-500/50"
                              onClick={() => {
                                setSearchQuery(synonym);
                                performSearch(synonym);
                              }}
                            >
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.antonyms.length > 0 && (
                      <div>
                        <h3 className="mb-1 text-sm font-semibold text-white">
                          Antonime:
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {entry.antonyms.slice(0, 5).map((antonym, index) => (
                            <span
                              key={index}
                              className="cursor-pointer rounded bg-red-500/30 px-2 py-1 text-xs text-red-100 backdrop-blur-sm hover:bg-red-500/50"
                              onClick={() => {
                                setSearchQuery(antonym);
                                performSearch(antonym);
                              }}
                            >
                              {antonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Examples */}
                  {entry.examples.length > 0 && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        Exemple:
                      </h3>
                      {entry.examples.slice(0, 3).map((example, index) => (
                        <div
                          key={example.id || index}
                          className="glass mb-2 rounded p-3"
                        >
                          <p className="italic text-blue-100">
                            "{example.sentence}"
                          </p>
                          {example.translation && (
                            <p className="mt-1 text-sm text-blue-200">
                              {example.translation}
                            </p>
                          )}
                          <span className="text-xs text-blue-300">
                            Context: {example.context}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Etymology */}
                  {entry.etymology && (
                    <div className="mb-4">
                      <h3 className="mb-1 text-sm font-semibold text-white">
                        Etimologie:
                      </h3>
                      <p className="text-sm text-blue-200">
                        {entry.etymology}
                      </p>
                    </div>
                  )}

                  {/* Votes and Metadata */}
                  <div className="flex items-center justify-between border-t border-white/20 pt-4 text-xs text-blue-300">
                    <div className="flex items-center space-x-4">
                      {entry.votes && (
                        <span>
                          👍 {entry.votes.upvotes} 👎 {entry.votes.downvotes}
                        </span>
                      )}
                      <span>Frecvență: {entry.frequency}/100</span>
                      {entry.metadata?.hasAudio && (
                        <span className="text-green-300">
                          🎵 Audio disponibil
                        </span>
                      )}
                    </div>
                    {entry.metadata?.linguistVerified && (
                      <span className="text-romanian-yellow">
                        ✓ Verificat lingvistic
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {searchResults.pagination && searchResults.pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={!searchResults.pagination.hasPrevious}
                  className="glass-card rounded px-4 py-2 text-blue-100 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Anterior
                </button>

                <span className="glass-card px-4 py-2 text-blue-100">
                  {searchResults.pagination.page} /{' '}
                  {searchResults.pagination.totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!searchResults.pagination.hasNext}
                  className="glass-card rounded px-4 py-2 text-blue-100 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Următor →
                </button>
              </div>
            )}
          </div>
        )}

        {/* No results or empty state */}
        {!searchResults && !isSearching && (
          <div className="py-12 text-center">
            <div className="glass-card mx-auto max-w-2xl p-8">
              <div className="mb-4 text-6xl">📚</div>
              <h2 className="mb-2 text-2xl font-bold text-white drop-shadow-lg">
                Bine ai venit la DEXAI!
              </h2>
              <p className="mb-6 text-blue-100">
                Caută printre 75,000+ cuvinte românești din DEX cu pronunție AI și
                traduceri multilingve
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <span className="rounded bg-romanian-blue/30 px-3 py-1 text-blue-100 backdrop-blur-sm">
                  🎤 Pronunție AI cu Azure OpenAI
                </span>
                <span className="rounded bg-green-500/30 px-3 py-1 text-green-100 backdrop-blur-sm">
                  🌍 6 limbi de traducere
                </span>
                <span className="rounded bg-purple-500/30 px-3 py-1 text-purple-100 backdrop-blur-sm">
                  📖 Definiții complete cu exemple
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
