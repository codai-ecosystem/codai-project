const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation Service Class
class DocsService {
  constructor() {
    this.documentation = new Map();
    this.apiSpecs = new Map();
    this.sdkGuides = new Map();
    this.analytics = {
      pageViews: new Map(),
      searchQueries: new Map()
    };

    this.initializeData();
  }

  initializeData() {
    // Sample documentation
    this.documentation.set('getting-started', {
      id: 'getting-started',
      title: 'Getting Started with Codai',
      description: 'Quick start guide for Codai platform',
      category: 'guides',
      content: `# Getting Started with Codai

Welcome to Codai - the comprehensive AI development platform.

## Quick Setup

1. Install the SDK
2. Configure your API keys
3. Start building with AI

## Examples

\`\`\`javascript
import { CodaiClient } from '@codai/sdk';

const client = new CodaiClient({
  apiKey: 'your-api-key'
});

const result = await client.ai.generate({
  prompt: 'Hello, world!',
  model: 'gpt-4'
});
\`\`\``,
      tags: ['quickstart', 'setup', 'sdk'],
      lastUpdated: new Date(),
      version: '1.0.0'
    });

    this.documentation.set('api-overview', {
      id: 'api-overview',
      title: 'API Overview',
      description: 'Complete overview of Codai APIs',
      category: 'api',
      content: `# Codai API Overview

Our REST API provides access to all Codai services.

## Base URL
\`https://api.codai.ro/v1\`

## Authentication
All requests require an API key in the header:
\`Authorization: Bearer your-api-key\`

## Rate Limits
- 1000 requests per hour for free tier
- 10000 requests per hour for pro tier`,
      tags: ['api', 'overview', 'authentication'],
      lastUpdated: new Date(),
      version: '1.0.0'
    });

    // API Specifications
    this.apiSpecs.set('codai-api', {
      id: 'codai-api',
      service: 'codai',
      title: 'Codai Core API',
      version: '1.0.0',
      baseUrl: 'https://api.codai.ro/v1',
      description: 'Core Codai platform API for AI services',
      endpoints: [
        {
          method: 'POST',
          path: '/ai/generate',
          summary: 'Generate AI content',
          description: 'Generate text, code, or other content using AI models'
        },
        {
          method: 'GET',
          path: '/models',
          summary: 'List available AI models',
          description: 'Get list of available AI models and their capabilities'
        },
        {
          method: 'POST',
          path: '/chat/completions',
          summary: 'Chat completions',
          description: 'Create chat completions using various AI models'
        }
      ]
    });

    // SDK Guides
    this.sdkGuides.set('javascript-sdk', {
      id: 'javascript-sdk',
      language: 'javascript',
      title: 'JavaScript SDK Guide',
      version: '1.0.0',
      description: 'Complete guide for using Codai JavaScript SDK',
      installation: 'npm install @codai/sdk',
      quickStart: `import { CodaiClient } from '@codai/sdk';

const client = new CodaiClient({
  apiKey: process.env.CODAI_API_KEY
});

// Generate content
const result = await client.ai.generate({
  prompt: 'Write a hello world function',
  model: 'gpt-4'
});

console.log(result.content);`,
      examples: [
        {
          title: 'Basic Text Generation',
          code: `const response = await client.ai.generate({
  prompt: 'Explain quantum computing',
  maxTokens: 500
});`
        }
      ]
    });

    console.log(`📚 Initialized ${this.documentation.size} documentation entries`);
    console.log(`🔌 Initialized ${this.apiSpecs.size} API specifications`);
    console.log(`📖 Initialized ${this.sdkGuides.size} SDK guides`);
  }

  getAllDocumentation() {
    return Array.from(this.documentation.values());
  }

  getDocumentation(id) {
    return this.documentation.get(id);
  }

  searchDocumentation(query, category = null) {
    const docs = Array.from(this.documentation.values());
    const lowercaseQuery = query.toLowerCase();

    return docs.filter(doc => {
      const matchesQuery =
        doc.title.toLowerCase().includes(lowercaseQuery) ||
        doc.description.toLowerCase().includes(lowercaseQuery) ||
        doc.content.toLowerCase().includes(lowercaseQuery) ||
        doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));

      const matchesCategory = !category || doc.category === category;

      return matchesQuery && matchesCategory;
    });
  }

  getAllAPISpecs() {
    return Array.from(this.apiSpecs.values());
  }

  getAPISpec(id) {
    return this.apiSpecs.get(id);
  }

  getAllSDKGuides() {
    return Array.from(this.sdkGuides.values());
  }

  getSDKGuide(id) {
    return this.sdkGuides.get(id);
  }

  recordPageView(pageId, userAgent = 'unknown') {
    const today = new Date().toISOString().split('T')[0];
    const key = `${pageId}-${today}`;

    if (!this.analytics.pageViews.has(key)) {
      this.analytics.pageViews.set(key, { count: 0, unique: new Set() });
    }

    const pageData = this.analytics.pageViews.get(key);
    pageData.count++;
    pageData.unique.add(userAgent);
  }

  recordSearchQuery(query) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${query}-${today}`;

    if (!this.analytics.searchQueries.has(key)) {
      this.analytics.searchQueries.set(key, 0);
    }

    this.analytics.searchQueries.set(key, this.analytics.searchQueries.get(key) + 1);
  }

  getAnalytics(timeRange = '7d') {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (timeRange === '7d' ? 7 : 30));

    const pageViews = Array.from(this.analytics.pageViews.entries())
      .filter(([key]) => {
        const date = key.split('-').slice(-3).join('-');
        return new Date(date) >= cutoffDate;
      })
      .reduce((sum, [, data]) => sum + data.count, 0);

    const uniqueVisitors = new Set();
    Array.from(this.analytics.pageViews.entries())
      .filter(([key]) => {
        const date = key.split('-').slice(-3).join('-');
        return new Date(date) >= cutoffDate;
      })
      .forEach(([, data]) => {
        data.unique.forEach(visitor => uniqueVisitors.add(visitor));
      });

    const popularQueries = Array.from(this.analytics.searchQueries.entries())
      .filter(([key]) => {
        const date = key.split('-').slice(-3).join('-');
        return new Date(date) >= cutoffDate;
      })
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query: query.split('-').slice(0, -3).join('-'), count }));

    return {
      timeRange,
      pageViews,
      uniqueVisitors: uniqueVisitors.size,
      totalDocuments: this.documentation.size,
      totalAPISpecs: this.apiSpecs.size,
      totalSDKGuides: this.sdkGuides.size,
      popularQueries,
      generatedAt: new Date().toISOString()
    };
  }
}

// Initialize service
const docsService = new DocsService();

// API Routes
app.get('/api/docs', (req, res) => {
  try {
    const { category, search } = req.query;
    let docs;

    if (search) {
      docs = docsService.searchDocumentation(search, category);
      docsService.recordSearchQuery(search);
    } else if (category) {
      docs = docsService.getAllDocumentation().filter(doc => doc.category === category);
    } else {
      docs = docsService.getAllDocumentation();
    }

    res.json({
      success: true,
      data: docs,
      meta: {
        total: docs.length,
        query: search || null,
        category: category || null
      }
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/docs/:id', (req, res) => {
  try {
    const doc = docsService.getDocumentation(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Documentation not found' });
    }

    docsService.recordPageView(req.params.id, req.get('User-Agent'));

    res.json({
      success: true,
      data: doc
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/specs', (req, res) => {
  try {
    const specs = docsService.getAllAPISpecs();
    res.json({
      success: true,
      data: specs,
      meta: {
        total: specs.length
      }
    });
  } catch (error) {
    console.error('Error fetching API specs:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/sdks', (req, res) => {
  try {
    const guides = docsService.getAllSDKGuides();
    res.json({
      success: true,
      data: guides,
      meta: {
        total: guides.length
      }
    });
  } catch (error) {
    console.error('Error fetching SDK guides:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/search', (req, res) => {
  try {
    const { q: query, category, type } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter is required' });
    }

    let results = [];

    if (!type || type === 'docs') {
      const docs = docsService.searchDocumentation(query, category);
      results.push(...docs.map(doc => ({ ...doc, type: 'documentation' })));
    }

    if (!type || type === 'api') {
      const apis = docsService.getAllAPISpecs().filter(spec =>
        spec.title.toLowerCase().includes(query.toLowerCase()) ||
        spec.description.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...apis.map(api => ({ ...api, type: 'api' })));
    }

    if (!type || type === 'sdk') {
      const sdks = docsService.getAllSDKGuides().filter(guide =>
        guide.title.toLowerCase().includes(query.toLowerCase()) ||
        guide.description.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...sdks.map(sdk => ({ ...sdk, type: 'sdk' })));
    }

    docsService.recordSearchQuery(query);

    res.json({
      success: true,
      data: results,
      meta: {
        total: results.length,
        query,
        category: category || null,
        type: type || 'all'
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/analytics', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const analytics = docsService.getAnalytics(timeRange);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'docs',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      metrics: {
        totalDocs: docsService.documentation.size,
        totalAPISpecs: docsService.apiSpecs.size,
        totalSDKGuides: docsService.sdkGuides.size,
        uptime: process.uptime()
      }
    }
  });
});

// Frontend route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Codai Documentation Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    </head>
    <body class="bg-gray-50 min-h-screen" x-data="docsApp()">
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-gray-900">Codai Documentation</h1>
                        <span class="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">v1.0.0</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <input 
                                type="text" 
                                placeholder="Search documentation..." 
                                x-model="searchQuery"
                                @input="performSearch"
                                class="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <nav class="bg-white border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex space-x-8">
                    <button 
                        @click="activeTab = 'docs'" 
                        :class="activeTab === 'docs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                        class="py-4 px-1 border-b-2 font-medium text-sm"
                    >
                        Documentation
                    </button>
                    <button 
                        @click="activeTab = 'api'" 
                        :class="activeTab === 'api' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                        class="py-4 px-1 border-b-2 font-medium text-sm"
                    >
                        API Reference
                    </button>
                    <button 
                        @click="activeTab = 'sdk'" 
                        :class="activeTab === 'sdk' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                        class="py-4 px-1 border-b-2 font-medium text-sm"
                    >
                        SDK Guides
                    </button>
                    <button 
                        @click="activeTab = 'analytics'" 
                        :class="activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                        class="py-4 px-1 border-b-2 font-medium text-sm"
                    >
                        Analytics
                    </button>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Search Results -->
            <div x-show="searchResults.length > 0 && searchQuery" class="mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Search Results</h2>
                <div class="space-y-4">
                    <template x-for="result in searchResults" :key="result.id">
                        <div class="bg-white rounded-lg shadow-sm border p-6">
                            <h3 class="text-lg font-medium text-gray-900" x-text="result.title"></h3>
                            <p class="text-sm text-gray-500 mt-1" x-text="result.description"></p>
                            <div class="flex items-center mt-2 space-x-2">
                                <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded" x-text="result.type"></span>
                                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded" x-text="result.category || result.service || result.language"></span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Documentation Tab -->
            <div x-show="activeTab === 'docs'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <template x-for="doc in docs" :key="doc.id">
                        <div class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                            <h3 class="text-lg font-medium text-gray-900" x-text="doc.title"></h3>
                            <p class="text-sm text-gray-500 mt-1" x-text="doc.description"></p>
                            <div class="flex items-center mt-3 space-x-2">
                                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded" x-text="doc.category"></span>
                                <span class="text-xs text-gray-400" x-text="'Updated ' + new Date(doc.lastUpdated).toLocaleDateString()"></span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- API Reference Tab -->
            <div x-show="activeTab === 'api'" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <template x-for="spec in apiSpecs" :key="spec.id">
                        <div class="bg-white rounded-lg shadow-sm border p-6">
                            <h3 class="text-lg font-medium text-gray-900" x-text="spec.title"></h3>
                            <p class="text-sm text-gray-500 mt-1" x-text="spec.description"></p>
                            <div class="flex items-center mt-2 space-x-2">
                                <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded" x-text="spec.service"></span>
                                <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded" x-text="spec.version"></span>
                            </div>
                            <div class="space-y-2 mt-4">
                                <template x-for="endpoint in spec.endpoints.slice(0, 3)" :key="endpoint.path">
                                    <div class="flex items-center justify-between text-sm">
                                        <span class="font-mono text-gray-600" x-text="endpoint.method + ' ' + endpoint.path"></span>
                                        <span class="text-gray-400" x-text="endpoint.summary"></span>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- SDK Guides Tab -->
            <div x-show="activeTab === 'sdk'" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <template x-for="guide in sdkGuides" :key="guide.id">
                        <div class="bg-white rounded-lg shadow-sm border p-6">
                            <h3 class="text-lg font-medium text-gray-900" x-text="guide.title"></h3>
                            <p class="text-sm text-gray-500 mt-1" x-text="guide.description"></p>
                            <div class="flex items-center mt-2 space-x-2">
                                <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded" x-text="guide.language"></span>
                                <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded" x-text="guide.version"></span>
                            </div>
                            <div class="bg-gray-50 rounded p-4 mt-4">
                                <pre class="text-sm text-gray-800 overflow-x-auto"><code x-text="guide.quickStart"></code></pre>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Analytics Tab -->
            <div x-show="activeTab === 'analytics'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white rounded-lg shadow-sm border p-6">
                        <div class="flex items-center">
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Total Documents</p>
                                <p class="text-2xl font-semibold text-gray-900" x-text="analytics.totalDocuments"></p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border p-6">
                        <div class="flex items-center">
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Page Views (7d)</p>
                                <p class="text-2xl font-semibold text-gray-900" x-text="analytics.pageViews"></p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border p-6">
                        <div class="flex items-center">
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Unique Visitors</p>
                                <p class="text-2xl font-semibold text-gray-900" x-text="analytics.uniqueVisitors"></p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border p-6">
                        <div class="flex items-center">
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">API Specs</p>
                                <p class="text-2xl font-semibold text-gray-900" x-text="analytics.totalAPISpecs"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <script>
            function docsApp() {
                return {
                    activeTab: 'docs',
                    searchQuery: '',
                    searchResults: [],
                    docs: [],
                    apiSpecs: [],
                    sdkGuides: [],
                    analytics: {
                        totalDocuments: 0,
                        pageViews: 0,
                        uniqueVisitors: 0,
                        totalAPISpecs: 0,
                        popularQueries: []
                    },

                    async init() {
                        await this.loadDocs();
                        await this.loadAPISpecs();
                        await this.loadSDKGuides();
                        await this.loadAnalytics();
                    },

                    async loadDocs() {
                        try {
                            const response = await fetch('/api/docs');
                            const result = await response.json();
                            if (result.success) {
                                this.docs = result.data;
                            }
                        } catch (error) {
                            console.error('Error loading docs:', error);
                        }
                    },

                    async loadAPISpecs() {
                        try {
                            const response = await fetch('/api/specs');
                            const result = await response.json();
                            if (result.success) {
                                this.apiSpecs = result.data;
                            }
                        } catch (error) {
                            console.error('Error loading API specs:', error);
                        }
                    },

                    async loadSDKGuides() {
                        try {
                            const response = await fetch('/api/sdks');
                            const result = await response.json();
                            if (result.success) {
                                this.sdkGuides = result.data;
                            }
                        } catch (error) {
                            console.error('Error loading SDK guides:', error);
                        }
                    },

                    async loadAnalytics() {
                        try {
                            const response = await fetch('/api/analytics');
                            const result = await response.json();
                            if (result.success) {
                                this.analytics = result.data;
                            }
                        } catch (error) {
                            console.error('Error loading analytics:', error);
                        }
                    },

                    async performSearch() {
                        if (this.searchQuery.length < 2) {
                            this.searchResults = [];
                            return;
                        }

                        try {
                            const response = await fetch(\`/api/search?q=\${encodeURIComponent(this.searchQuery)}\`);
                            const result = await response.json();
                            if (result.success) {
                                this.searchResults = result.data;
                            }
                        } catch (error) {
                            console.error('Error performing search:', error);
                        }
                    }
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`🚀 Codai Documentation Platform started successfully`);
  console.log(`📖 Server: http://localhost:${PORT}`);
  console.log(`🔍 Search API: http://localhost:${PORT}/api/search`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`📚 Features: Documentation, API specs, SDK guides, Search, Analytics`);
  console.log(`🎯 Status: Ready for comprehensive developer documentation`);
});
