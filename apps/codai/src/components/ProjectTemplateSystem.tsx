'use client';

import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    Star,
    StarOff,
    Eye,
    Code,
    Users,
    Clock,
    Tag,
    Zap,
    Database,
    Globe,
    Smartphone,
    Brain,
    DollarSign,
    Palette,
    Shield,
    Rocket,
    ChevronDown,
    CheckCircle
} from 'lucide-react';

interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: 'web' | 'mobile' | 'api' | 'ai' | 'blockchain' | 'saas' | 'ecommerce' | 'fintech';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    techStack: string[];
    features: string[];
    estimatedTime: string;
    downloads: number;
    rating: number;
    reviews: number;
    author: {
        name: string;
        avatar: string;
        verified: boolean;
    };
    preview: string;
    thumbnail: string;
    tags: string[];
    isStarred: boolean;
    lastUpdated: Date;
    dependencies: {
        name: string;
        version: string;
    }[];
    files: {
        path: string;
        content: string;
    }[];
}

const TEMPLATE_CATEGORIES = [
    { id: 'all', name: 'All Templates', icon: Code, color: 'text-gray-600' },
    { id: 'web', name: 'Web Apps', icon: Globe, color: 'text-blue-600' },
    { id: 'mobile', name: 'Mobile Apps', icon: Smartphone, color: 'text-green-600' },
    { id: 'api', name: 'API Services', icon: Database, color: 'text-purple-600' },
    { id: 'ai', name: 'AI/ML', icon: Brain, color: 'text-orange-600' },
    { id: 'blockchain', name: 'Blockchain', icon: Shield, color: 'text-yellow-600' },
    { id: 'saas', name: 'SaaS', icon: Rocket, color: 'text-indigo-600' },
    { id: 'ecommerce', name: 'E-commerce', icon: DollarSign, color: 'text-emerald-600' },
    { id: 'fintech', name: 'FinTech', icon: Zap, color: 'text-red-600' }
];

export default function ProjectTemplateSystem() {
    const [templates, setTemplates] = useState<ProjectTemplate[]>([
        {
            id: 'template-1',
            name: 'AI-Powered Dashboard',
            description: 'Modern React dashboard with AI analytics, real-time data visualization, and intelligent insights.',
            category: 'ai',
            difficulty: 'intermediate',
            techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'OpenAI API', 'Chart.js'],
            features: [
                'AI-powered analytics',
                'Real-time data streams',
                'Interactive charts',
                'Dark/light mode',
                'Responsive design',
                'Export capabilities'
            ],
            estimatedTime: '4-6 hours',
            downloads: 2847,
            rating: 4.8,
            reviews: 156,
            author: {
                name: 'Codai Team',
                avatar: '/api/placeholder/32/32',
                verified: true
            },
            preview: 'https://ai-dashboard-preview.codai.ro',
            thumbnail: '/api/placeholder/300/200',
            tags: ['dashboard', 'ai', 'analytics', 'charts'],
            isStarred: true,
            lastUpdated: new Date('2025-06-25'),
            dependencies: [
                { name: 'react', version: '^18.3.1' },
                { name: 'next', version: '^15.1.0' },
                { name: 'typescript', version: '^5.0.0' },
                { name: 'tailwindcss', version: '^3.4.0' }
            ],
            files: [
                {
                    path: 'pages/dashboard.tsx',
                    content: '// AI Dashboard Component\nexport default function Dashboard() {\n  return <div>AI Dashboard</div>;\n}'
                }
            ]
        },
        {
            id: 'template-2',
            name: 'Crypto Trading Bot',
            description: 'Intelligent cryptocurrency trading bot with ML predictions and risk management.',
            category: 'blockchain',
            difficulty: 'advanced',
            techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'TensorFlow', 'WebSocket'],
            features: [
                'ML price prediction',
                'Automated trading',
                'Risk management',
                'Portfolio tracking',
                'Real-time alerts',
                'Backtesting'
            ],
            estimatedTime: '8-12 hours',
            downloads: 1523,
            rating: 4.6,
            reviews: 89,
            author: {
                name: 'CryptoAI Labs',
                avatar: '/api/placeholder/32/32',
                verified: true
            },
            preview: 'https://crypto-bot-demo.codai.ro',
            thumbnail: '/api/placeholder/300/200',
            tags: ['crypto', 'trading', 'bot', 'ml', 'fintech'],
            isStarred: false,
            lastUpdated: new Date('2025-06-20'),
            dependencies: [
                { name: 'fastapi', version: '^0.104.1' },
                { name: 'tensorflow', version: '^2.15.0' },
                { name: 'ccxt', version: '^4.1.0' }
            ],
            files: [
                {
                    path: 'main.py',
                    content: '# Crypto Trading Bot\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\ndef root():\n    return {"message": "Crypto Bot API"}'
                }
            ]
        },
        {
            id: 'template-3',
            name: 'SaaS Starter Kit',
            description: 'Complete SaaS application with authentication, billing, and team management.',
            category: 'saas',
            difficulty: 'intermediate',
            techStack: ['Next.js', 'TypeScript', 'Prisma', 'Stripe', 'NextAuth', 'Tailwind CSS'],
            features: [
                'User authentication',
                'Subscription billing',
                'Team collaboration',
                'Admin dashboard',
                'Email notifications',
                'Analytics tracking'
            ],
            estimatedTime: '6-10 hours',
            downloads: 5672,
            rating: 4.9,
            reviews: 234,
            author: {
                name: 'SaaS Masters',
                avatar: '/api/placeholder/32/32',
                verified: true
            },
            preview: 'https://saas-starter.codai.ro',
            thumbnail: '/api/placeholder/300/200',
            tags: ['saas', 'stripe', 'auth', 'billing'],
            isStarred: true,
            lastUpdated: new Date('2025-06-28'),
            dependencies: [
                { name: 'next', version: '^15.1.0' },
                { name: 'prisma', version: '^5.8.0' },
                { name: 'stripe', version: '^14.10.0' },
                { name: 'next-auth', version: '^4.24.0' }
            ],
            files: [
                {
                    path: 'pages/api/auth/[...nextauth].ts',
                    content: '// NextAuth configuration\nimport NextAuth from "next-auth"\n\nexport default NextAuth({\n  // Configuration\n})'
                }
            ]
        }
    ]);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent'>('popular');
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'popular':
                return b.downloads - a.downloads;
            case 'rating':
                return b.rating - a.rating;
            case 'recent':
                return b.lastUpdated.getTime() - a.lastUpdated.getTime();
            default:
                return 0;
        }
    });

    const toggleStar = (templateId: string) => {
        setTemplates(prev => prev.map(template =>
            template.id === templateId
                ? { ...template, isStarred: !template.isStarred }
                : template
        ));
    };

    const useTemplate = (template: ProjectTemplate) => {
        // In a real implementation, this would:
        // 1. Create a new project from the template
        // 2. Set up the file structure
        // 3. Install dependencies
        // 4. Initialize git repository
        // 5. Open in the workspace

        console.log('Using template:', template.name);
        alert(`Creating new project from "${template.name}" template...`);
    };

    const getDifficultyColor = (difficulty: ProjectTemplate['difficulty']) => {
        switch (difficulty) {
            case 'beginner': return 'text-green-600 bg-green-50';
            case 'intermediate': return 'text-yellow-600 bg-yellow-50';
            case 'advanced': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getCategoryIcon = (category: ProjectTemplate['category']) => {
        const categoryData = TEMPLATE_CATEGORIES.find(c => c.id === category);
        return categoryData ? categoryData.icon : Code;
    };

    return (
        <div className="h-full flex bg-gray-50">
            {/* Sidebar - Categories & Filters */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Project Templates</h2>
                    <p className="text-sm text-gray-600">
                        Jump-start your projects with pre-built templates
                    </p>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex-1 p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
                    <div className="space-y-1">
                        {TEMPLATE_CATEGORIES.map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${selectedCategory === category.id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${selectedCategory === category.id ? 'text-blue-600' : category.color}`} />
                                    <span className="text-sm font-medium">{category.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort Options */}
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Sort By</h3>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="recent">Recently Updated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {selectedCategory === 'all' ? 'All Templates' :
                                    TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedTemplate(null)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Custom</span>
                        </button>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template) => {
                            const CategoryIcon = getCategoryIcon(template.category);

                            return (
                                <div
                                    key={template.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <CategoryIcon className="w-16 h-16 text-white/30" />
                                        </div>
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                                                {template.difficulty}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStar(template.id);
                                            }}
                                            className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                        >
                                            {template.isStarred ? (
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            ) : (
                                                <StarOff className="w-4 h-4 text-white/70" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
                                            {template.author.verified && (
                                                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                                            )}
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {template.description}
                                        </p>

                                        {/* Tech Stack */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {template.techStack.slice(0, 3).map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                            {template.techStack.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                    +{template.techStack.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                                    <span>{template.rating}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Download className="w-3 h-3 mr-1" />
                                                    <span>{template.downloads.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                <span>{template.estimatedTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                            <p className="text-gray-500">
                                Try adjusting your search criteria or browse different categories
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Template Detail Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    {React.createElement(getCategoryIcon(selectedTemplate.category), {
                                        className: "w-6 h-6 text-white"
                                    })}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                                    <p className="text-gray-600">{selectedTemplate.author.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Info */}
                                <div className="lg:col-span-2">
                                    <p className="text-gray-700 mb-4">{selectedTemplate.description}</p>

                                    {/* Features */}
                                    <h3 className="text-lg font-semibold mb-3">Features</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                                        {selectedTemplate.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Tech Stack */}
                                    <h3 className="text-lg font-semibold mb-3">Tech Stack</h3>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selectedTemplate.techStack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    {/* Use Template Button */}
                                    <button
                                        onClick={() => useTemplate(selectedTemplate)}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Rocket className="w-4 h-4" />
                                        <span>Use This Template</span>
                                    </button>

                                    {/* Stats */}
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Downloads</span>
                                            <span className="font-medium">{selectedTemplate.downloads.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Rating</span>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                                <span className="font-medium">{selectedTemplate.rating}</span>
                                                <span className="text-gray-400 text-sm ml-1">({selectedTemplate.reviews})</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Est. Time</span>
                                            <span className="font-medium">{selectedTemplate.estimatedTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Difficulty</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                                                {selectedTemplate.difficulty}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dependencies */}
                                    <div>
                                        <h4 className="font-medium mb-2">Dependencies</h4>
                                        <div className="space-y-2">
                                            {selectedTemplate.dependencies.slice(0, 5).map((dep) => (
                                                <div key={dep.name} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">{dep.name}</span>
                                                    <span className="text-gray-500">{dep.version}</span>
                                                </div>
                                            ))}
                                            {selectedTemplate.dependencies.length > 5 && (
                                                <p className="text-xs text-gray-500">
                                                    +{selectedTemplate.dependencies.length - 5} more dependencies
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
