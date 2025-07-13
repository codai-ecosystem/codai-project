'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Code,
  Copy,
  Check,
  Zap,
  Settings,
  BarChart3,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

interface Model {
  id: string;
  name: string;
  displayName: string;
  type: string;
  description?: string;
  maxTokens: number;
  inputPrice: number;
  outputPrice: number;
  provider: {
    id: string;
    name: string;
    displayName: string;
    logoUrl?: string;
  };
}

interface AIPlaygroundProps {
  userId?: string;
}

export default function AIPlayground({ userId }: AIPlaygroundProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/ai');
      const data = await response.json();

      if (data.success) {
        setModels(data.data);
        if (data.data.length > 0) {
          setSelectedModel(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const processRequest = async () => {
    if (!selectedModel || !prompt.trim() || !userId) {
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_request',
          data: {
            userId,
            modelId: selectedModel.id,
            prompt: prompt.trim(),
            parameters,
            endpoint: '/chat'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setResponse(data.data.response);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to process request:', error);
      setResponse('Error: Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const examplePrompts = [
    "Explain quantum computing in simple terms",
    "Write a Python function to calculate fibonacci numbers",
    "Create a haiku about artificial intelligence",
    "Summarize the key benefits of renewable energy",
    "Write a professional email requesting a meeting"
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Zap className="h-6 w-6 text-blue-600 mr-2" />
                AI Playground
              </h1>
              <p className="text-gray-600 mt-1">
                Test and experiment with various AI models
              </p>
            </div>

            {userId && (
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>Usage</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                value={selectedModel?.id || ''}
                onChange={(e) => {
                  const model = models.find(m => m.id === e.target.value);
                  setSelectedModel(model || null);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.provider.displayName} - {model.displayName}
                  </option>
                ))}
              </select>

              {selectedModel && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedModel.type}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600">Max Tokens:</span>
                    <span className="font-medium">{selectedModel.maxTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-medium">
                      ${selectedModel.inputPrice}/1K in, ${selectedModel.outputPrice}/1K out
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Parameters */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
              >
                <span>Advanced Parameters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Temperature: {parameters.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={parameters.temperature}
                      onChange={(e) => setParameters({
                        ...parameters,
                        temperature: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedModel?.maxTokens || 4096}
                      value={parameters.maxTokens}
                      onChange={(e) => setParameters({
                        ...parameters,
                        maxTokens: parseInt(e.target.value) || 1000
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Top P: {parameters.topP}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={parameters.topP}
                      onChange={(e) => setParameters({
                        ...parameters,
                        topP: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Example Prompts */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Example Prompts</h3>
              <div className="space-y-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Playground */}
          <div className="lg:col-span-2 space-y-6">
            {/* Authentication Notice */}
            {!userId && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Authentication Required
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please log in to use the AI Playground and access all models.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {prompt.length} characters
                </span>
                <button
                  onClick={processRequest}
                  disabled={!selectedModel || !prompt.trim() || loading || !userId}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Processing...' : 'Send'}</span>
                </button>
              </div>
            </div>

            {/* Response */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Response
                </label>
                {response && (
                  <button
                    onClick={() => copyToClipboard(response)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[200px]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : response ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                    {response}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <Code className="h-8 w-8 mx-auto mb-2" />
                      <p>Response will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
