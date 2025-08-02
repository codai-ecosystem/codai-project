import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    GlobeAltIcon,
    BanknotesIcon,
    ChartBarIcon,
    DocumentTextIcon,
    UserGroupIcon,
    CogIcon,
    LightBulbIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Brain, MessageSquare, FileSearch, GitBranch, Database, Globe } from 'lucide-react';

interface AITool {
    id: string;
    name: string;
    nameRo: string;
    description: string;
    descriptionRo: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    features: string[];
    usage: number;
    lastUsed?: string;
}

const RomanianAITools: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const aiTools: AITool[] = [
        {
            id: 'intelligence',
            name: 'ROMAI Intelligence',
            nameRo: 'Inteligență ROMAI',
            description: 'General-purpose AI intelligence with Romanian cultural context',
            descriptionRo: 'Inteligență artificială cu context cultural românesc',
            category: 'core',
            icon: Brain,
            color: 'bg-blue-500',
            features: ['Romanian Language Processing', 'Cultural Context Analysis', 'Business Intelligence'],
            usage: 1247,
            lastUsed: '2 minutes ago',
        },
        {
            id: 'romanian_expert',
            name: 'Romanian Expert',
            nameRo: 'Expert Român',
            description: 'Specialized knowledge about Romanian culture, business, and regulations',
            descriptionRo: 'Cunoștințe specializate despre cultura, afacerile și reglementările românești',
            category: 'cultural',
            icon: GlobeAltIcon,
            color: 'bg-green-500',
            features: ['Cultural Insights', 'Legal Framework', 'Business Practices', 'Historical Context'],
            usage: 523,
            lastUsed: '15 minutes ago',
        },
        {
            id: 'problem_solver',
            name: 'Problem Solver',
            nameRo: 'Rezolvator de Probleme',
            description: 'Step-by-step problem solving with practical Romanian solutions',
            descriptionRo: 'Rezolvarea problemelor pas cu pas cu soluții practice românești',
            category: 'productivity',
            icon: LightBulbIcon,
            color: 'bg-yellow-500',
            features: ['Analytical Thinking', 'Solution Design', 'Implementation Planning'],
            usage: 892,
            lastUsed: '5 minutes ago',
        },
        {
            id: 'code_assistant',
            name: 'Code Assistant',
            nameRo: 'Asistent de Programare',
            description: 'Romanian-first coding assistant for development projects',
            descriptionRo: 'Asistent de programare cu focus pe limba română',
            category: 'development',
            icon: CogIcon,
            color: 'bg-purple-500',
            features: ['Code Generation', 'Romanian Comments', 'Best Practices', 'Framework Support'],
            usage: 654,
            lastUsed: '1 hour ago',
        },
        {
            id: 'market_intelligence',
            name: 'Market Intelligence',
            nameRo: 'Inteligență de Piață',
            description: 'Romanian market analysis and business intelligence',
            descriptionRo: 'Analiză de piață și inteligență de afaceri românească',
            category: 'business',
            icon: ChartBarIcon,
            color: 'bg-indigo-500',
            features: ['Market Analysis', 'Competitor Research', 'Trend Identification', 'ROI Calculation'],
            usage: 378,
            lastUsed: '30 minutes ago',
        },
        {
            id: 'regulatory_advisor',
            name: 'Regulatory Advisor',
            nameRo: 'Consilier Legislativ',
            description: 'Romanian legal and regulatory compliance guidance',
            descriptionRo: 'Ghidare pentru conformitatea legală și regulamentară românească',
            category: 'legal',
            icon: ShieldCheckIcon,
            color: 'bg-red-500',
            features: ['Legal Compliance', 'Tax Guidelines', 'EU Regulations', 'Documentation'],
            usage: 267,
            lastUsed: '2 hours ago',
        },
        {
            id: 'file_analyzer',
            name: 'File Analyzer',
            nameRo: 'Analizator de Fișiere',
            description: 'Intelligent file analysis with Romanian context understanding',
            descriptionRo: 'Analiză inteligentă de fișiere cu înțelegerea contextului românesc',
            category: 'productivity',
            icon: FileSearch,
            color: 'bg-teal-500',
            features: ['Document Analysis', 'Content Extraction', 'Summary Generation', 'Translation'],
            usage: 445,
            lastUsed: '45 minutes ago',
        },
        {
            id: 'git_intelligence',
            name: 'Git Intelligence',
            nameRo: 'Inteligență Git',
            description: 'Smart Git repository management with Romanian team insights',
            descriptionRo: 'Gestionarea inteligentă a depozitului Git cu perspective pentru echipe românești',
            category: 'development',
            icon: GitBranch,
            color: 'bg-orange-500',
            features: ['Commit Analysis', 'Branch Strategy', 'Team Collaboration', 'Code Quality'],
            usage: 189,
            lastUsed: '1.5 hours ago',
        },
        {
            id: 'database_advisor',
            name: 'Database Advisor',
            nameRo: 'Consilier Baze de Date',
            description: 'Database optimization and design with Romanian business requirements',
            descriptionRo: 'Optimizarea și proiectarea bazelor de date cu cerințe de afaceri românești',
            category: 'development',
            icon: Database,
            color: 'bg-cyan-500',
            features: ['Schema Design', 'Query Optimization', 'Performance Tuning', 'Security Audit'],
            usage: 234,
            lastUsed: '3 hours ago',
        },
        {
            id: 'web_intelligence',
            name: 'Web Intelligence',
            nameRo: 'Inteligență Web',
            description: 'Web data extraction and monitoring with Romanian market focus',
            descriptionRo: 'Extragerea și monitorizarea datelor web cu focus pe piața românească',
            category: 'research',
            icon: Globe,
            color: 'bg-pink-500',
            features: ['Data Extraction', 'Market Monitoring', 'Competitor Analysis', 'Trend Detection'],
            usage: 156,
            lastUsed: '4 hours ago',
        },
    ];

    const categories = [
        { id: 'all', name: 'All Tools', nameRo: 'Toate Instrumentele' },
        { id: 'core', name: 'Core Intelligence', nameRo: 'Inteligență Centrală' },
        { id: 'cultural', name: 'Cultural & Regional', nameRo: 'Cultural și Regional' },
        { id: 'business', name: 'Business Intelligence', nameRo: 'Inteligență de Afaceri' },
        { id: 'development', name: 'Development Tools', nameRo: 'Instrumente de Dezvoltare' },
        { id: 'productivity', name: 'Productivity', nameRo: 'Productivitate' },
        { id: 'legal', name: 'Legal & Compliance', nameRo: 'Legal și Conformitate' },
        { id: 'research', name: 'Research & Analysis', nameRo: 'Cercetare și Analiză' },
    ];

    const filteredTools = aiTools.filter(tool => {
        const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.nameRo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalUsage = aiTools.reduce((sum, tool) => sum + tool.usage, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    ROMAI AI Tools
                </h2>
                <p className="text-xl text-blue-600 dark:text-blue-400">
                    Instrumentele de Inteligență Artificială Românească
                </p>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Explore our comprehensive suite of AI tools designed specifically for Romanian users,
                    businesses, and cultural context understanding.
                </p>
            </div>

            {/* Usage Statistics */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold">{aiTools.length}</div>
                        <div className="text-blue-100">Available Tools</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">{totalUsage.toLocaleString()}</div>
                        <div className="text-blue-100">Total Usage</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">26+</div>
                        <div className="text-blue-100">MCP Commands</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">24/7</div>
                        <div className="text-blue-100">Availability</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search tools... / Caută instrumente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {category.nameRo}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                        {/* Tool Header */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${tool.color} group-hover:scale-110 transition-transform`}>
                                    <tool.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Usage</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {tool.usage.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {tool.nameRo}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {tool.name}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                {tool.descriptionRo}
                            </p>

                            {/* Features */}
                            <div className="space-y-2 mb-4">
                                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Features
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {tool.features.slice(0, 3).map((feature, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                    {tool.features.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                                            +{tool.features.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                                    Use Tool
                                </button>
                                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm rounded-lg transition-colors">
                                    Info
                                </button>
                            </div>

                            {/* Last Used */}
                            {tool.lastUsed && (
                                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    Last used: {tool.lastUsed}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* No Results */}
            {filteredTools.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                        <DocumentTextIcon className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No tools found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                        Try adjusting your search criteria or category filter.
                    </p>
                </div>
            )}

            {/* MCP Server Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            ROMAI MCP Server
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            All these tools are available through our Model Context Protocol (MCP) server,
                            enabling seamless integration with AI assistants and applications.
                            Use commands like <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">romai_intelligence</code>,
                            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">romai_romanian_expert</code>,
                            and <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">romai_problem_solver</code>
                            to access these capabilities.
                        </p>
                        <div className="flex gap-2">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                View MCP Documentation
                            </button>
                            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                Test MCP Connection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RomanianAITools;
