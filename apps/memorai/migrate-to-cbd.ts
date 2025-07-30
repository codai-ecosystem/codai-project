/**
 * MemorAI Legacy Data Migration Utility
 * Phase 2.2: Migrate all legacy memory data to CBD system
 */

import { createCBDEngine } from '@codai/cbd';
import type { CBDMemoryEngine } from '@codai/cbd';
import { readFile, writeFile, access, readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

interface LegacyMemory {
    structured_key?: string;
    key?: string;
    id?: string;
    content: string;
    project_name?: string;
    project?: string;
    session_name?: string;
    session?: string;
    agent_id?: string;
    agent?: string;
    timestamp?: string;
    created_at?: string;
    metadata?: any;
    user_request?: string;
    assistant_response?: string;
    response?: string;
}

interface MigrationReport {
    timestamp: string;
    totalSources: number;
    totalMemoriesFound: number;
    successfulMigrations: number;
    failedMigrations: number;
    skippedMemories: number;
    migrationDuration: string;
    sources: {
        name: string;
        type: string;
        path: string;
        memoriesFound: number;
        migrated: number;
        failed: number;
        errors: string[];
    }[];
    errors: string[];
    warnings: string[];
}

export class MemorAILegacyMigration {
    private cbdEngine: CBDMemoryEngine;
    private migrationReport: MigrationReport;
    private startTime: number;

    constructor() {
        this.startTime = Date.now();
        this.migrationReport = {
            timestamp: new Date().toISOString(),
            totalSources: 0,
            totalMemoriesFound: 0,
            successfulMigrations: 0,
            failedMigrations: 0,
            skippedMemories: 0,
            migrationDuration: '0ms',
            sources: [],
            errors: [],
            warnings: []
        };

        // Initialize CBD engine for migration
        this.cbdEngine = createCBDEngine({
            storage: {
                type: 'cbd-native',
                dataPath: process.env.MEMORAI_CBD_PATH || './memorai-cbd-data'
            },
            embedding: {
                model: 'openai',
                apiKey: process.env.OPENAI_API_KEY,
                modelName: 'text-embedding-ada-002',
                dimensions: 1536
            },
            vector: {
                indexType: 'faiss',
                dimensions: 1536,
                similarityMetric: 'cosine'
            }
        });
    }

    /**
     * Execute comprehensive migration from all legacy sources
     */
    async migrateAllSources(): Promise<MigrationReport> {
        console.log('🔄 Starting MemorAI legacy data migration to CBD...');
        
        try {
            // Initialize CBD engine
            await this.cbdEngine.initialize();
            console.log('✅ CBD engine initialized for migration');

            // Define migration sources
            const migrationSources = [
                {
                    name: 'JSON Files Storage',
                    type: 'json',
                    path: join(homedir(), '.memorai-mcp-data'),
                    extractor: this.extractJSONMemories.bind(this)
                },
                {
                    name: 'Enhanced JSON Storage',
                    type: 'enhanced_json',
                    path: join(homedir(), '.memorai-mcp-enhanced'),
                    extractor: this.extractEnhancedMemories.bind(this)
                },
                {
                    name: 'Project Local JSON',
                    type: 'local_json',
                    path: './memorai-mcp-data',
                    extractor: this.extractJSONMemories.bind(this)
                },
                {
                    name: 'Recovery Backup',
                    type: 'backup',
                    path: './memorai-migration-backup/memorai-legacy-backup.json',
                    extractor: this.extractBackupMemories.bind(this)
                }
            ];

            // Process each source
            for (const source of migrationSources) {
                await this.migrateFromSource(source);
            }

            // Generate final report
            this.migrationReport.migrationDuration = `${Date.now() - this.startTime}ms`;
            await this.saveMigrationReport();

            console.log('✅ Migration completed successfully');
            console.log(`📊 Migrated ${this.migrationReport.successfulMigrations}/${this.migrationReport.totalMemoriesFound} memories`);

            return this.migrationReport;

        } catch (error: any) {
            console.error('❌ Migration failed:', error.message);
            this.migrationReport.errors.push(`Migration failed: ${error.message}`);
            throw error;
        } finally {
            await this.cbdEngine.shutdown();
        }
    }

    /**
     * Migrate memories from a specific source
     */
    private async migrateFromSource(source: any): Promise<void> {
        console.log(`🔍 Processing source: ${source.name}`);

        const sourceReport = {
            name: source.name,
            type: source.type,
            path: source.path,
            memoriesFound: 0,
            migrated: 0,
            failed: 0,
            errors: []
        };

        try {
            // Check if source exists
            const exists = await this.pathExists(source.path);
            if (!exists) {
                console.log(`⏭️  Source not found: ${source.path}`);
                sourceReport.errors.push('Source path not found');
                this.migrationReport.sources.push(sourceReport);
                return;
            }

            // Extract memories from source
            const memories = await source.extractor(source.path);
            sourceReport.memoriesFound = memories.length;
            this.migrationReport.totalMemoriesFound += memories.length;

            console.log(`📊 Found ${memories.length} memories in ${source.name}`);

            // Migrate each memory
            for (const [index, memory] of memories.entries()) {
                try {
                    await this.migrateMemory(memory, source.name, index);
                    sourceReport.migrated++;
                    this.migrationReport.successfulMigrations++;
                } catch (error: any) {
                    console.error(`❌ Failed to migrate memory ${index}: ${error.message}`);
                    sourceReport.failed++;
                    sourceReport.errors.push(`Memory ${index}: ${error.message}`);
                    this.migrationReport.failedMigrations++;
                }
            }

        } catch (error: any) {
            console.error(`❌ Source processing failed: ${error.message}`);
            sourceReport.errors.push(`Source processing failed: ${error.message}`);
        }

        this.migrationReport.sources.push(sourceReport);
        this.migrationReport.totalSources++;
    }

    /**
     * Migrate a single memory to CBD
     */
    private async migrateMemory(memory: LegacyMemory, sourceName: string, index: number): Promise<void> {
        // Normalize memory data
        const normalizedMemory = this.normalizeMemoryFormat(memory);

        // Skip if no content
        if (!normalizedMemory.content || normalizedMemory.content.trim().length === 0) {
            this.migrationReport.skippedMemories++;
            return;
        }

        // Extract user request and assistant response
        let userRequest = normalizedMemory.content;
        let assistantResponse = 'Migrated legacy memory';

        // Try to extract conversation parts if available
        if (memory.user_request && memory.assistant_response) {
            userRequest = memory.user_request;
            assistantResponse = memory.assistant_response;
        } else if (memory.response) {
            assistantResponse = memory.response;
        }

        // Build metadata for CBD storage
        const metadata = {
            projectName: normalizedMemory.projectName || 'legacy_migration',
            sessionName: normalizedMemory.sessionName || 'imported',
            agentId: normalizedMemory.agentId || 'legacy_system',
            sequenceNumber: index + 1,
            migratedFrom: sourceName,
            originalKey: normalizedMemory.structuredKey,
            migrationTimestamp: new Date().toISOString(),
            legacyMetadata: normalizedMemory.metadata || {}
        };

        // Store in CBD
        const structuredKey = await this.cbdEngine.store_memory(
            userRequest,
            assistantResponse,
            metadata
        );

        console.log(`✅ Migrated: ${normalizedMemory.structuredKey} → ${structuredKey}`);
    }

    /**
     * Extract memories from JSON files
     */
    private async extractJSONMemories(sourcePath: string): Promise<LegacyMemory[]> {
        const memories: LegacyMemory[] = [];

        try {
            const memoriesFile = join(sourcePath, 'memories.json');
            if (await this.pathExists(memoriesFile)) {
                const data = await readFile(memoriesFile, 'utf8');
                const parsed = JSON.parse(data);
                
                if (Array.isArray(parsed)) {
                    memories.push(...parsed);
                } else if (parsed.memories && Array.isArray(parsed.memories)) {
                    memories.push(...parsed.memories);
                }
            }
        } catch (error: any) {
            console.error(`Failed to extract JSON memories: ${error.message}`);
        }

        return memories;
    }

    /**
     * Extract memories from enhanced JSON format
     */
    private async extractEnhancedMemories(sourcePath: string): Promise<LegacyMemory[]> {
        const memories: LegacyMemory[] = [];

        try {
            const files = await readdir(sourcePath);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = join(sourcePath, file);
                    const data = await readFile(filePath, 'utf8');
                    const parsed = JSON.parse(data);
                    
                    if (Array.isArray(parsed)) {
                        memories.push(...parsed);
                    } else if (parsed.memories && Array.isArray(parsed.memories)) {
                        memories.push(...parsed.memories);
                    } else if (parsed.content || parsed.user_request) {
                        memories.push(parsed);
                    }
                }
            }
        } catch (error: any) {
            console.error(`Failed to extract enhanced memories: ${error.message}`);
        }

        return memories;
    }

    /**
     * Extract memories from backup file
     */
    private async extractBackupMemories(backupPath: string): Promise<LegacyMemory[]> {
        try {
            const data = await readFile(backupPath, 'utf8');
            const parsed = JSON.parse(data);
            
            if (parsed.memories && Array.isArray(parsed.memories)) {
                return parsed.memories;
            }
        } catch (error: any) {
            console.error(`Failed to extract backup memories: ${error.message}`);
        }

        return [];
    }

    /**
     * Normalize memory format for consistent processing
     */
    private normalizeMemoryFormat(memory: LegacyMemory): {
        structuredKey: string;
        content: string;
        projectName: string;
        sessionName: string;
        agentId: string;
        timestamp: string;
        metadata: any;
    } {
        return {
            structuredKey: memory.structured_key || memory.key || memory.id || `legacy_${Date.now()}`,
            content: memory.content || memory.user_request || '',
            projectName: memory.project_name || memory.project || 'legacy',
            sessionName: memory.session_name || memory.session || 'imported',
            agentId: memory.agent_id || memory.agent || 'legacy_system',
            timestamp: memory.timestamp || memory.created_at || new Date().toISOString(),
            metadata: memory.metadata || {}
        };
    }

    /**
     * Check if path exists
     */
    private async pathExists(path: string): Promise<boolean> {
        try {
            await access(path);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Save migration report
     */
    private async saveMigrationReport(): Promise<void> {
        const reportPath = './memorai-migration-report.json';
        await writeFile(reportPath, JSON.stringify(this.migrationReport, null, 2));
        console.log(`📄 Migration report saved: ${reportPath}`);
    }

    /**
     * Validate migration results
     */
    async validateMigration(): Promise<{
        valid: boolean;
        cbdMemoryCount: number;
        searchTest: boolean;
        errors: string[];
    }> {
        console.log('🔍 Validating migration results...');

        const validation = {
            valid: false,
            cbdMemoryCount: 0,
            searchTest: false,
            errors: []
        };

        try {
            await this.cbdEngine.initialize();

            // Test basic search to count memories
            const searchResult = await this.cbdEngine.search_memory('migration test', 1000);
            validation.cbdMemoryCount = searchResult.memories.length;

            // Test specific memory retrieval
            if (searchResult.memories.length > 0) {
                const testKey = searchResult.memories[0].memory.structuredKey;
                const retrievedMemory = await this.cbdEngine.get_memory(testKey);
                validation.searchTest = retrievedMemory !== null;
            }

            validation.valid = validation.cbdMemoryCount > 0 && validation.searchTest;

            console.log(`✅ Validation results: ${validation.cbdMemoryCount} memories accessible`);

        } catch (error: any) {
            validation.errors.push(`Validation failed: ${error.message}`);
            console.error('❌ Migration validation failed:', error.message);
        } finally {
            await this.cbdEngine.shutdown();
        }

        return validation;
    }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    const migration = new MemorAILegacyMigration();
    
    migration.migrateAllSources()
        .then(async (report) => {
            console.log('🎉 Migration completed successfully');
            console.log(`📊 Final stats: ${report.successfulMigrations}/${report.totalMemoriesFound} memories migrated`);
            
            // Validate migration
            const validation = await migration.validateMigration();
            console.log(`🔍 Validation: ${validation.cbdMemoryCount} memories accessible in CBD`);
            
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}
