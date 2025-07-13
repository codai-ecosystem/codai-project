/**
 * Advanced Export Formats for Memorai V3.0
 * Comprehensive export system with multiple formats and scheduling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMemoryStore } from '../../stores/memory-store';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Database,
  Code,
  Image,
  Calendar,
  Settings,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Tag,
  Layers,
  Zap,
  Globe,
  Share2,
  Archive,
  Mail,
  Cloud,
  HardDrive,
} from 'lucide-react';

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  size: 'small' | 'medium' | 'large';
  compatibility: string[];
}

interface ExportOptions {
  format: string;
  includeMetadata: boolean;
  includeConnections: boolean;
  dateRange: [Date, Date];
  filterBy: {
    types: string[];
    agents: string[];
    tags: string[];
    importance: number;
  };
  customFields: string[];
  compression: boolean;
  encryption: boolean;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    destination: 'local' | 'cloud' | 'email';
  };
}

interface ExportJob {
  id: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  fileSize?: number;
  recordCount: number;
  downloadUrl?: string;
  error?: string;
}

export const AdvancedExportFormats: React.FC = () => {
  const { memories, fetchMemories } = useMemoryStore();
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeConnections: false,
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    filterBy: {
      types: [],
      agents: [],
      tags: [],
      importance: 0,
    },
    customFields: [],
    compression: false,
    encryption: false,
  });

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  // Available export formats
  const exportFormats: ExportFormat[] = [
    {
      id: 'json',
      name: 'JSON',
      extension: '.json',
      icon: <Code className="h-5 w-5" />,
      description: 'JavaScript Object Notation - Native format with full fidelity',
      features: ['Full metadata', 'Nested structures', 'API compatible', 'Lightweight'],
      size: 'small',
      compatibility: ['JavaScript', 'Python', 'REST APIs', 'NoSQL databases'],
    },
    {
      id: 'csv',
      name: 'CSV',
      extension: '.csv',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      description: 'Comma-separated values - Universal spreadsheet format',
      features: ['Excel compatible', 'Database import', 'Analytics ready', 'Compact'],
      size: 'small',
      compatibility: ['Excel', 'Google Sheets', 'SQL databases', 'Analytics tools'],
    },
    {
      id: 'xml',
      name: 'XML',
      extension: '.xml',
      icon: <FileText className="h-5 w-5" />,
      description: 'Extensible Markup Language - Structured enterprise format',
      features: ['Schema validation', 'Enterprise systems', 'Document structure', 'Metadata rich'],
      size: 'medium',
      compatibility: ['Enterprise systems', 'SOAP APIs', 'Document processors', 'Databases'],
    },
    {
      id: 'parquet',
      name: 'Parquet',
      extension: '.parquet',
      icon: <Database className="h-5 w-5" />,
      description: 'Columnar storage - Big data analytics optimized',
      features: ['Columnar storage', 'Compression', 'Big data', 'Analytics optimized'],
      size: 'small',
      compatibility: ['Apache Spark', 'Hadoop', 'Pandas', 'Big data tools'],
    },
    {
      id: 'jsonld',
      name: 'JSON-LD',
      extension: '.jsonld',
      icon: <Globe className="h-5 w-5" />,
      description: 'JSON for Linking Data - Semantic web format',
      features: ['Linked data', 'Semantic web', 'RDF compatible', 'Knowledge graphs'],
      size: 'medium',
      compatibility: ['Semantic web', 'Knowledge graphs', 'RDF stores', 'AI systems'],
    },
    {
      id: 'markdown',
      name: 'Markdown',
      extension: '.md',
      icon: <FileText className="h-5 w-5" />,
      description: 'Markdown documentation - Human-readable format',
      features: ['Human readable', 'Documentation', 'Git friendly', 'Static sites'],
      size: 'medium',
      compatibility: ['GitHub', 'GitLab', 'Static sites', 'Documentation'],
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      extension: '.pdf',
      icon: <FileText className="h-5 w-5" />,
      description: 'Portable Document Format - Professional reports',
      features: ['Professional layout', 'Print ready', 'Charts included', 'Branded'],
      size: 'large',
      compatibility: ['Adobe Reader', 'Print', 'Email', 'Archive'],
    },
    {
      id: 'excel',
      name: 'Excel Workbook',
      extension: '.xlsx',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      description: 'Microsoft Excel format - Multiple sheets with formatting',
      features: ['Multiple sheets', 'Formatting', 'Charts', 'Formulas'],
      size: 'medium',
      compatibility: ['Microsoft Excel', 'LibreOffice', 'Google Sheets', 'Numbers'],
    },
  ];

  // Filter memories based on export options
  const filteredMemories = useMemo(() => {
    if (!memories) return [];

    return memories.filter(memory => {
      // Date range filter
      const memoryDate = new Date(memory.metadata?.timestamp || Date.now());
      if (memoryDate < exportOptions.dateRange[0] || memoryDate > exportOptions.dateRange[1]) {
        return false;
      }

      // Type filter
      if (exportOptions.filterBy.types.length > 0 &&
        !exportOptions.filterBy.types.includes(memory.type || 'unknown')) {
        return false;
      }

      // Agent filter
      if (exportOptions.filterBy.agents.length > 0 &&
        !exportOptions.filterBy.agents.includes(memory.metadata?.agentId || 'system')) {
        return false;
      }

      // Tag filter
      if (exportOptions.filterBy.tags.length > 0) {
        const memoryTags = memory.metadata?.tags || [];
        if (!exportOptions.filterBy.tags.some(tag => memoryTags.includes(tag))) {
          return false;
        }
      }

      // Importance filter
      const importance = memory.metadata?.importance || 0;
      if (importance < exportOptions.filterBy.importance) {
        return false;
      }

      return true;
    });
  }, [memories, exportOptions]);

  // Calculate export statistics
  const exportStats = useMemo(() => {
    const totalSize = filteredMemories.reduce((sum, memory) =>
      sum + (memory.content?.length || 0) + JSON.stringify(memory.metadata || {}).length, 0);

    const typeDistribution = filteredMemories.reduce((acc, memory) => {
      const type = memory.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const agentDistribution = filteredMemories.reduce((acc, memory) => {
      const agent = memory.metadata?.agentId || 'system';
      acc[agent] = (acc[agent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRecords: filteredMemories.length,
      estimatedSize: totalSize,
      typeDistribution,
      agentDistribution,
      dateRange: {
        start: Math.min(...filteredMemories.map(m => new Date(m.metadata?.timestamp || Date.now()).getTime())),
        end: Math.max(...filteredMemories.map(m => new Date(m.metadata?.timestamp || Date.now()).getTime())),
      },
    };
  }, [filteredMemories]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleExport = async () => {
    if (filteredMemories.length === 0) {
      alert('No memories match the current filters');
      return;
    }

    setIsExporting(true);

    const jobId = Date.now().toString();
    const newJob: ExportJob = {
      id: jobId,
      format: selectedFormat,
      status: 'processing',
      progress: 0,
      startTime: new Date(),
      recordCount: filteredMemories.length,
    };

    setExportJobs(prev => [newJob, ...prev]);

    try {
      // Simulate export progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportJobs(prev => prev.map(job =>
          job.id === jobId ? { ...job, progress } : job
        ));
      }

      // Generate export data based on format
      const exportData = await generateExportData(selectedFormat, filteredMemories, exportOptions);

      // Create download
      const blob = new Blob([exportData.content], { type: exportData.mimeType });
      const url = URL.createObjectURL(blob);

      // Update job status
      const updatedJob: ExportJob = {
        ...newJob,
        status: 'completed',
        progress: 100,
        endTime: new Date(),
        fileSize: blob.size,
        downloadUrl: url,
      };

      setExportJobs(prev => prev.map(job =>
        job.id === jobId ? updatedJob : job
      ));

      // Auto-download
      const a = document.createElement('a');
      a.href = url;
      a.download = `memorai-export-${new Date().toISOString().split('T')[0]}.${exportData.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (error) {
      setExportJobs(prev => prev.map(job =>
        job.id === jobId ? {
          ...job,
          status: 'failed',
          endTime: new Date(),
          error: error instanceof Error ? error.message : 'Export failed'
        } : job
      ));
    } finally {
      setIsExporting(false);
    }
  };

  const generateExportData = async (format: string, data: any[], options: ExportOptions) => {
    const formatHandlers = {
      json: () => ({
        content: JSON.stringify({
          metadata: {
            exportDate: new Date().toISOString(),
            version: '3.0',
            recordCount: data.length,
            options,
          },
          memories: data,
        }, null, 2),
        mimeType: 'application/json',
        extension: 'json',
      }),

      csv: () => {
        const headers = ['id', 'content', 'type', 'timestamp', 'agentId', 'importance'];
        if (options.includeMetadata) headers.push('metadata');

        const rows = data.map(memory => [
          memory.id,
          `"${memory.content?.replace(/"/g, '""') || ''}"`,
          memory.type || '',
          memory.metadata?.timestamp || '',
          memory.metadata?.agentId || '',
          memory.metadata?.importance || '',
          options.includeMetadata ? `"${JSON.stringify(memory.metadata || {}).replace(/"/g, '""')}"` : '',
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        return {
          content: csvContent,
          mimeType: 'text/csv',
          extension: 'csv',
        };
      },

      xml: () => {
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<memorai-export>
  <metadata>
    <exportDate>${new Date().toISOString()}</exportDate>
    <version>3.0</version>
    <recordCount>${data.length}</recordCount>
  </metadata>
  <memories>
    ${data.map(memory => `
    <memory id="${memory.id}">
      <content><![CDATA[${memory.content || ''}]]></content>
      <type>${memory.type || ''}</type>
      <timestamp>${memory.metadata?.timestamp || ''}</timestamp>
      <agentId>${memory.metadata?.agentId || ''}</agentId>
      <importance>${memory.metadata?.importance || 0}</importance>
      ${options.includeMetadata ? `<metadata><![CDATA[${JSON.stringify(memory.metadata || {})}]]></metadata>` : ''}
    </memory>`).join('')}
  </memories>
</memorai-export>`;

        return {
          content: xmlContent,
          mimeType: 'application/xml',
          extension: 'xml',
        };
      },

      markdown: () => {
        const mdContent = `# Memorai Export Report

**Export Date:** ${new Date().toLocaleDateString()}  
**Total Records:** ${data.length}  
**Date Range:** ${new Date(exportStats.dateRange.start).toLocaleDateString()} - ${new Date(exportStats.dateRange.end).toLocaleDateString()}

## Summary

${Object.entries(exportStats.typeDistribution).map(([type, count]) =>
          `- **${type}:** ${count} memories`
        ).join('\n')}

## Memories

${data.map((memory, index) => `
### Memory ${index + 1}

**Type:** ${memory.type || 'Unknown'}  
**Date:** ${memory.metadata?.timestamp ? new Date(memory.metadata.timestamp).toLocaleDateString() : 'Unknown'}  
**Agent:** ${memory.metadata?.agentId || 'System'}  
**Importance:** ${((memory.metadata?.importance || 0) * 100).toFixed(0)}%

${memory.content || 'No content'}

${memory.metadata?.tags?.length ? `**Tags:** ${memory.metadata.tags.join(', ')}` : ''}

---
`).join('')}
`;

        return {
          content: mdContent,
          mimeType: 'text/markdown',
          extension: 'md',
        };
      },
    };

    return formatHandlers[format as keyof typeof formatHandlers]?.() || formatHandlers.json();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const downloadJob = (job: ExportJob) => {
    if (job.downloadUrl) {
      const a = document.createElement('a');
      a.href = job.downloadUrl;
      a.download = `memorai-export-${job.id}.${exportFormats.find(f => f.id === job.format)?.extension || 'json'}`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <Download className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Export Formats
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Export memories in multiple formats with scheduling and automation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScheduler(!showScheduler)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>

          <Button
            onClick={handleExport}
            disabled={isExporting || filteredMemories.length === 0}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            {isExporting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {exportStats.totalRecords.toLocaleString()}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatFileSize(exportStats.estimatedSize)}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date Range</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.ceil((exportStats.dateRange.end - exportStats.dateRange.start) / (24 * 60 * 60 * 1000))} days
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(exportStats.typeDistribution).length}
                </p>
              </div>
              <Layers className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Format Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Export Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map((format) => (
                  <div
                    key={format.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    onClick={() => {
                      setSelectedFormat(format.id);
                      setExportOptions(prev => ({ ...prev, format: format.id }));
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {format.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {format.name}
                          </h3>
                          <Badge
                            variant={format.size === 'small' ? 'default' : format.size === 'medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {format.size}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {format.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {format.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeMetadata: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Include Metadata</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeConnections}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeConnections: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Include Connections</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.compression}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      compression: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Compress Output</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.encryption}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      encryption: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Encrypt Export</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Importance Threshold
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={exportOptions.filterBy.importance}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    filterBy: { ...prev.filterBy, importance: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(exportOptions.filterBy.importance * 100).toFixed(0)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Details */}
          {selectedFormat && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Format Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const format = exportFormats.find(f => f.id === selectedFormat);
                  if (!format) return null;

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        {format.icon}
                        <span className="font-medium">{format.name}</span>
                        <Badge variant="outline">{format.extension}</Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format.description}
                      </p>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Features</h4>
                        <div className="space-y-1">
                          {format.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Compatible With</h4>
                        <div className="flex flex-wrap gap-1">
                          {format.compatibility.map((tool, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Export Jobs */}
      {exportJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Archive className="h-5 w-5 mr-2" />
              Export History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportJobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {exportFormats.find(f => f.id === job.format)?.name} Export
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {job.recordCount} records
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {job.startTime.toLocaleString()}
                        {job.fileSize && ` • ${formatFileSize(job.fileSize)}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {job.status === 'processing' && (
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}

                    {job.status === 'completed' && job.downloadUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadJob(job)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}

                    {job.status === 'failed' && (
                      <Badge variant="destructive" className="text-xs">
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedExportFormats;
