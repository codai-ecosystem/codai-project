'use client';

import React, { useState } from 'react';
import {
    Database,
    Server,
    HardDrive,
    Cpu,
    Activity,
    TrendingUp,
    BarChart3,
    PieChart,
    Settings,
    Play,
    Pause,
    Square,
    RotateCcw,
    Download,
    Upload,
    Eye,
    Edit3,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Zap,
    Shield,
    Lock,
    Unlock,
    Users,
    FileText,
    TableProperties,
    Key,
    Link,
    Copy,
    Terminal,
    Monitor,
    Cloud,
    Globe
} from 'lucide-react';

interface DatabaseInstance {
    id: string;
    name: string;
    type: 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis' | 'Elasticsearch' | 'Neo4j' | 'ClickHouse' | 'SQLite';
    status: 'running' | 'stopped' | 'error' | 'maintenance';
    environment: 'development' | 'staging' | 'production';
    version: string;
    host: string;
    port: number;
    size: string;
    connections: number;
    maxConnections: number;
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    lastBackup: Date;
    ssl: boolean;
    description: string;
}

interface DatabaseTable {
    id: string;
    name: string;
    schema: string;
    rows: number;
    size: string;
    type: 'table' | 'view' | 'index' | 'function';
    lastModified: Date;
}

interface QueryHistory {
    id: string;
    query: string;
    database: string;
    executionTime: number;
    rows: number;
    status: 'success' | 'error';
    timestamp: Date;
}

const databases: DatabaseInstance[] = [
    {
        id: '1',
        name: 'CODAI Primary Database',
        type: 'PostgreSQL',
        status: 'running',
        environment: 'production',
        version: '15.3',
        host: 'codai-db-prod.amazonaws.com',
        port: 5432,
        size: '145.8 GB',
        connections: 23,
        maxConnections: 100,
        uptime: 2345 * 60, // minutes
        cpuUsage: 12.5,
        memoryUsage: 68.3,
        diskUsage: 78.9,
        lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000),
        ssl: true,
        description: 'Main application database storing user data, projects, and analytics'
    },
    {
        id: '2',
        name: 'Redis Cache Cluster',
        type: 'Redis',
        status: 'running',
        environment: 'production',
        version: '7.0.11',
        host: 'codai-cache-prod.redis.com',
        port: 6379,
        size: '8.2 GB',
        connections: 156,
        maxConnections: 1000,
        uptime: 1890 * 60,
        cpuUsage: 8.7,
        memoryUsage: 45.2,
        diskUsage: 23.1,
        lastBackup: new Date(Date.now() - 1 * 60 * 60 * 1000),
        ssl: true,
        description: 'High-performance caching layer for session management and API responses'
    },
    {
        id: '3',
        name: 'MongoDB Analytics',
        type: 'MongoDB',
        status: 'running',
        environment: 'production',
        version: '6.0.6',
        host: 'codai-analytics.mongodb.net',
        port: 27017,
        size: '67.4 GB',
        connections: 45,
        maxConnections: 200,
        uptime: 3456 * 60,
        cpuUsage: 15.3,
        memoryUsage: 72.8,
        diskUsage: 65.4,
        lastBackup: new Date(Date.now() - 3 * 60 * 60 * 1000),
        ssl: true,
        description: 'Document store for analytics data, user behavior tracking, and ML datasets'
    },
    {
        id: '4',
        name: 'Development Environment',
        type: 'PostgreSQL',
        status: 'running',
        environment: 'development',
        version: '15.3',
        host: 'localhost',
        port: 5433,
        size: '2.1 GB',
        connections: 5,
        maxConnections: 50,
        uptime: 120 * 60,
        cpuUsage: 3.2,
        memoryUsage: 18.7,
        diskUsage: 12.3,
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
        ssl: false,
        description: 'Local development database for testing and prototyping'
    },
    {
        id: '5',
        name: 'Search Index',
        type: 'Elasticsearch',
        status: 'maintenance',
        environment: 'production',
        version: '8.8.0',
        host: 'codai-search.elastic.co',
        port: 9200,
        size: '34.7 GB',
        connections: 12,
        maxConnections: 100,
        uptime: 2100 * 60,
        cpuUsage: 22.1,
        memoryUsage: 81.5,
        diskUsage: 56.8,
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ssl: true,
        description: 'Full-text search engine for code search and documentation indexing'
    }
];

const tables: DatabaseTable[] = [
    { id: '1', name: 'users', schema: 'public', rows: 125000, size: '45.2 MB', type: 'table', lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: '2', name: 'projects', schema: 'public', rows: 89000, size: '123.8 MB', type: 'table', lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { id: '3', name: 'repositories', schema: 'public', rows: 67000, size: '234.1 MB', type: 'table', lastModified: new Date(Date.now() - 30 * 60 * 1000) },
    { id: '4', name: 'analytics_events', schema: 'public', rows: 2500000, size: '1.2 GB', type: 'table', lastModified: new Date(Date.now() - 15 * 60 * 1000) },
    { id: '5', name: 'user_sessions', schema: 'public', rows: 456000, size: '78.9 MB', type: 'table', lastModified: new Date(Date.now() - 5 * 60 * 1000) }
];

const queryHistory: QueryHistory[] = [
    {
        id: '1',
        query: 'SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL \'7 days\'',
        database: 'CODAI Primary Database',
        executionTime: 125,
        rows: 1,
        status: 'success',
        timestamp: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
        id: '2',
        query: 'SELECT p.*, u.name FROM projects p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 50',
        database: 'CODAI Primary Database',
        executionTime: 89,
        rows: 50,
        status: 'success',
        timestamp: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
        id: '3',
        query: 'UPDATE users SET last_login = NOW() WHERE id = 12345',
        database: 'CODAI Primary Database',
        executionTime: 15,
        rows: 1,
        status: 'success',
        timestamp: new Date(Date.now() - 35 * 60 * 1000)
    }
];

const databaseMetrics = [
    { name: 'Total Databases', value: 5, change: 0, trend: 'stable' },
    { name: 'Active Connections', value: 241, change: 12, trend: 'up' },
    { name: 'Query Response Time', value: '89ms', change: -8, trend: 'down' },
    { name: 'Storage Used', value: '258.2 GB', change: 5.2, trend: 'up' }
];

export default function DatabasesPage() {
    const [selectedDatabase, setSelectedDatabase] = useState<DatabaseInstance | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedEnvironment, setSelectedEnvironment] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [queryInput, setQueryInput] = useState('');

    const filteredDatabases = databases.filter(db => {
        const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            db.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || db.type === selectedType;
        const matchesEnvironment = selectedEnvironment === 'all' || db.environment === selectedEnvironment;
        const matchesStatus = selectedStatus === 'all' || db.status === selectedStatus;
        return matchesSearch && matchesType && matchesEnvironment && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'stopped': return <Square className="w-4 h-4 text-gray-600" />;
            case 'maintenance': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-green-100 text-green-800';
            case 'stopped': return 'bg-gray-100 text-gray-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'error': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEnvironmentColor = (environment: string) => {
        switch (environment) {
            case 'production': return 'bg-red-100 text-red-800';
            case 'staging': return 'bg-yellow-100 text-yellow-800';
            case 'development': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PostgreSQL': return <Database className="w-4 h-4 text-blue-600" />;
            case 'MySQL': return <Database className="w-4 h-4 text-orange-600" />;
            case 'MongoDB': return <Database className="w-4 h-4 text-green-600" />;
            case 'Redis': return <Zap className="w-4 h-4 text-red-600" />;
            case 'Elasticsearch': return <Search className="w-4 h-4 text-yellow-600" />;
            case 'Neo4j': return <Globe className="w-4 h-4 text-purple-600" />;
            case 'ClickHouse': return <BarChart3 className="w-4 h-4 text-indigo-600" />;
            case 'SQLite': return <HardDrive className="w-4 h-4 text-gray-600" />;
            default: return <Database className="w-4 h-4 text-gray-600" />;
        }
    };

    const formatUptime = (minutes: number) => {
        const days = Math.floor(minutes / (24 * 60));
        const hours = Math.floor((minutes % (24 * 60)) / 60);
        return `${days}d ${hours}h`;
    };

    const formatBytes = (bytes: number) => {
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50 ml-80">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Databases</h1>
                            <p className="text-gray-600 mt-2">Manage database instances, monitor performance, and execute queries</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Terminal className="w-4 h-4" />
                                <span>Query Console</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4" />
                                <span>New Database</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {databaseMetrics.map((metric, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">{metric.name}</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        {metric.change !== 0 && (
                                            <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' :
                                                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                {metric.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                                                {metric.trend === 'down' && <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                                                <span>{Math.abs(metric.change)}{typeof metric.value === 'string' ? '' : '%'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Database className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('tables')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tables'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Tables & Views
                            </button>
                            <button
                                onClick={() => setActiveTab('queries')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'queries'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Query History
                            </button>
                            <button
                                onClick={() => setActiveTab('monitoring')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'monitoring'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Monitoring
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === 'overview' && (
                            <>
                                {/* Filters */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search databases..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                                                />
                                            </div>

                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="PostgreSQL">PostgreSQL</option>
                                                <option value="MySQL">MySQL</option>
                                                <option value="MongoDB">MongoDB</option>
                                                <option value="Redis">Redis</option>
                                                <option value="Elasticsearch">Elasticsearch</option>
                                                <option value="Neo4j">Neo4j</option>
                                                <option value="ClickHouse">ClickHouse</option>
                                                <option value="SQLite">SQLite</option>
                                            </select>

                                            <select
                                                value={selectedEnvironment}
                                                onChange={(e) => setSelectedEnvironment(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Environments</option>
                                                <option value="production">Production</option>
                                                <option value="staging">Staging</option>
                                                <option value="development">Development</option>
                                            </select>

                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="running">Running</option>
                                                <option value="stopped">Stopped</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="error">Error</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Database List */}
                                <div className="space-y-4">
                                    {filteredDatabases.map((db) => (
                                        <div
                                            key={db.id}
                                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => setSelectedDatabase(db)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            {getTypeIcon(db.type)}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">{db.name}</h3>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="text-sm text-gray-600">{db.type} {db.version}</span>
                                                                <span className="text-sm text-gray-400">•</span>
                                                                <span className="text-sm text-gray-600">{db.host}:{db.port}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-4">{db.description}</p>

                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(db.status)}
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(db.status)}`}>
                                                                {db.status}
                                                            </span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(db.environment)}`}>
                                                            {db.environment}
                                                        </span>
                                                        <div className="flex items-center space-x-1">
                                                            {db.ssl ? <Lock className="w-3 h-3 text-green-600" /> : <Unlock className="w-3 h-3 text-red-600" />}
                                                            <span className="text-xs text-gray-600">{db.ssl ? 'SSL' : 'No SSL'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Size</p>
                                                            <p className="font-semibold text-gray-900">{db.size}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Connections</p>
                                                            <p className="font-semibold text-gray-900">{db.connections}/{db.maxConnections}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">CPU Usage</p>
                                                            <p className="font-semibold text-gray-900">{db.cpuUsage}%</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Uptime</p>
                                                            <p className="font-semibold text-gray-900">{formatUptime(db.uptime)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2 ml-4">
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <Terminal className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'tables' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Database Tables</h3>
                                    <p className="text-sm text-gray-600 mt-1">Manage tables, views, and database objects</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schema</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rows</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {tables.map((table) => (
                                                <tr key={table.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center space-x-2">
                                                            <TableProperties className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium text-gray-900">{table.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{table.schema}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${table.type === 'table' ? 'bg-blue-100 text-blue-800' :
                                                                table.type === 'view' ? 'bg-green-100 text-green-800' :
                                                                    table.type === 'index' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-purple-100 text-purple-800'
                                                            }`}>
                                                            {table.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{table.rows.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{table.size}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {Math.floor((Date.now() - table.lastModified.getTime()) / (1000 * 60))}m ago
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center space-x-2">
                                                            <button className="text-blue-600 hover:text-blue-900">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-gray-400 hover:text-gray-600">
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-gray-400 hover:text-gray-600">
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'queries' && (
                            <div className="space-y-6">
                                {/* Query Console */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Console</h3>
                                    <div className="space-y-4">
                                        <textarea
                                            value={queryInput}
                                            onChange={(e) => setQueryInput(e.target.value)}
                                            placeholder="Enter your SQL query here..."
                                            className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex items-center justify-between">
                                            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>CODAI Primary Database</option>
                                                <option>Development Environment</option>
                                            </select>
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                <Play className="w-4 h-4" />
                                                <span>Execute Query</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Query History */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Queries</h3>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {queryHistory.map((query) => (
                                            <div key={query.id} className="p-6 hover:bg-gray-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${query.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {query.status}
                                                            </span>
                                                            <span className="text-sm text-gray-600">{query.database}</span>
                                                            <span className="text-sm text-gray-600">
                                                                {Math.floor((Date.now() - query.timestamp.getTime()) / (1000 * 60))}m ago
                                                            </span>
                                                        </div>
                                                        <code className="block bg-gray-50 p-3 rounded-lg text-sm font-mono text-gray-900 mb-2">
                                                            {query.query}
                                                        </code>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <span>Execution time: {query.executionTime}ms</span>
                                                            <span>Rows: {query.rows}</span>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-gray-600 ml-4">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Database Details */}
                        {selectedDatabase && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{selectedDatabase.name}</h4>
                                        <p className="text-sm text-gray-600">{selectedDatabase.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Type</p>
                                            <p className="font-medium">{selectedDatabase.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Version</p>
                                            <p className="font-medium">{selectedDatabase.version}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Environment</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(selectedDatabase.environment)}`}>
                                                {selectedDatabase.environment}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(selectedDatabase.status)}
                                                <span className="font-medium capitalize">{selectedDatabase.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">CPU Usage</span>
                                                <span className="font-medium">{selectedDatabase.cpuUsage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${selectedDatabase.cpuUsage}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Memory Usage</span>
                                                <span className="font-medium">{selectedDatabase.memoryUsage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${selectedDatabase.memoryUsage}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Disk Usage</span>
                                                <span className="font-medium">{selectedDatabase.diskUsage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-orange-600 h-2 rounded-full"
                                                    style={{ width: `${selectedDatabase.diskUsage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex flex-col space-y-2">
                                            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                <Terminal className="w-4 h-4" />
                                                <span>Connect</span>
                                            </button>
                                            <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                                <Download className="w-4 h-4" />
                                                <span>Backup</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

                            <div className="space-y-3">
                                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <Database className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Create Database</p>
                                        <p className="text-sm text-gray-500">Set up new database instance</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <Upload className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Import Data</p>
                                        <p className="text-sm text-gray-500">Upload CSV, JSON, or SQL files</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium">Performance Analytics</p>
                                        <p className="text-sm text-gray-500">View detailed metrics</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <Shield className="w-5 h-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Security Settings</p>
                                        <p className="text-sm text-gray-500">Manage access and permissions</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Database Health</span>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-600">Healthy</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Backup Status</span>
                                    <span className="text-sm font-medium text-gray-900">6h ago</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Active Queries</span>
                                    <span className="text-sm font-medium text-gray-900">12</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Replication Status</span>
                                    <div className="flex items-center space-x-1">
                                        <Activity className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-600">Syncing</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
