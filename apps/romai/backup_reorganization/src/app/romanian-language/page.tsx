'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Languages,
  MessageSquare,
  FileText,
  Globe,
  BookOpen,
  Mic,
  Volume2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Brain,
  Flag,
  Search,
  Filter,
  Play,
  Pause,
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface LanguageProcessingData {
  accuracy: number;
  confidence: number;
  processing_time: number;
  cultural_context_score: number;
}

interface TranslationResult {
  id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  accuracy: number;
  cultural_adaptation: number;
  processing_time: number;
  timestamp: string;
}

interface CulturalContext {
  id: string;
  phrase: string;
  context_type: string;
  explanation: string;
  cultural_significance: number;
  usage_examples: string[];
}

export default function RomanianLanguage() {
  const [selectedTab, setSelectedTab] = useState('processing');
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [languageData, setLanguageData] = useState<LanguageProcessingData>({
    accuracy: 94.7,
    confidence: 89.2,
    processing_time: 127,
    cultural_context_score: 92.1
  });

  const [recentTranslations] = useState<TranslationResult[]>([
    {
      id: '1',
      original_text: 'The weather is beautiful today',
      translated_text: 'Vremea este frumoasă astăzi',
      source_language: 'English',
      target_language: 'Romanian',
      accuracy: 96.5,
      cultural_adaptation: 88.2,
      processing_time: 145,
      timestamp: '2025-08-07T14:30:00Z'
    },
    {
      id: '2',
      original_text: 'La mulți ani!',
      translated_text: 'Happy birthday! (Romanian cultural celebration)',
      source_language: 'Romanian',
      target_language: 'English',
      accuracy: 92.1,
      cultural_adaptation: 95.7,
      processing_time: 132,
      timestamp: '2025-08-07T14:25:00Z'
    },
    {
      id: '3',
      original_text: 'Să trăiți bine!',
      translated_text: 'Live well! (Traditional Romanian blessing)',
      source_language: 'Romanian',
      target_language: 'English',
      accuracy: 89.4,
      cultural_adaptation: 97.3,
      processing_time: 156,
      timestamp: '2025-08-07T14:20:00Z'
    }
  ]);

  const [culturalPhrases] = useState<CulturalContext[]>([
    {
      id: '1',
      phrase: 'Să-ți dea Dumnezeu sănătate!',
      context_type: 'Blessing',
      explanation: 'A traditional Romanian blessing meaning "May God give you health!" - commonly used to express gratitude or good wishes.',
      cultural_significance: 95,
      usage_examples: ['After receiving help', 'During celebrations', 'As a general blessing']
    },
    {
      id: '2',
      phrase: 'Noroc în călătorie!',
      context_type: 'Travel Blessing',
      explanation: 'Romanian farewell meaning "Good luck on your journey!" - reflects the cultural importance of safe travel.',
      cultural_significance: 87,
      usage_examples: ['Saying goodbye to travelers', 'Before business trips', 'Family departures']
    },
    {
      id: '3',
      phrase: 'Cu drag și respect',
      context_type: 'Formal Closing',
      explanation: 'Formal letter closing meaning "With love and respect" - shows Romanian emphasis on relationships.',
      cultural_significance: 92,
      usage_examples: ['Business correspondence', 'Formal letters', 'Official communications']
    }
  ]);

  const tabs = [
    { id: 'processing', label: 'Language Processing', icon: Languages },
    { id: 'translation', label: 'Translation', icon: Globe },
    { id: 'cultural', label: 'Cultural Context', icon: Flag },
    { id: 'analysis', label: 'Text Analysis', icon: FileText },
    { id: 'speech', label: 'Speech Processing', icon: Mic },
    { id: 'models', label: 'Language Models', icon: Brain }
  ];

  const handleTranslation = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);

    // Simulate API call to Romanian language processing service
    setTimeout(() => {
      const newTranslation: TranslationResult = {
        id: Date.now().toString(),
        original_text: inputText,
        translated_text: 'Procesare text român cu context cultural...',
        source_language: 'Auto-detected',
        target_language: 'Romanian',
        accuracy: Math.random() * 10 + 90,
        cultural_adaptation: Math.random() * 10 + 85,
        processing_time: Math.random() * 50 + 100,
        timestamp: new Date().toISOString()
      };

      setTranslationResult(newTranslation);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Enhanced Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm border-b border-red-200/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Languages className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                  Romanian Language Processing
                </h1>
                <p className="text-sm text-gray-600">Advanced Romanian AI Language Tools</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{languageData.accuracy}% Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{languageData.confidence}% Confidence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{languageData.cultural_context_score}% Cultural</span>
                </div>
              </div>

              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabbed Navigation */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-red-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selectedTab === 'processing' && (
            <>
              {/* Language Processing Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-red-800 font-semibold text-sm">Processing Accuracy</h3>
                      <p className="text-3xl font-bold text-red-900 mt-1">{languageData.accuracy}%</p>
                      <p className="text-sm text-red-600 mt-1">+2.3% this week</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-yellow-800 font-semibold text-sm">Confidence Score</h3>
                      <p className="text-3xl font-bold text-yellow-900 mt-1">{languageData.confidence}%</p>
                      <p className="text-sm text-yellow-600 mt-1">High confidence</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-orange-800 font-semibold text-sm">Processing Time</h3>
                      <p className="text-3xl font-bold text-orange-900 mt-1">{languageData.processing_time}ms</p>
                      <p className="text-sm text-orange-600 mt-1">Average response</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-red-800 font-semibold text-sm">Cultural Context</h3>
                      <p className="text-3xl font-bold text-red-900 mt-1">{languageData.cultural_context_score}%</p>
                      <p className="text-sm text-red-600 mt-1">Deep understanding</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                      <Flag className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Real-time Processing Interface */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Language Processing</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Text (Romanian or English)
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter text for Romanian language processing..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <motion.button
                      onClick={handleTranslation}
                      disabled={!inputText.trim() || isProcessing}
                      className="px-6 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg hover:from-red-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isProcessing ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Languages className="w-4 h-4" />
                          <span>Process Text</span>
                        </>
                      )}
                    </motion.button>

                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                      <Mic className="w-4 h-4" />
                      <span>Voice Input</span>
                    </button>

                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                    </button>
                  </div>

                  {translationResult && (
                    <motion.div
                      className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h4 className="font-semibold text-green-900 mb-2">Processing Result</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-green-800">Original:</p>
                          <p className="text-green-900">{translationResult.original_text}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">Processed:</p>
                          <p className="text-green-900">{translationResult.translated_text}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-6 text-sm text-green-700">
                        <span>Accuracy: {translationResult.accuracy.toFixed(1)}%</span>
                        <span>Cultural Adaptation: {translationResult.cultural_adaptation.toFixed(1)}%</span>
                        <span>Time: {translationResult.processing_time}ms</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Recent Processing History */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Processing History</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {recentTranslations.map((translation, index) => (
                    <motion.div
                      key={translation.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">{translation.source_language}:</p>
                              <p className="text-gray-900">{translation.original_text}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{translation.target_language}:</p>
                              <p className="text-gray-900">{translation.translated_text}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center space-x-6 text-xs text-gray-500">
                            <span>Accuracy: {translation.accuracy.toFixed(1)}%</span>
                            <span>Cultural: {translation.cultural_adaptation.toFixed(1)}%</span>
                            <span>Time: {translation.processing_time}ms</span>
                            <span>{new Date(translation.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedTab === 'cultural' && (
            <>
              {/* Cultural Context Analysis */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Romanian Cultural Phrases</h3>

                <div className="space-y-4">
                  {culturalPhrases.map((phrase, index) => (
                    <motion.div
                      key={phrase.id}
                      className="border border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-red-900">"{phrase.phrase}"</h4>
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {phrase.context_type}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Flag className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-600">{phrase.cultural_significance}% Cultural</span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{phrase.explanation}</p>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Usage Examples:</p>
                            <div className="flex flex-wrap gap-2">
                              {phrase.usage_examples.map((example, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                                >
                                  {example}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cultural Intelligence Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                  <h4 className="font-semibold text-red-900 mb-3">Traditional Expressions</h4>
                  <p className="text-2xl font-bold text-red-800">847</p>
                  <p className="text-sm text-red-600">Documented phrases</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-sm">
                  <h4 className="font-semibold text-yellow-900 mb-3">Regional Variations</h4>
                  <p className="text-2xl font-bold text-yellow-800">42</p>
                  <p className="text-sm text-yellow-600">Counties covered</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm">
                  <h4 className="font-semibold text-orange-900 mb-3">Context Accuracy</h4>
                  <p className="text-2xl font-bold text-orange-800">94.7%</p>
                  <p className="text-sm text-orange-600">Cultural understanding</p>
                </div>
              </div>
            </>
          )}

          {/* Other tabs content will be implemented in subsequent updates */}
          {selectedTab !== 'processing' && selectedTab !== 'cultural' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-red-200/50 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tabs.find(tab => tab.id === selectedTab)?.label} Features
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced {tabs.find(tab => tab.id === selectedTab)?.label.toLowerCase()} capabilities coming soon.
              </p>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto">
                {React.createElement(tabs.find(tab => tab.id === selectedTab)?.icon || Languages, {
                  className: "w-8 h-8 text-white"
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="bg-white/80 backdrop-blur-sm border-t border-red-200/50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
              <Languages className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-red-900 mb-2">Advanced Language Processing</h3>
              <p className="text-red-700 text-sm">State-of-the-art Romanian language understanding with cultural context awareness and real-time processing.</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <Flag className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-yellow-900 mb-2">Cultural Intelligence</h3>
              <p className="text-yellow-700 text-sm">Deep understanding of Romanian cultural nuances, traditions, and regional variations for authentic communication.</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <Brain className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-orange-900 mb-2">Real-time Processing</h3>
              <p className="text-orange-700 text-sm">Lightning-fast language processing with high accuracy and confidence scores for immediate results.</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
