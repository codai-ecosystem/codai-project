import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '../../../../types/memory';
import { authenticateAPI, getAuthenticatedUserId, addSecurityHeaders, hasAdminAccess } from '../../../../middleware/auth';
import { sensitiveRateLimit } from '../../../../middleware/rateLimit';

// Mock MCP client for now
const memoraiMCPClient = {
    getAllMemories: async () => [
        {
            structuredKey: 'demo-key-1',
            content: 'Sample memory content',
            agentId: 'demo-agent',
            metadata: { importance: 5, project: 'demo', tags: ['sample'] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]
};

// Mock user ID - will be replaced with proper auth
const MOCK_USER_ID = 'user-12345';

// GET /api/memories/export - Export user memories (Admin only for security)
export async function GET(request: NextRequest): Promise<NextResponse<any>> {
    try {
        // 🔐 Authentication check
        const authResponse = authenticateAPI(request);
        if (authResponse) return addSecurityHeaders(authResponse);

        // 🛡️ Admin access required for export functionality
        if (!hasAdminAccess(request)) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_PRIVILEGES',
                    message: 'Export functionality requires admin access for security compliance',
                },
            }, { status: 403 }));
        }

        // 🛡️ Rate limiting check
        const rateLimitResponse = sensitiveRateLimit(request);
        if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

        // Get authenticated user ID
        const userId = getAuthenticatedUserId(request);

        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'json';
        const project = searchParams.get('project') || undefined;
        const tagsParam = searchParams.get('tags');
        const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : undefined;
        const dateFrom = searchParams.get('dateFrom') || undefined;
        const dateTo = searchParams.get('dateTo') || undefined;

        if (!['json', 'csv'].includes(format)) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid export format. Supported formats: json, csv',
                },
            }, { status: 400 }));
        }

        // Get memories using MCP client
        const memories = await memoraiMCPClient.getAllMemories();

        if (!memories || memories.length === 0) {
            return addSecurityHeaders(NextResponse.json({
                success: false,
                error: {
                    code: 'NO_DATA',
                    message: 'No memories found to export',
                },
            }, { status: 404 }));
        }

        // Apply filters
        let filteredMemories = memories;

        if (project) {
            filteredMemories = filteredMemories.filter(memory =>
                memory.metadata?.project?.toLowerCase() === project.toLowerCase()
            );
        }

        if (tags && tags.length > 0) {
            filteredMemories = filteredMemories.filter(memory =>
                memory.metadata?.tags && tags.some(tag =>
                    memory.metadata.tags.some((memoryTag: string) =>
                        memoryTag.toLowerCase().includes(tag.toLowerCase())
                    )
                )
            );
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filteredMemories = filteredMemories.filter(memory =>
                new Date(memory.createdAt) >= fromDate
            );
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            filteredMemories = filteredMemories.filter(memory =>
                new Date(memory.createdAt) <= toDate
            );
        }

        // Generate export data
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `memorai-export-${timestamp}.${format}`;

        if (format === 'json') {
            const exportData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    totalMemories: filteredMemories.length,
                    format: 'json',
                    version: '1.0.0',
                    filters: { project, tags, dateFrom, dateTo },
                    authenticated: true,
                    exportedBy: userId
                },
                memories: filteredMemories
            };

            return new NextResponse(JSON.stringify(exportData, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY'
                }
            });
        } else if (format === 'csv') {
            // Generate CSV data
            const csvHeaders = ['ID', 'Content', 'Agent ID', 'Importance', 'Project', 'Tags', 'Created At', 'Updated At'];
            const csvRows = filteredMemories.map(memory => [
                memory.structuredKey || '',
                `"${memory.content.replace(/"/g, '""')}"`,
                memory.agentId || '',
                memory.metadata?.importance || '',
                memory.metadata?.project || '',
                memory.metadata?.tags ? memory.metadata.tags.join(';') : '',
                memory.createdAt || '',
                memory.updatedAt || ''
            ]);

            const csvContent = [
                csvHeaders.join(','),
                ...csvRows.map(row => row.join(','))
            ].join('\n');

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY'
                }
            });
        }

        return addSecurityHeaders(NextResponse.json({
            success: true,
            data: filteredMemories,
            meta: {
                count: filteredMemories.length,
                format,
                timestamp: new Date().toISOString(),
                filters: { project, tags, dateFrom, dateTo },
                authenticated: true
            },
        }));

    } catch (error) {
        console.error('Error exporting memories:', error);
        return addSecurityHeaders(NextResponse.json({
            success: false,
            error: {
                code: 'EXPORT_ERROR',
                message: 'Failed to export memories',
            },
        }, { status: 500 }));
    }
}
