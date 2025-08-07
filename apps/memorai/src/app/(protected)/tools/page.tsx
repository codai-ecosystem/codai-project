'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
    ArrowLeft,
    Search,
    Download,
    Upload,
    Database,
    Filter,
    FileText,
    Settings,
    Zap
} from 'lucide-react';

// Import our new Phase 5 components
import MemoryExportImport from '../../../components/memory-export-import';
import AdvancedSearchFilters from '../../../components/advanced-search-filters';
import { BulkOperations } from '../../../components/bulk-operations';
import { memoraiMCPClient } from '../../../utils/memorai-mcp-client';

export default function MemoryToolsPage() {
    const [activeTab, setActiveTab] = useState('export-import');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Settings className="w-8 h-8 text-blue-600" />
                                Memory Tools
                                <Badge variant="secondary" className="ml-2">Phase 5</Badge>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Advanced memory management and data operations
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/analytics">
                            <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Analytics
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Download className="w-5 h-5 text-green-600" />
                                Export & Import
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Backup, migrate, and share your memories with JSON/CSV export and import capabilities.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="w-5 h-5 text-blue-600" />
                                Advanced Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Find memories with precision using date ranges, importance filters, tags, and projects.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="w-5 h-5 text-purple-600" />
                                Bulk Operations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Perform mass operations on your memories for efficient management and organization.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Tools Interface */}
                <Card>
                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="export-import" className="flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    Export & Import
                                </TabsTrigger>
                                <TabsTrigger value="advanced-search" className="flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Advanced Search
                                </TabsTrigger>
                                <TabsTrigger value="bulk-operations" className="flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Bulk Operations
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="export-import" className="mt-6">
                                <MemoryExportImport />
                            </TabsContent>

                            <TabsContent value="advanced-search" className="mt-6">
                                <AdvancedSearchFilters />
                            </TabsContent>

                            <TabsContent value="bulk-operations" className="mt-6">
                                <BulkOperations client={memoraiMCPClient} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Phase 5 Status */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900">Phase 5: Advanced Memory Features</h3>
                                <p className="text-blue-700 text-sm">
                                    Export/Import system, Advanced Search, and Bulk Operations are now available!
                                </p>
                            </div>
                            <div className="ml-auto">
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                    Complete
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
