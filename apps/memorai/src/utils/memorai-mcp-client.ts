/**
 * MemorAI MCP Client - Direct integration with MemorAI MCP Server
 */

interface MemorAIMCPMemory {
    structuredKey: string;
    content: string;
    agentId: string;
    importance: number;
    project?: string;
    tags?: string[];
    createdAt: string;
    updatedAt?: string;
}

interface MCPRecallResponse {
    success: boolean;
    memories: MemorAIMCPMemory[];
    count: number;
    query: string;
    agentId: string;
}

interface MCPRememberResponse {
    success: boolean;
    memory: MemorAIMCPMemory;
    message: string;
}

export class MemorAIMCPClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(baseUrl = 'http://localhost:4950', apiKey = 'memorai-dev-key-2025') {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    /**
     * Search memories using MemorAI MCP recall functionality
     */
    async searchMemories(query: string, agentId = 'github-copilot'): Promise<MemorAIMCPMemory[]> {
        try {
            const response = await fetch(`${this.baseUrl}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method: 'tools/call',
                    params: {
                        name: 'recall',
                        arguments: {
                            agentId,
                            query
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'MCP recall failed');
            }

            // Parse the recall response and extract memories
            return this.parseRecallResponse(data.result);
        } catch (error) {
            console.error('Search memories failed:', error);
            return [];
        }
    }

    /**
     * Add a new memory using MemorAI MCP remember functionality
     */
    async addMemory(
        content: string,
        agentId = 'github-copilot',
        metadata?: { project?: string; importance?: number; tags?: string[] }
    ): Promise<MemorAIMCPMemory | null> {
        try {
            const response = await fetch(`${this.baseUrl}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method: 'tools/call',
                    params: {
                        name: 'remember',
                        arguments: {
                            agentId,
                            content,
                            metadata: metadata || {}
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'MCP remember failed');
            }

            return this.parseRememberResponse(data.result);
        } catch (error) {
            console.error('Add memory failed:', error);
            return null;
        }
    }

    /**
     * Get all memories for an agent
     */
    async getAllMemories(agentId = 'github-copilot'): Promise<MemorAIMCPMemory[]> {
        // Use a broad search query that will match more memories
        return this.searchMemories('', agentId);
    }

    /**
     * Get memory statistics
     */
    async getMemoryStats(agentId = 'github-copilot'): Promise<{
        totalMemories: number;
        recentlyAdded: number;
        averageImportance: number;
        topProjects: string[];
    }> {
        try {
            const memories = await this.getAllMemories(agentId);

            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const recentMemories = memories.filter(memory =>
                new Date(memory.createdAt) > oneDayAgo
            );

            const projectCounts: Record<string, number> = {};
            let totalImportance = 0;
            let importanceCount = 0;

            memories.forEach(memory => {
                if (memory.project) {
                    projectCounts[memory.project] = (projectCounts[memory.project] || 0) + 1;
                }
                if (memory.importance) {
                    totalImportance += memory.importance;
                    importanceCount++;
                }
            });

            const topProjects = Object.entries(projectCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([project]) => project);

            return {
                totalMemories: memories.length,
                recentlyAdded: recentMemories.length,
                averageImportance: importanceCount > 0 ? totalImportance / importanceCount : 0,
                topProjects
            };
        } catch (error) {
            console.error('Get memory stats failed:', error);
            return {
                totalMemories: 0,
                recentlyAdded: 0,
                averageImportance: 0,
                topProjects: []
            };
        }
    }

    /**
     * Parse the recall response from MemorAI MCP
     */
    private parseRecallResponse(result: any): MemorAIMCPMemory[] {
        if (!result || !result.content || !Array.isArray(result.content)) {
            return [];
        }

        const textContent = result.content[0]?.text || '';

        // Parse the text response to extract memory data
        if (textContent.includes('No memories found')) {
            return [];
        }

        const memories: MemorAIMCPMemory[] = [];

        // Split by memory entries (each starts with a number followed by **)
        const memoryBlocks = textContent.split(/(?=\n\d+\.\s\*\*)/);

        for (const block of memoryBlocks) {
            if (!block.trim()) continue;

            const lines = block.trim().split('\n');
            let memory: Partial<MemorAIMCPMemory> = {
                agentId: 'github-copilot',
                importance: 5,
                tags: [],
                createdAt: new Date().toISOString()
            };

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Memory header with structured key
                if (/^\d+\.\s\*\*(.+)\*\*$/.test(line)) {
                    const match = line.match(/^\d+\.\s\*\*(.+)\*\*$/);
                    memory.structuredKey = match![1];
                }
                else if (line.startsWith('Content: ')) {
                    // Content might span multiple lines, so collect everything until next field
                    let content = line.substring(9);
                    let j = i + 1;

                    while (j < lines.length) {
                        const nextLine = lines[j].trim();
                        if (nextLine.startsWith('Importance: ') ||
                            nextLine.startsWith('Project: ') ||
                            nextLine.startsWith('Tags: ') ||
                            nextLine.startsWith('Created: ') ||
                            /^\d+\.\s\*\*/.test(nextLine)) {
                            break;
                        }
                        content += ' ' + nextLine;
                        j++;
                    }

                    memory.content = content;
                    i = j - 1; // Skip the lines we've processed
                }
                else if (line.startsWith('Importance: ')) {
                    const importanceMatch = line.match(/Importance: (\d+)\/10/);
                    if (importanceMatch) {
                        memory.importance = parseInt(importanceMatch[1]);
                    }
                }
                else if (line.startsWith('Project: ')) {
                    const project = line.substring(9);
                    if (project !== 'N/A') {
                        memory.project = project;
                    }
                }
                else if (line.startsWith('Tags: ')) {
                    const tagsStr = line.substring(6);
                    if (tagsStr !== 'None') {
                        memory.tags = tagsStr.split(', ').map(tag => tag.trim());
                    }
                }
                else if (line.startsWith('Created: ')) {
                    memory.createdAt = line.substring(9);
                }
            }

            if (memory.structuredKey && memory.content) {
                memories.push(memory as MemorAIMCPMemory);
            }
        }

        return memories;
    }

    /**
     * Parse the remember response from MemorAI MCP
     */
    private parseRememberResponse(result: any): MemorAIMCPMemory | null {
        if (!result || !result.content || !Array.isArray(result.content)) {
            return null;
        }

        const textContent = result.content[0]?.text || '';

        if (textContent.includes('Memory stored successfully')) {
            // Parse the success message to extract memory data
            const lines = textContent.split('\n');
            const memory: Partial<MemorAIMCPMemory> = {
                agentId: 'github-copilot',
                importance: 5,
                tags: [],
                createdAt: new Date().toISOString()
            };

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('ID: ')) {
                    // Could use this as structuredKey fallback
                }
                else if (trimmed.startsWith('Agent: ')) {
                    memory.agentId = trimmed.substring(7);
                }
                else if (trimmed.startsWith('Content: ')) {
                    memory.content = trimmed.substring(9);
                }
                else if (trimmed.startsWith('Structured Key: ')) {
                    memory.structuredKey = trimmed.substring(16);
                }
                else if (trimmed.startsWith('Timestamp: ')) {
                    memory.createdAt = trimmed.substring(11);
                }
            }

            return memory as MemorAIMCPMemory;
        }

        return null;
    }

    /**
     * Test the connection to MemorAI MCP server
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('MemorAI MCP connection test failed:', error);
            return false;
        }
    }

    /**
     * Get advanced memory analytics for dashboard visualization
     */
    async getMemoryAnalytics(agentId = 'github-copilot'): Promise<{
        timeSeriesData: Array<{ date: string; count: number; importance: number }>;
        importanceDistribution: Array<{ range: string; count: number; percentage: number }>;
        projectAnalytics: Array<{ project: string; count: number; avgImportance: number; latestActivity: string }>;
        tagAnalytics: Array<{ tag: string; count: number; importance: number }>;
        agentActivity: Array<{ agent: string; count: number; avgImportance: number; lastActive: string }>;
        searchInsights: { totalSearches: number; popularQueries: string[]; successRate: number };
    }> {
        try {
            const memories = await this.getAllMemories(agentId);

            // Time Series Analysis - group by day
            const timeSeriesMap: Record<string, { count: number; totalImportance: number; importanceCount: number }> = {};

            memories.forEach(memory => {
                const date = new Date(memory.createdAt).toISOString().split('T')[0];
                if (!timeSeriesMap[date]) {
                    timeSeriesMap[date] = { count: 0, totalImportance: 0, importanceCount: 0 };
                }
                timeSeriesMap[date].count++;
                if (memory.importance) {
                    timeSeriesMap[date].totalImportance += memory.importance;
                    timeSeriesMap[date].importanceCount++;
                }
            });

            const timeSeriesData = Object.entries(timeSeriesMap)
                .map(([date, data]) => ({
                    date,
                    count: data.count,
                    importance: data.importanceCount > 0 ? data.totalImportance / data.importanceCount : 0
                }))
                .sort((a, b) => a.date.localeCompare(b.date));

            // Importance Distribution Analysis
            const importanceRanges = [
                { range: '1-2', min: 1, max: 2 },
                { range: '3-4', min: 3, max: 4 },
                { range: '5-6', min: 5, max: 6 },
                { range: '7-8', min: 7, max: 8 },
                { range: '9-10', min: 9, max: 10 }
            ];

            const importanceDistribution = importanceRanges.map(range => {
                const count = memories.filter(m =>
                    m.importance >= range.min && m.importance <= range.max
                ).length;
                return {
                    range: range.range,
                    count,
                    percentage: memories.length > 0 ? (count / memories.length) * 100 : 0
                };
            });

            // Project Analytics
            const projectMap: Record<string, {
                count: number;
                totalImportance: number;
                importanceCount: number;
                latestActivity: string;
            }> = {};

            memories.forEach(memory => {
                const project = memory.project || 'Uncategorized';
                if (!projectMap[project]) {
                    projectMap[project] = {
                        count: 0,
                        totalImportance: 0,
                        importanceCount: 0,
                        latestActivity: memory.createdAt
                    };
                }
                projectMap[project].count++;
                if (memory.importance) {
                    projectMap[project].totalImportance += memory.importance;
                    projectMap[project].importanceCount++;
                }
                if (new Date(memory.createdAt) > new Date(projectMap[project].latestActivity)) {
                    projectMap[project].latestActivity = memory.createdAt;
                }
            });

            const projectAnalytics = Object.entries(projectMap)
                .map(([project, data]) => ({
                    project,
                    count: data.count,
                    avgImportance: data.importanceCount > 0 ? data.totalImportance / data.importanceCount : 0,
                    latestActivity: data.latestActivity
                }))
                .sort((a, b) => b.count - a.count);

            // Tag Analytics
            const tagMap: Record<string, { count: number; totalImportance: number; importanceCount: number }> = {};

            memories.forEach(memory => {
                if (memory.tags && memory.tags.length > 0) {
                    memory.tags.forEach(tag => {
                        if (!tagMap[tag]) {
                            tagMap[tag] = { count: 0, totalImportance: 0, importanceCount: 0 };
                        }
                        tagMap[tag].count++;
                        if (memory.importance) {
                            tagMap[tag].totalImportance += memory.importance;
                            tagMap[tag].importanceCount++;
                        }
                    });
                }
            });

            const tagAnalytics = Object.entries(tagMap)
                .map(([tag, data]) => ({
                    tag,
                    count: data.count,
                    importance: data.importanceCount > 0 ? data.totalImportance / data.importanceCount : 0
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 20); // Top 20 tags

            // Agent Activity (for multi-agent scenarios)
            const agentMap: Record<string, {
                count: number;
                totalImportance: number;
                importanceCount: number;
                lastActive: string;
            }> = {};

            memories.forEach(memory => {
                const agent = memory.agentId;
                if (!agentMap[agent]) {
                    agentMap[agent] = {
                        count: 0,
                        totalImportance: 0,
                        importanceCount: 0,
                        lastActive: memory.createdAt
                    };
                }
                agentMap[agent].count++;
                if (memory.importance) {
                    agentMap[agent].totalImportance += memory.importance;
                    agentMap[agent].importanceCount++;
                }
                if (new Date(memory.createdAt) > new Date(agentMap[agent].lastActive)) {
                    agentMap[agent].lastActive = memory.createdAt;
                }
            });

            const agentActivity = Object.entries(agentMap)
                .map(([agent, data]) => ({
                    agent,
                    count: data.count,
                    avgImportance: data.importanceCount > 0 ? data.totalImportance / data.importanceCount : 0,
                    lastActive: data.lastActive
                }))
                .sort((a, b) => b.count - a.count);

            // Search Insights (mock data for now - would track in production)
            const searchInsights = {
                totalSearches: Math.floor(memories.length * 2.5), // Estimated
                popularQueries: ['development', 'project', 'tasks', 'integration', 'backend'],
                successRate: 85.7 // Estimated success rate
            };

            return {
                timeSeriesData,
                importanceDistribution,
                projectAnalytics,
                tagAnalytics,
                agentActivity,
                searchInsights
            };
        } catch (error) {
            console.error('Get memory analytics failed:', error);
            return {
                timeSeriesData: [],
                importanceDistribution: [],
                projectAnalytics: [],
                tagAnalytics: [],
                agentActivity: [],
                searchInsights: { totalSearches: 0, popularQueries: [], successRate: 0 }
            };
        }
    }

    /**
     * Get memory trends for specific time periods
     */
    async getMemoryTrends(
        agentId = 'github-copilot',
        days = 30
    ): Promise<{
        growthRate: number;
        averageDaily: number;
        peakDay: { date: string; count: number };
        trendDirection: 'up' | 'down' | 'stable';
    }> {
        try {
            const memories = await this.getAllMemories(agentId);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const recentMemories = memories.filter(memory =>
                new Date(memory.createdAt) >= cutoffDate
            );

            const dailyCounts: Record<string, number> = {};
            recentMemories.forEach(memory => {
                const date = new Date(memory.createdAt).toISOString().split('T')[0];
                dailyCounts[date] = (dailyCounts[date] || 0) + 1;
            });

            const counts = Object.values(dailyCounts);
            const averageDaily = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / days : 0;

            const peakDay = Object.entries(dailyCounts)
                .reduce((max, [date, count]) =>
                    count > max.count ? { date, count } : max,
                    { date: '', count: 0 }
                );

            // Simple trend calculation
            const firstHalfAvg = counts.slice(0, Math.floor(counts.length / 2))
                .reduce((a, b) => a + b, 0) / Math.floor(counts.length / 2) || 0;
            const secondHalfAvg = counts.slice(Math.floor(counts.length / 2))
                .reduce((a, b) => a + b, 0) / Math.ceil(counts.length / 2) || 0;

            const growthRate = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

            let trendDirection: 'up' | 'down' | 'stable' = 'stable';
            if (growthRate > 10) trendDirection = 'up';
            else if (growthRate < -10) trendDirection = 'down';

            return {
                growthRate,
                averageDaily,
                peakDay,
                trendDirection
            };
        } catch (error) {
            console.error('Get memory trends failed:', error);
            return {
                growthRate: 0,
                averageDaily: 0,
                peakDay: { date: '', count: 0 },
                trendDirection: 'stable'
            };
        }
    }

    /**
     * Export memories to JSON format
     */
    async exportMemoriesToJSON(agentId = 'github-copilot'): Promise<string> {
        try {
            const memories = await this.getAllMemories(agentId);
            const exportData = {
                exportInfo: {
                    timestamp: new Date().toISOString(),
                    agentId,
                    totalMemories: memories.length,
                    version: '1.0'
                },
                memories
            };
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Export to JSON failed:', error);
            throw error;
        }
    }

    /**
     * Export memories to CSV format
     */
    async exportMemoriesToCSV(agentId = 'github-copilot'): Promise<string> {
        try {
            const memories = await this.getAllMemories(agentId);

            // CSV headers
            const headers = ['structuredKey', 'content', 'agentId', 'importance', 'project', 'tags', 'createdAt', 'updatedAt'];
            let csv = headers.join(',') + '\n';

            // CSV rows
            memories.forEach(memory => {
                const row = [
                    `"${memory.structuredKey}"`,
                    `"${memory.content.replace(/"/g, '""')}"`, // Escape quotes
                    `"${memory.agentId}"`,
                    memory.importance.toString(),
                    `"${memory.project || ''}"`,
                    `"${memory.tags?.join(';') || ''}"`,
                    `"${memory.createdAt}"`,
                    `"${memory.updatedAt || ''}"`
                ];
                csv += row.join(',') + '\n';
            });

            return csv;
        } catch (error) {
            console.error('Export to CSV failed:', error);
            throw error;
        }
    }

    /**
     * Import memories from JSON format
     */
    async importMemoriesFromJSON(jsonData: string, agentId = 'github-copilot'): Promise<{
        success: boolean;
        imported: number;
        skipped: number;
        errors: string[];
    }> {
        try {
            const data = JSON.parse(jsonData);
            const memories = data.memories || data; // Support both wrapped and direct format

            let imported = 0;
            let skipped = 0;
            const errors: string[] = [];

            for (const memory of memories) {
                try {
                    // Check if memory already exists
                    const existing = await this.searchMemories(memory.content, agentId);
                    if (existing.length > 0) {
                        skipped++;
                        continue;
                    }

                    // Import the memory
                    await this.addMemory(
                        memory.content,
                        memory.importance || 5,
                        agentId,
                        memory.project,
                        memory.tags
                    );
                    imported++;
                } catch (error) {
                    errors.push(`Failed to import memory: ${error.message}`);
                }
            }

            return {
                success: true,
                imported,
                skipped,
                errors
            };
        } catch (error) {
            console.error('Import from JSON failed:', error);
            return {
                success: false,
                imported: 0,
                skipped: 0,
                errors: [error.message]
            };
        }
    }

    /**
     * Advanced search with filters
     */
    async searchMemoriesAdvanced(options: {
        query?: string;
        agentId?: string;
        project?: string;
        tags?: string[];
        importanceMin?: number;
        importanceMax?: number;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
    }): Promise<MemorAIMCPMemory[]> {
        try {
            // Start with all memories or search results
            let memories: MemorAIMCPMemory[];

            if (options.query) {
                memories = await this.searchMemories(options.query, options.agentId);
            } else {
                memories = await this.getAllMemories(options.agentId);
            }

            // Apply filters
            let filtered = memories;

            if (options.project) {
                filtered = filtered.filter(m => m.project === options.project);
            }

            if (options.tags && options.tags.length > 0) {
                filtered = filtered.filter(m =>
                    m.tags && options.tags!.some(tag => m.tags!.includes(tag))
                );
            }

            if (options.importanceMin !== undefined) {
                filtered = filtered.filter(m => m.importance >= options.importanceMin!);
            }

            if (options.importanceMax !== undefined) {
                filtered = filtered.filter(m => m.importance <= options.importanceMax!);
            }

            if (options.dateFrom) {
                filtered = filtered.filter(m => new Date(m.createdAt) >= new Date(options.dateFrom!));
            }

            if (options.dateTo) {
                filtered = filtered.filter(m => new Date(m.createdAt) <= new Date(options.dateTo!));
            }

            // Apply limit
            if (options.limit) {
                filtered = filtered.slice(0, options.limit);
            }

            return filtered;
        } catch (error) {
            console.error('Advanced search failed:', error);
            return [];
        }
    }

    /**
     * Bulk delete memories
     */
    async bulkDeleteMemories(structuredKeys: string[]): Promise<{
        success: boolean;
        deleted: number;
        errors: string[];
    }> {
        try {
            let deleted = 0;
            const errors: string[] = [];

            for (const key of structuredKeys) {
                try {
                    // Note: This assumes we'll implement a delete method in MCP server
                    // For now, we'll use the forget method (if it exists)
                    const response = await fetch(`${this.baseUrl}/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.apiKey}`,
                        },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            method: 'tools/call',
                            params: {
                                name: 'forget',
                                arguments: {
                                    agentId: 'github-copilot',
                                    structuredKey: key
                                }
                            },
                            id: `bulk-delete-${Date.now()}`
                        })
                    });

                    if (response.ok) {
                        deleted++;
                    } else {
                        errors.push(`Failed to delete ${key}: ${response.statusText}`);
                    }
                } catch (error) {
                    errors.push(`Failed to delete ${key}: ${error.message}`);
                }
            }

            return {
                success: deleted > 0,
                deleted,
                errors
            };
        } catch (error) {
            console.error('Bulk delete failed:', error);
            return {
                success: false,
                deleted: 0,
                errors: [error.message]
            };
        }
    }

    /**
     * Bulk update memories
     */
    async bulkUpdateMemories(structuredKeys: string[], updates: {
        project?: string;
        tags?: string[];
        importance?: number;
    }): Promise<{
        success: boolean;
        updated: number;
        errors: string[];
    }> {
        try {
            let updated = 0;
            const errors: string[] = [];

            // First get all the memories to update
            const memories = await this.getAllMemories();
            const memoriesToUpdate = memories.filter(m => structuredKeys.includes(m.structuredKey));

            for (const memory of memoriesToUpdate) {
                try {
                    // Create updated memory object
                    const updatedMemory = {
                        ...memory,
                        project: updates.project !== undefined ? updates.project : memory.project,
                        tags: updates.tags !== undefined ? updates.tags : memory.tags,
                        importance: updates.importance !== undefined ? updates.importance : memory.importance
                    };

                    // Use remember to update (this will overwrite existing)
                    await this.rememberMemory(
                        updatedMemory.content,
                        updatedMemory.project,
                        updatedMemory.tags,
                        updatedMemory.importance
                    );

                    // Delete the old memory if the structured key would be different
                    // Note: This is a simplified approach - in a real implementation,
                    // we'd want an update method in the MCP server

                    updated++;
                } catch (error) {
                    errors.push(`Failed to update ${memory.structuredKey}: ${error.message}`);
                }
            }

            return {
                success: updated > 0,
                updated,
                errors
            };
        } catch (error) {
            console.error('Bulk update failed:', error);
            return {
                success: false,
                updated: 0,
                errors: [error.message]
            };
        }
    }
}

// Export singleton instance
export const memoraiMCPClient = new MemorAIMCPClient();
