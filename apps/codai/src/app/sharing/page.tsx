'use client';

import React, { useState } from 'react';
import {
    Code,
    Plus,
    Search,
    Filter,
    Settings,
    Edit,
    Trash2,
    Share,
    Eye,
    Copy,
    Download,
    Star,
    Clock,
    Users,
    Tag,
    GitBranch,
    ChevronRight,
    ChevronDown,
    MoreVertical,
    RefreshCw,
    Grid,
    List,
    SortAsc,
    SortDesc,
    Calendar,
    User,
    ThumbsUp,
    MessageSquare,
    History,
    File,
    Folder,
    Archive,
    Lock,
    Globe,
    Shield,
    Bell,
    Bookmark,
    Zap,
    Target,
    Award,
    TrendingUp,
    Database,
    Cpu,
    Network,
    Layers,
    FileText,
    CheckCircle,
    AlertCircle,
    Heart,
    Flame,
    Coffee,
    Terminal,
    Package,
    Workflow,
    PlayCircle,
    StopCircle,
    Monitor,
    Smartphone,
    Globe2,
    Server
} from 'lucide-react';

export default function CodeSharingPage() {
    const [selectedView, setSelectedView] = useState('snippets');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recent');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const programmingLanguages = [
        { name: 'JavaScript', count: 45, color: 'bg-yellow-100 text-yellow-600' },
        { name: 'TypeScript', count: 38, color: 'bg-blue-100 text-blue-600' },
        { name: 'Python', count: 32, color: 'bg-green-100 text-green-600' },
        { name: 'React', count: 28, color: 'bg-cyan-100 text-cyan-600' },
        { name: 'Node.js', count: 24, color: 'bg-emerald-100 text-emerald-600' },
        { name: 'CSS', count: 19, color: 'bg-pink-100 text-pink-600' },
        { name: 'Go', count: 15, color: 'bg-indigo-100 text-indigo-600' },
        { name: 'Rust', count: 12, color: 'bg-orange-100 text-orange-600' }
    ];

    const codeCategories = [
        {
            id: 1,
            name: 'UI Components',
            description: 'Reusable React components and UI elements',
            count: 67,
            icon: Monitor,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            id: 2,
            name: 'Utilities',
            description: 'Helper functions, validators, and utility libraries',
            count: 89,
            icon: Zap,
            color: 'bg-green-100 text-green-600'
        },
        {
            id: 3,
            name: 'API Patterns',
            description: 'REST API endpoints, GraphQL resolvers, and data fetching',
            count: 45,
            icon: Server,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            id: 4,
            name: 'Hooks & Logic',
            description: 'Custom React hooks and business logic patterns',
            count: 34,
            icon: GitBranch,
            color: 'bg-orange-100 text-orange-600'
        },
        {
            id: 5,
            name: 'Animations',
            description: 'CSS animations, transitions, and motion components',
            count: 23,
            icon: PlayCircle,
            color: 'bg-pink-100 text-pink-600'
        },
        {
            id: 6,
            name: 'DevOps Scripts',
            description: 'Deployment scripts, CI/CD configurations, and automation',
            count: 18,
            icon: Terminal,
            color: 'bg-gray-100 text-gray-600'
        }
    ];

    const codeSnippets = [
        {
            id: 1,
            title: 'useDebounce Hook',
            description: 'Custom React hook for debouncing state updates and API calls',
            language: 'TypeScript',
            category: 'Hooks & Logic',
            author: 'Alice Smith',
            createdAt: '2 hours ago',
            updatedAt: '1 hour ago',
            views: 234,
            likes: 45,
            forks: 12,
            comments: 8,
            tags: ['React', 'Hooks', 'Performance', 'Debounce'],
            isPublic: true,
            isFeatured: true,
            isBookmarked: true,
            difficulty: 'intermediate',
            codePreview: `const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};`,
            stats: { lines: 12, chars: 245, functions: 1 }
        },
        {
            id: 2,
            title: 'API Error Handler Middleware',
            description: 'Express.js middleware for centralized error handling and logging',
            language: 'JavaScript',
            category: 'API Patterns',
            author: 'Bob Johnson',
            createdAt: '1 day ago',
            updatedAt: '6 hours ago',
            views: 189,
            likes: 32,
            forks: 8,
            comments: 5,
            tags: ['Express', 'Middleware', 'Error Handling', 'API'],
            isPublic: true,
            isFeatured: false,
            isBookmarked: false,
            difficulty: 'advanced',
            codePreview: `const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  console.error('[ERROR]', {
    message: err.message,
    stack: isDev ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const statusCode = err.statusCode || 500;
  const message = isDev ? err.message : 'Internal Server Error';
  
  res.status(statusCode).json({
    error: true,
    message,
    ...(isDev && { stack: err.stack })
  });
};`,
            stats: { lines: 18, chars: 567, functions: 1 }
        },
        {
            id: 3,
            title: 'Responsive Card Component',
            description: 'Flexible React card component with Tailwind CSS styling',
            language: 'React',
            category: 'UI Components',
            author: 'Carol Wilson',
            createdAt: '3 hours ago',
            updatedAt: '2 hours ago',
            views: 156,
            likes: 28,
            forks: 15,
            comments: 12,
            tags: ['React', 'Components', 'Tailwind', 'UI'],
            isPublic: true,
            isFeatured: true,
            isBookmarked: true,
            difficulty: 'beginner',
            codePreview: `interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={\`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow \${className}\`}
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
};`,
            stats: { lines: 25, chars: 678, functions: 1 }
        },
        {
            id: 4,
            title: 'Form Validation Schema',
            description: 'Zod schema for user registration form validation',
            language: 'TypeScript',
            category: 'Utilities',
            author: 'David Brown',
            createdAt: '5 hours ago',
            updatedAt: '4 hours ago',
            views: 123,
            likes: 19,
            forks: 6,
            comments: 3,
            tags: ['Zod', 'Validation', 'Forms', 'TypeScript'],
            isPublic: true,
            isFeatured: false,
            isBookmarked: false,
            difficulty: 'intermediate',
            codePreview: `import { z } from 'zod';

const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type UserRegistration = z.infer<typeof userRegistrationSchema>;`,
            stats: { lines: 20, chars: 789, functions: 1 }
        },
        {
            id: 5,
            title: 'Docker Multi-Stage Build',
            description: 'Optimized Dockerfile for Node.js applications with multi-stage build',
            language: 'Docker',
            category: 'DevOps Scripts',
            author: 'Emma Davis',
            createdAt: '1 hour ago',
            updatedAt: '30 minutes ago',
            views: 87,
            likes: 15,
            forks: 4,
            comments: 2,
            tags: ['Docker', 'DevOps', 'Node.js', 'Optimization'],
            isPublic: true,
            isFeatured: false,
            isBookmarked: true,
            difficulty: 'advanced',
            codePreview: `# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]`,
            stats: { lines: 16, chars: 456, functions: 0 }
        },
        {
            id: 6,
            title: 'CSS Loading Animation',
            description: 'Pure CSS loading spinner with smooth animation',
            language: 'CSS',
            category: 'Animations',
            author: 'Frank Miller',
            createdAt: '6 hours ago',
            updatedAt: '5 hours ago',
            views: 201,
            likes: 38,
            forks: 22,
            comments: 7,
            tags: ['CSS', 'Animation', 'Loading', 'UI'],
            isPublic: true,
            isFeatured: true,
            isBookmarked: false,
            difficulty: 'beginner',
            codePreview: `.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}`,
            stats: { lines: 16, chars: 389, functions: 0 }
        }
    ];

    const repositories = [
        {
            id: 1,
            name: 'codai-ui-components',
            description: 'Comprehensive React component library for CODAI platform',
            language: 'TypeScript',
            stars: 234,
            forks: 45,
            contributors: 12,
            lastCommit: '2 hours ago',
            isPrivate: false,
            topics: ['react', 'components', 'ui', 'typescript'],
            size: '2.4 MB'
        },
        {
            id: 2,
            name: 'api-utils-collection',
            description: 'Collection of utility functions for API development',
            language: 'JavaScript',
            stars: 189,
            forks: 32,
            contributors: 8,
            lastCommit: '1 day ago',
            isPrivate: false,
            topics: ['api', 'utilities', 'express', 'middleware'],
            size: '1.8 MB'
        },
        {
            id: 3,
            name: 'devops-automation-scripts',
            description: 'Automation scripts for deployment and infrastructure management',
            language: 'Shell',
            stars: 156,
            forks: 28,
            contributors: 6,
            lastCommit: '3 hours ago',
            isPrivate: true,
            topics: ['devops', 'automation', 'deployment', 'scripts'],
            size: '892 KB'
        }
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'created',
            user: 'Alice Smith',
            action: 'shared new snippet',
            target: 'useDebounce Hook',
            timestamp: '15 minutes ago',
            language: 'TypeScript'
        },
        {
            id: 2,
            type: 'forked',
            user: 'Bob Johnson',
            action: 'forked snippet',
            target: 'API Error Handler',
            timestamp: '1 hour ago',
            language: 'JavaScript'
        },
        {
            id: 3,
            type: 'starred',
            user: 'Carol Wilson',
            action: 'starred repository',
            target: 'codai-ui-components',
            timestamp: '2 hours ago',
            language: 'TypeScript'
        },
        {
            id: 4,
            type: 'commented',
            user: 'David Brown',
            action: 'commented on',
            target: 'Form Validation Schema',
            timestamp: '3 hours ago',
            language: 'TypeScript'
        },
        {
            id: 5,
            type: 'updated',
            user: 'Emma Davis',
            action: 'updated snippet',
            target: 'Docker Multi-Stage Build',
            timestamp: '4 hours ago',
            language: 'Docker'
        }
    ];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-600';
            case 'intermediate': return 'bg-yellow-100 text-yellow-600';
            case 'advanced': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getLanguageColor = (language: string) => {
        const colors: Record<string, string> = {
            'JavaScript': 'bg-yellow-100 text-yellow-600',
            'TypeScript': 'bg-blue-100 text-blue-600',
            'Python': 'bg-green-100 text-green-600',
            'React': 'bg-cyan-100 text-cyan-600',
            'CSS': 'bg-pink-100 text-pink-600',
            'Docker': 'bg-blue-100 text-blue-600',
            'Shell': 'bg-gray-100 text-gray-600'
        };
        return colors[language] || 'bg-gray-100 text-gray-600';
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'created': return <Plus className="w-4 h-4 text-green-600" />;
            case 'forked': return <GitBranch className="w-4 h-4 text-blue-600" />;
            case 'starred': return <Star className="w-4 h-4 text-yellow-600" />;
            case 'commented': return <MessageSquare className="w-4 h-4 text-purple-600" />;
            case 'updated': return <Edit className="w-4 h-4 text-orange-600" />;
            default: return <Code className="w-4 h-4 text-gray-400" />;
        }
    };

    const filteredSnippets = codeSnippets.filter(snippet => {
        const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage;
        const matchesCategory = selectedCategory === 'all' || snippet.category === selectedCategory;
        const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesLanguage && matchesCategory && matchesSearch;
    });

    const codeStats = {
        totalSnippets: codeSnippets.length,
        totalViews: codeSnippets.reduce((sum, snippet) => sum + snippet.views, 0),
        totalLikes: codeSnippets.reduce((sum, snippet) => sum + snippet.likes, 0),
        totalForks: codeSnippets.reduce((sum, snippet) => sum + snippet.forks, 0)
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Code Sharing</h1>
                    <p className="text-gray-600 mt-1">
                        Share, discover, and collaborate on code snippets and repositories
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Share Code
                    </button>
                </div>
            </div>

            {/* Code Sharing Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{codeStats.totalSnippets}</div>
                            <div className="text-sm text-gray-500">Code Snippets</div>
                        </div>
                        <Code className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-green-600">{codeStats.totalViews}</div>
                            <div className="text-sm text-gray-500">Total Views</div>
                        </div>
                        <Eye className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{codeStats.totalLikes}</div>
                            <div className="text-sm text-gray-500">Total Likes</div>
                        </div>
                        <Heart className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-orange-600">{codeStats.totalForks}</div>
                            <div className="text-sm text-gray-500">Total Forks</div>
                        </div>
                        <GitBranch className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'snippets', name: 'Code Snippets', icon: Code },
                            { id: 'repositories', name: 'Repositories', icon: GitBranch },
                            { id: 'categories', name: 'Categories', icon: Folder },
                            { id: 'languages', name: 'Languages', icon: FileText },
                            { id: 'activity', name: 'Activity', icon: History }
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedView(tab.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${selectedView === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <TabIcon className="w-4 h-4 mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {selectedView === 'snippets' && (
                        <div className="space-y-6">
                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search code snippets..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Languages</option>
                                        {programmingLanguages.map(lang => (
                                            <option key={lang.name} value={lang.name}>{lang.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Categories</option>
                                        {codeCategories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="liked">Most Liked</option>
                                        <option value="forked">Most Forked</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-gray-500 ml-4">
                                        {filteredSnippets.length} snippets
                                    </span>
                                </div>
                            </div>

                            {/* Featured Snippets */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Snippets</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSnippets.filter(snippet => snippet.isFeatured).map((snippet) => (
                                        <div key={snippet.id} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                                    <span className="text-sm font-medium text-blue-600">Featured</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(snippet.language)}`}>
                                                        {snippet.language}
                                                    </span>
                                                    {snippet.isBookmarked && <Bookmark className="w-4 h-4 text-blue-500 fill-current" />}
                                                </div>
                                            </div>

                                            <h4 className="font-semibold text-gray-900 mb-2">{snippet.title}</h4>
                                            <p className="text-sm text-gray-600 mb-4">{snippet.description}</p>

                                            <div className="bg-gray-900 rounded-lg p-3 mb-4 overflow-hidden">
                                                <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                                                    <code>{snippet.codePreview.slice(0, 150)}...</code>
                                                </pre>
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{snippet.views}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Heart className="w-4 h-4" />
                                                        <span>{snippet.likes}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <GitBranch className="w-4 h-4" />
                                                        <span>{snippet.forks}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(snippet.difficulty)}`}>
                                                    {snippet.difficulty}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">{snippet.author}</span>
                                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                    View Code
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* All Snippets */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Snippets</h3>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredSnippets.map((snippet) => (
                                            <div key={snippet.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(snippet.language)}`}>
                                                            {snippet.language}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(snippet.difficulty)}`}>
                                                            {snippet.difficulty}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {snippet.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                                        {snippet.isBookmarked && <Bookmark className="w-4 h-4 text-blue-500 fill-current" />}
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h4 className="font-semibold text-gray-900 mb-2">{snippet.title}</h4>
                                                <p className="text-sm text-gray-600 mb-4">{snippet.description}</p>

                                                <div className="bg-gray-900 rounded-lg p-3 mb-4 overflow-hidden">
                                                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                                                        <code>{snippet.codePreview.slice(0, 120)}...</code>
                                                    </pre>
                                                </div>

                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {snippet.tags.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {snippet.tags.length > 3 && (
                                                        <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                                            +{snippet.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-1">
                                                            <Eye className="w-4 h-4" />
                                                            <span>{snippet.views}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Heart className="w-4 h-4" />
                                                            <span>{snippet.likes}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <GitBranch className="w-4 h-4" />
                                                            <span>{snippet.forks}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {snippet.stats.lines} lines
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                                                    <span className="text-gray-600">{snippet.author}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                                                            <GitBranch className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredSnippets.map((snippet) => (
                                            <div key={snippet.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(snippet.language)}`}>
                                                                {snippet.language}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(snippet.difficulty)}`}>
                                                                {snippet.difficulty}
                                                            </span>
                                                            {snippet.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                                            {snippet.isBookmarked && <Bookmark className="w-4 h-4 text-blue-500 fill-current" />}
                                                        </div>

                                                        <h4 className="font-semibold text-gray-900 mb-1">{snippet.title}</h4>
                                                        <p className="text-sm text-gray-600 mb-2">{snippet.description}</p>

                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>{snippet.author}</span>
                                                            <span>{snippet.createdAt}</span>
                                                            <span>{snippet.category}</span>
                                                            <span>{snippet.stats.lines} lines</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4 ml-4">
                                                        <div className="text-center">
                                                            <div className="text-sm font-medium text-gray-900">{snippet.views}</div>
                                                            <div className="text-xs text-gray-500">views</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-medium text-gray-900">{snippet.likes}</div>
                                                            <div className="text-xs text-gray-500">likes</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-medium text-gray-900">{snippet.forks}</div>
                                                            <div className="text-xs text-gray-500">forks</div>
                                                        </div>
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedView === 'repositories' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {repositories.map((repo) => (
                                    <div key={repo.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <GitBranch className="w-5 h-5 text-gray-600" />
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(repo.language)}`}>
                                                    {repo.language}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {repo.isPrivate ? (
                                                    <Lock className="w-4 h-4 text-red-600" />
                                                ) : (
                                                    <Globe className="w-4 h-4 text-green-600" />
                                                )}
                                            </div>
                                        </div>

                                        <h4 className="font-semibold text-gray-900 mb-2">{repo.name}</h4>
                                        <p className="text-sm text-gray-600 mb-4">{repo.description}</p>

                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {repo.topics.map((topic, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-4 h-4" />
                                                    <span>{repo.stars}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <GitBranch className="w-4 h-4" />
                                                    <span>{repo.forks}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{repo.contributors}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{repo.size}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                                            <span className="text-gray-500">Updated {repo.lastCommit}</span>
                                            <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                View Repository
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedView === 'categories' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {codeCategories.map((category) => {
                                const CategoryIcon = category.icon;
                                return (
                                    <div key={category.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color}`}>
                                                <CategoryIcon className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs text-gray-500">{category.count} snippets</span>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{category.description}</p>

                                        <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Browse Category
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedView === 'languages' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {programmingLanguages.map((language) => (
                                <div key={language.name} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-2 rounded-lg font-medium ${language.color}`}>
                                            {language.name}
                                        </span>
                                        <Code className="w-6 h-6 text-gray-400" />
                                    </div>

                                    <div className="text-2xl font-bold text-gray-900 mb-1">{language.count}</div>
                                    <div className="text-sm text-gray-600">snippets</div>

                                    <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        View Snippets
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedView === 'activity' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900">{activity.user}</span>
                                            <span className="text-gray-600"> {activity.action} </span>
                                            <span className="font-medium text-gray-900">{activity.target}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {activity.language} • {activity.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Code Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Share Code Snippet</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <MoreVertical className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Snippet Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter snippet title..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief description of the code snippet..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Language
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        {programmingLanguages.map(lang => (
                                            <option key={lang.name} value={lang.name}>{lang.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        {codeCategories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Difficulty Level
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="react, hooks, performance..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Code
                                </label>
                                <textarea
                                    rows={6}
                                    placeholder="Paste your code here..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="mr-2" defaultChecked />
                                        Public
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="mr-2" />
                                        Allow forks
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Share Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
