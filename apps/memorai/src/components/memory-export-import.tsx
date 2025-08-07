'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
    Download,
    Upload,
    FileJson,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle,
    FileText,
    Database
} from 'lucide-react';
import { memoraiMCPClient } from '../utils/memorai-mcp-client';

export default function MemoryExportImport() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importData, setImportData] = useState('');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
    const [status, setStatus] = useState<{
        type: 'success' | 'error' | 'info' | null;
        message: string;
    }>({ type: null, message: '' });

    const handleExport = async () => {
        try {
            setIsExporting(true);
            setStatus({ type: 'info', message: 'Exporting memories...' });

            let data: string;
            let filename: string;
            let mimeType: string;

            if (exportFormat === 'json') {
                data = await memoraiMCPClient.exportMemoriesToJSON();
                filename = `memorai-export-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else {
                data = await memoraiMCPClient.exportMemoriesToCSV();
                filename = `memorai-export-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
            }

            // Create and download file
            const blob = new Blob([data], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus({
                type: 'success',
                message: `Successfully exported memories to ${filename}`
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: `Export failed: ${error.message}`
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImportData(e.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const handleImport = async () => {
        if (!importData) {
            setStatus({ type: 'error', message: 'Please provide data to import' });
            return;
        }

        try {
            setIsImporting(true);
            setStatus({ type: 'info', message: 'Importing memories...' });

            const result = await memoraiMCPClient.importMemoriesFromJSON(importData);

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: `Import completed! Imported: ${result.imported}, Skipped: ${result.skipped}${result.errors.length > 0 ? `, Errors: ${result.errors.length}` : ''}`
                });
                setImportData('');
                setImportFile(null);
            } else {
                setStatus({
                    type: 'error',
                    message: `Import failed: ${result.errors.join(', ')}`
                });
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: `Import failed: ${error.message}`
            });
        } finally {
            setIsImporting(false);
        }
    };

    const getStatusIcon = () => {
        switch (status.type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'info':
                return <FileText className="w-4 h-4 text-blue-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Status Message */}
            {status.type && (
                <Card className={`border-l-4 ${status.type === 'success' ? 'border-l-green-500 bg-green-50' :
                        status.type === 'error' ? 'border-l-red-500 bg-red-50' :
                            'border-l-blue-500 bg-blue-50'
                    }`}>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            {getStatusIcon()}
                            <span className={`text-sm ${status.type === 'success' ? 'text-green-700' :
                                    status.type === 'error' ? 'text-red-700' :
                                        'text-blue-700'
                                }`}>
                                {status.message}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Export Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-600" />
                        Export Memories
                    </CardTitle>
                    <CardDescription>
                        Download your memories for backup or sharing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="export-format">Export Format</Label>
                        <Select value={exportFormat} onValueChange={(value: 'json' | 'csv') => setExportFormat(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="json">
                                    <div className="flex items-center gap-2">
                                        <FileJson className="w-4 h-4" />
                                        JSON (Complete data with metadata)
                                    </div>
                                </SelectItem>
                                <SelectItem value="csv">
                                    <div className="flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4" />
                                        CSV (Spreadsheet compatible)
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
                    </Button>
                </CardContent>
            </Card>

            {/* Import Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-green-600" />
                        Import Memories
                    </CardTitle>
                    <CardDescription>
                        Import memories from JSON file or paste JSON data directly
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="import-file">Upload File</Label>
                        <Input
                            id="import-file"
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="cursor-pointer"
                        />
                        {importFile && (
                            <p className="text-sm text-gray-600">
                                Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="import-data">Or Paste JSON Data</Label>
                        <Textarea
                            id="import-data"
                            placeholder='Paste your JSON data here...'
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            rows={6}
                            className="font-mono text-sm"
                        />
                    </div>

                    <Button
                        onClick={handleImport}
                        disabled={isImporting || !importData}
                        className="w-full"
                        variant="secondary"
                    >
                        <Database className="w-4 h-4 mr-2" />
                        {isImporting ? 'Importing...' : 'Import Memories'}
                    </Button>

                    <div className="text-xs text-gray-500 space-y-1">
                        <p>• Duplicate memories will be skipped automatically</p>
                        <p>• Only JSON format is supported for import</p>
                        <p>• Large imports may take a few moments to process</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
