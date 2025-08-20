/**
 * CBD Native Storage Adapter
 * Pure binary storage implementation - no SQL
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import {
    ConversationExchange,
    StorageAdapter,
    SearchQuery,
    DatabaseStats
} from '../types/index.js';

interface CBDHeader {
    version: number;
    recordCount: number;
    lastSequence: number;
    created: number;
    updated: number;
}

export class CBDNativeStorageAdapter implements StorageAdapter {
    private dataPath: string;
    private header: CBDHeader | null = null;
    private indexCache: Map<string, number> = new Map(); // key -> file position
    private connected = false;

    constructor(dataPath: string = './cbd-data') {
        this.dataPath = dataPath;
    }

    async connect(): Promise<void> {
        try {
            // Create data directory structure
            await fs.mkdir(this.dataPath, { recursive: true });
            await fs.mkdir(join(this.dataPath, 'records'), { recursive: true });
            await fs.mkdir(join(this.dataPath, 'indexes'), { recursive: true });

            // Load or create header
            await this.loadHeader();

            // Build index cache
            await this.buildIndexCache();

            this.connected = true;
            console.log(`📁 Connected to CBD native storage: ${this.dataPath}`);
        } catch (error) {
            throw new Error(`Failed to connect to CBD storage: ${error}`);
        }
    }

    async disconnect(): Promise<void> {
        if (this.connected) {
            await this.saveHeader();
            this.connected = false;
            console.log('📁 CBD storage connection closed');
        }
    }

    async storeConversation(exchange: ConversationExchange): Promise<string> {
        if (!this.connected) throw new Error('Storage not connected');

        try {
            // Create binary record
            const record = this.serializeExchange(exchange);

            // Write to records file
            const recordsFile = join(this.dataPath, 'records', 'data.cbd');
            const position = await this.appendToFile(recordsFile, record);

            // Update index
            this.indexCache.set(exchange.structuredKey, position);
            await this.updateIndex(exchange.structuredKey, position);

            // Update header
            if (this.header) {
                this.header.recordCount++;
                this.header.updated = Date.now();
                await this.saveHeader();
            }

            return exchange.structuredKey;
        } catch (error) {
            throw new Error(`Failed to store conversation: ${error}`);
        }
    }

    async getConversation(structuredKey: string): Promise<ConversationExchange | null> {
        if (!this.connected) throw new Error('Storage not connected');

        try {
            const position = this.indexCache.get(structuredKey);
            if (position === undefined) return null;

            const recordsFile = join(this.dataPath, 'records', 'data.cbd');
            const record = await this.readFromFile(recordsFile, position);

            return this.deserializeExchange(record);
        } catch (error) {
            console.error(`Failed to get conversation ${structuredKey}:`, error);
            return null;
        }
    }

    async searchConversations(query: SearchQuery): Promise<ConversationExchange[]> {
        if (!this.connected) throw new Error('Storage not connected');

        const results: ConversationExchange[] = [];

        try {
            // For now, do a simple scan (in production, would use sophisticated indexing)
            for (const [, position] of this.indexCache) {
                if (results.length >= (query.limit || 50)) break;

                const recordsFile = join(this.dataPath, 'records', 'data.cbd');
                const record = await this.readFromFile(recordsFile, position);
                const exchange = this.deserializeExchange(record);

                if (this.matchesQuery(exchange, query)) {
                    results.push(exchange);
                }
            }

            return results;
        } catch (error) {
            throw new Error(`Search failed: ${error}`);
        }
    }

    async updateConversation(structuredKey: string, updates: Partial<ConversationExchange>): Promise<boolean> {
        if (!this.connected) throw new Error('Storage not connected');

        try {
            const existing = await this.getConversation(structuredKey);
            if (!existing) return false;

            const updated = { ...existing, ...updates, updatedAt: new Date() };
            await this.storeConversation(updated);

            return true;
        } catch (error) {
            console.error(`Failed to update conversation ${structuredKey}:`, error);
            return false;
        }
    }

    async deleteConversation(structuredKey: string): Promise<boolean> {
        if (!this.connected) throw new Error('Storage not connected');

        try {
            const existed = this.indexCache.has(structuredKey);
            if (existed) {
                this.indexCache.delete(structuredKey);
                await this.updateIndex(structuredKey, -1); // Mark as deleted

                if (this.header) {
                    this.header.recordCount--;
                    this.header.updated = Date.now();
                    await this.saveHeader();
                }
            }

            return existed;
        } catch (error) {
            console.error(`Failed to delete conversation ${structuredKey}:`, error);
            return false;
        }
    }

    async getStats(): Promise<DatabaseStats> {
        if (!this.connected) throw new Error('Storage not connected');

        try {
            const projects = new Set<string>();
            const sessions = new Set<string>();
            const agents = new Set<string>();
            let totalConfidence = 0;
            let count = 0;

            // Collect stats by scanning conversations
            for (const [, position] of this.indexCache) {
                try {
                    const recordsFile = join(this.dataPath, 'records', 'data.cbd');
                    const record = await this.readFromFile(recordsFile, position);
                    const exchange = this.deserializeExchange(record);

                    projects.add(exchange.projectName);
                    sessions.add(exchange.sessionName);
                    agents.add(exchange.agentId);
                    totalConfidence += exchange.confidenceScore;
                    count++;
                } catch (error) {
                    // Skip corrupted records
                    continue;
                }
            }

            return {
                totalMemories: this.header?.recordCount || 0,
                uniqueAgents: agents.size,
                uniqueProjects: projects.size,
                uniqueSessions: sessions.size,
                averageConfidence: count > 0 ? totalConfidence / count : 0,
                databaseSize: 0, // Would need to calculate file sizes
                lastUpdated: new Date(this.header?.updated || Date.now())
            };
        } catch (error) {
            throw new Error(`Failed to get stats: ${error}`);
        }
    }

    async getNextSequenceNumber(projectName: string, sessionName: string): Promise<number> {
        if (!this.connected) throw new Error('Storage not connected');

        let maxSequence = 0;

        // Scan existing records to find max sequence
        for (const [key] of this.indexCache) {
            const keyParts = key.split('_');
            if (keyParts.length >= 4 && keyParts[0] === projectName && keyParts[2] === sessionName) {
                const sequenceStr = keyParts[3];
                if (sequenceStr) {
                    const sequence = parseInt(sequenceStr);
                    if (!isNaN(sequence) && sequence > maxSequence) {
                        maxSequence = sequence;
                    }
                }
            }
        }

        return maxSequence + 1;
    }

    // Private implementation methods
    private async loadHeader(): Promise<void> {
        const headerFile = join(this.dataPath, 'header.cbd');

        try {
            const data = await fs.readFile(headerFile);
            this.header = this.deserializeHeader(data);
        } catch (error) {
            // Create new header if file doesn't exist
            this.header = {
                version: 1,
                recordCount: 0,
                lastSequence: 0,
                created: Date.now(),
                updated: Date.now()
            };
            await this.saveHeader();
        }
    }

    private async saveHeader(): Promise<void> {
        if (!this.header) return;

        const headerFile = join(this.dataPath, 'header.cbd');
        const data = this.serializeHeader(this.header);
        await fs.writeFile(headerFile, data);
    }

    private async buildIndexCache(): Promise<void> {
        const indexFile = join(this.dataPath, 'indexes', 'main.idx');

        try {
            const data = await fs.readFile(indexFile);
            this.indexCache = this.deserializeIndex(data);
        } catch (error) {
            // Index file doesn't exist, start fresh
            this.indexCache = new Map();
        }
    }

    private async updateIndex(key: string, position: number): Promise<void> {
        const indexFile = join(this.dataPath, 'indexes', 'main.idx');

        if (position === -1) {
            this.indexCache.delete(key);
        } else {
            this.indexCache.set(key, position);
        }

        const data = this.serializeIndex(this.indexCache);
        await fs.writeFile(indexFile, data);
    }

    private serializeExchange(exchange: ConversationExchange): Buffer {
        const data = {
            structuredKey: exchange.structuredKey,
            projectName: exchange.projectName,
            sessionName: exchange.sessionName,
            sequenceNumber: exchange.sequenceNumber,
            agentId: exchange.agentId,
            userRequest: exchange.userRequest,
            assistantResponse: exchange.assistantResponse,
            conversationContext: exchange.conversationContext,
            metadata: exchange.metadata,
            vectorEmbedding: exchange.vectorEmbedding ? Array.from(exchange.vectorEmbedding) : null,
            confidenceScore: exchange.confidenceScore,
            createdAt: exchange.createdAt.getTime(),
            updatedAt: exchange.updatedAt.getTime()
        };

        const json = JSON.stringify(data);
        const jsonBuffer = Buffer.from(json, 'utf8');
        const lengthBuffer = Buffer.allocUnsafe(4);
        lengthBuffer.writeUInt32BE(jsonBuffer.length, 0);

        return Buffer.concat([lengthBuffer, jsonBuffer]);
    }

    private deserializeExchange(data: Buffer): ConversationExchange {
        const json = data.toString('utf8');
        const parsed = JSON.parse(json);

        return {
            id: parsed.id,
            structuredKey: parsed.structuredKey,
            projectName: parsed.projectName,
            sessionName: parsed.sessionName,
            sequenceNumber: parsed.sequenceNumber,
            agentId: parsed.agentId,
            userRequest: parsed.userRequest,
            assistantResponse: parsed.assistantResponse,
            conversationContext: parsed.conversationContext || undefined,
            metadata: parsed.metadata,
            vectorEmbedding: parsed.vectorEmbedding ? new Float32Array(parsed.vectorEmbedding) : undefined,
            confidenceScore: parsed.confidenceScore,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt)
        };
    }

    private serializeHeader(header: CBDHeader): Buffer {
        const buffer = Buffer.allocUnsafe(28); // 3 * 4 + 2 * 8 bytes for timestamps
        buffer.writeUInt32BE(header.version, 0);
        buffer.writeUInt32BE(header.recordCount, 4);
        buffer.writeUInt32BE(header.lastSequence, 8);
        buffer.writeBigUInt64BE(BigInt(header.created), 12);
        buffer.writeBigUInt64BE(BigInt(header.updated), 20);
        return buffer;
    }

    private deserializeHeader(data: Buffer): CBDHeader {
        return {
            version: data.readUInt32BE(0),
            recordCount: data.readUInt32BE(4),
            lastSequence: data.readUInt32BE(8),
            created: Number(data.readBigUInt64BE(12)),
            updated: Number(data.readBigUInt64BE(20))
        };
    }

    private serializeIndex(index: Map<string, number>): Buffer {
        const entries = Array.from(index.entries());
        const data = JSON.stringify(entries);
        return Buffer.from(data, 'utf8');
    }

    private deserializeIndex(data: Buffer): Map<string, number> {
        const json = data.toString('utf8');
        const entries = JSON.parse(json);
        return new Map(entries);
    }

    private async appendToFile(filePath: string, data: Buffer): Promise<number> {
        let position = 0;

        try {
            const stat = await fs.stat(filePath);
            position = stat.size;
        } catch (error) {
            // File doesn't exist, start at position 0
        }

        await fs.appendFile(filePath, data);
        return position;
    }

    private async readFromFile(filePath: string, position: number): Promise<Buffer> {
        const fd = await fs.open(filePath, 'r');

        try {
            // Read length first
            const lengthBuffer = Buffer.allocUnsafe(4);
            await fd.read(lengthBuffer, 0, 4, position);
            const length = lengthBuffer.readUInt32BE(0);

            // Read actual data
            const dataBuffer = Buffer.allocUnsafe(length);
            await fd.read(dataBuffer, 0, length, position + 4);

            return dataBuffer;
        } finally {
            await fd.close();
        }
    }

    private matchesQuery(exchange: ConversationExchange, query: SearchQuery): boolean {
        // Simple text matching - in production would use more sophisticated matching
        if (query.query) {
            const searchText = `${exchange.userRequest} ${exchange.assistantResponse}`.toLowerCase();
            if (!searchText.includes(query.query.toLowerCase())) {
                return false;
            }
        }

        if (query.projectFilter && exchange.projectName !== query.projectFilter) {
            return false;
        }

        if (query.sessionFilter && exchange.sessionName !== query.sessionFilter) {
            return false;
        }

        if (query.agentFilter && exchange.agentId !== query.agentFilter) {
            return false;
        }

        if (query.confidenceThreshold && exchange.confidenceScore < query.confidenceThreshold) {
            return false;
        }

        if (query.timeRange) {
            if (exchange.createdAt < query.timeRange.start || exchange.createdAt > query.timeRange.end) {
                return false;
            }
        }

        return true;
    }
}
