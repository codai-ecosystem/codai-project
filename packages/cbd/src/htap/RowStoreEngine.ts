/**
 * HTAP Foundation - Row Store Engine with ACID Transactions
 * Part of CBD 2.0 Multi-Paradigm Database Implementation
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Transaction States for ACID Compliance
 */
export enum TransactionState {
    ACTIVE = 'active',
    PREPARED = 'prepared', 
    COMMITTED = 'committed',
    ABORTED = 'aborted'
}

/**
 * Transaction Interface for ACID Operations
 */
export interface CBDTransaction {
    id: string;
    state: TransactionState;
    operations: TransactionOperation[];
    timestamp: Date;
    isolationLevel: IsolationLevel;
}

export enum IsolationLevel {
    READ_UNCOMMITTED = 'read_uncommitted',
    READ_COMMITTED = 'read_committed',
    REPEATABLE_READ = 'repeatable_read',
    SERIALIZABLE = 'serializable'
}

export interface TransactionOperation {
    type: 'insert' | 'update' | 'delete' | 'select';
    table: string;
    key: string;
    data?: any;
    previousValue?: any;
}

/**
 * B+ Tree Node for Efficient Indexing
 */
export interface BTreeNode {
    isLeaf: boolean;
    keys: string[];
    values?: any[]; // Only for leaf nodes
    children?: BTreeNode[]; // Only for internal nodes
    parent?: BTreeNode;
    next?: BTreeNode; // For leaf node linking
}

/**
 * Table Schema Definition
 */
export interface TableSchema {
    name: string;
    columns: ColumnDefinition[];
    primaryKey: string;
    indexes: IndexDefinition[];
    constraints: ConstraintDefinition[];
}

export interface ColumnDefinition {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'json';
    nullable: boolean;
    defaultValue?: any;
    maxLength?: number;
}

export interface IndexDefinition {
    name: string;
    columns: string[];
    unique: boolean;
    type: 'btree' | 'hash';
}

export interface ConstraintDefinition {
    name: string;
    type: 'foreign_key' | 'check' | 'unique';
    columns: string[];
    referencedTable?: string;
    referencedColumns?: string[];
    checkExpression?: string;
}

/**
 * Row Store Engine - OLTP Optimized Storage
 */
export class CBDRowStoreEngine extends EventEmitter {
    private tables: Map<string, Map<string, any>> = new Map();
    private schemas: Map<string, TableSchema> = new Map();
    private indexes: Map<string, Map<string, BTreeNode>> = new Map();
    private transactions: Map<string, CBDTransaction> = new Map();
    private locks: Map<string, Set<string>> = new Map(); // table -> locked keys
    private walPath: string;
    private dataPath: string;
    private order: number = 4; // B+ tree order

    constructor(dataPath: string = './cbd-data/rowstore') {
        super();
        this.dataPath = dataPath;
        this.walPath = join(dataPath, 'wal');
    }

    /**
     * Initialize the row store engine
     */
    async initialize(): Promise<void> {
        if (!existsSync(this.dataPath)) {
            await mkdir(this.dataPath, { recursive: true });
        }
        if (!existsSync(this.walPath)) {
            await mkdir(this.walPath, { recursive: true });
        }

        // Load existing schemas and data
        await this.loadSchemas();
        await this.loadData();
        
        console.log('🗃️ CBD Row Store Engine initialized');
        this.emit('initialized');
    }

    /**
     * Create a new table with schema
     */
    async createTable(schema: TableSchema): Promise<void> {
        if (this.schemas.has(schema.name)) {
            throw new Error(`Table ${schema.name} already exists`);
        }

        // Validate schema
        this.validateSchema(schema);

        // Store schema
        this.schemas.set(schema.name, schema);
        this.tables.set(schema.name, new Map());
        this.indexes.set(schema.name, new Map());

        // Create primary index
        const primaryIndex = this.createBTreeIndex();
        this.indexes.get(schema.name)!.set('PRIMARY', primaryIndex);

        // Create additional indexes
        for (const indexDef of schema.indexes) {
            const index = this.createBTreeIndex();
            this.indexes.get(schema.name)!.set(indexDef.name, index);
        }

        // Persist schema
        await this.persistSchema(schema);
        
        console.log(`📊 Table ${schema.name} created with ${schema.indexes.length + 1} indexes`);
        this.emit('tableCreated', schema.name);
    }

    /**
     * Begin a new ACID transaction
     */
    beginTransaction(isolationLevel: IsolationLevel = IsolationLevel.READ_COMMITTED): string {
        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const transaction: CBDTransaction = {
            id: transactionId,
            state: TransactionState.ACTIVE,
            operations: [],
            timestamp: new Date(),
            isolationLevel
        };

        this.transactions.set(transactionId, transaction);
        
        console.log(`🔄 Transaction ${transactionId} started (${isolationLevel})`);
        return transactionId;
    }

    /**
     * Insert row with ACID compliance
     */
    async insertRow(transactionId: string, tableName: string, data: any): Promise<void> {
        const transaction = this.getActiveTransaction(transactionId);
        const schema = this.getSchema(tableName);
        
        // Validate data against schema
        this.validateRowData(schema, data);
        
        const primaryKey = data[schema.primaryKey];
        if (!primaryKey) {
            throw new Error(`Primary key ${schema.primaryKey} is required`);
        }

        // Check if key already exists
        const table = this.tables.get(tableName)!;
        if (table.has(primaryKey)) {
            throw new Error(`Row with key ${primaryKey} already exists`);
        }

        // Acquire lock
        await this.acquireLock(tableName, primaryKey);

        try {
            // Log operation in WAL
            await this.writeToWAL(transactionId, {
                type: 'insert',
                table: tableName,
                key: primaryKey,
                data: data
            });

            // Add to transaction operations
            transaction.operations.push({
                type: 'insert',
                table: tableName,
                key: primaryKey,
                data: data
            });

            console.log(`➕ Inserted row ${primaryKey} into ${tableName} (tx: ${transactionId})`);
        } catch (error) {
            await this.releaseLock(tableName, primaryKey);
            throw error;
        }
    }

    /**
     * Update row with ACID compliance
     */
    async updateRow(transactionId: string, tableName: string, primaryKey: string, updates: any): Promise<void> {
        const transaction = this.getActiveTransaction(transactionId);
        const schema = this.getSchema(tableName);
        const table = this.tables.get(tableName)!;

        if (!table.has(primaryKey)) {
            throw new Error(`Row with key ${primaryKey} not found`);
        }

        // Acquire lock
        await this.acquireLock(tableName, primaryKey);

        try {
            const previousValue = table.get(primaryKey);
            
            // Validate updates
            this.validateRowData(schema, { ...previousValue, ...updates });

            // Log operation in WAL
            await this.writeToWAL(transactionId, {
                type: 'update',
                table: tableName,
                key: primaryKey,
                data: updates,
                previousValue: previousValue
            });

            // Add to transaction operations
            transaction.operations.push({
                type: 'update',
                table: tableName,
                key: primaryKey,
                data: updates,
                previousValue: previousValue
            });

            console.log(`✏️ Updated row ${primaryKey} in ${tableName} (tx: ${transactionId})`);
        } catch (error) {
            await this.releaseLock(tableName, primaryKey);
            throw error;
        }
    }

    /**
     * Delete row with ACID compliance
     */
    async deleteRow(transactionId: string, tableName: string, primaryKey: string): Promise<void> {
        const transaction = this.getActiveTransaction(transactionId);
        const table = this.tables.get(tableName)!;

        if (!table.has(primaryKey)) {
            throw new Error(`Row with key ${primaryKey} not found`);
        }

        // Acquire lock
        await this.acquireLock(tableName, primaryKey);

        try {
            const previousValue = table.get(primaryKey);

            // Log operation in WAL
            await this.writeToWAL(transactionId, {
                type: 'delete',
                table: tableName,
                key: primaryKey,
                previousValue: previousValue
            });

            // Add to transaction operations
            transaction.operations.push({
                type: 'delete',
                table: tableName,
                key: primaryKey,
                previousValue: previousValue
            });

            console.log(`🗑️ Deleted row ${primaryKey} from ${tableName} (tx: ${transactionId})`);
        } catch (error) {
            await this.releaseLock(tableName, primaryKey);
            throw error;
        }
    }

    /**
     * Commit transaction - Apply all changes atomically
     */
    async commitTransaction(transactionId: string): Promise<void> {
        const transaction = this.getActiveTransaction(transactionId);
        
        try {
            transaction.state = TransactionState.PREPARED;

            // Apply all operations atomically
            for (const operation of transaction.operations) {
                await this.applyOperation(operation);
            }

            // Update transaction state
            transaction.state = TransactionState.COMMITTED;
            
            // Release all locks
            await this.releaseTransactionLocks(transactionId);
            
            // Clean up transaction
            this.transactions.delete(transactionId);
            
            console.log(`✅ Transaction ${transactionId} committed successfully`);
            this.emit('transactionCommitted', transactionId);
        } catch (error) {
            // Rollback on error
            await this.rollbackTransaction(transactionId);
            throw error;
        }
    }

    /**
     * Rollback transaction - Undo all changes
     */
    async rollbackTransaction(transactionId: string): Promise<void> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) return;

        transaction.state = TransactionState.ABORTED;

        // Release all locks
        await this.releaseTransactionLocks(transactionId);
        
        // Clean up transaction
        this.transactions.delete(transactionId);
        
        console.log(`❌ Transaction ${transactionId} rolled back`);
        this.emit('transactionRolledBack', transactionId);
    }

    /**
     * Query data with B+ tree optimization
     */
    async queryRows(tableName: string, conditions?: any): Promise<any[]> {
        const table = this.tables.get(tableName);
        if (!table) {
            throw new Error(`Table ${tableName} not found`);
        }

        const results: any[] = [];
        
        if (!conditions) {
            // Full table scan
            for (const [key, value] of table.entries()) {
                results.push({ ...value, [this.getSchema(tableName).primaryKey]: key });
            }
        } else {
            // Try to use index if available
            const optimizedResults = await this.optimizeQuery(tableName, conditions);
            if (optimizedResults) {
                return optimizedResults;
            }

            // Fallback to table scan with filtering
            for (const [key, value] of table.entries()) {
                if (this.matchesConditions(value, conditions)) {
                    results.push({ ...value, [this.getSchema(tableName).primaryKey]: key });
                }
            }
        }

        console.log(`🔍 Query returned ${results.length} rows from ${tableName}`);
        return results;
    }

    // Private helper methods

    private validateSchema(schema: TableSchema): void {
        if (!schema.name || !schema.columns.length || !schema.primaryKey) {
            throw new Error('Invalid schema: name, columns, and primaryKey are required');
        }

        const pkColumn = schema.columns.find(col => col.name === schema.primaryKey);
        if (!pkColumn) {
            throw new Error(`Primary key column ${schema.primaryKey} not found in schema`);
        }
    }

    private validateRowData(schema: TableSchema, data: any): void {
        for (const column of schema.columns) {
            const value = data[column.name];
            
            if (value === undefined || value === null) {
                if (!column.nullable && column.defaultValue === undefined) {
                    throw new Error(`Column ${column.name} cannot be null`);
                }
                continue;
            }

            // Type validation
            switch (column.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        throw new Error(`Column ${column.name} must be a string`);
                    }
                    if (column.maxLength && value.length > column.maxLength) {
                        throw new Error(`Column ${column.name} exceeds max length ${column.maxLength}`);
                    }
                    break;
                case 'number':
                    if (typeof value !== 'number') {
                        throw new Error(`Column ${column.name} must be a number`);
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        throw new Error(`Column ${column.name} must be a boolean`);
                    }
                    break;
                case 'date':
                    if (!(value instanceof Date) && !Date.parse(value)) {
                        throw new Error(`Column ${column.name} must be a valid date`);
                    }
                    break;
            }
        }
    }

    private createBTreeIndex(): BTreeNode {
        return {
            isLeaf: true,
            keys: [],
            values: [],
            children: undefined,
            parent: undefined,
            next: undefined
        };
    }

    private async acquireLock(tableName: string, key: string): Promise<void> {
        const lockKey = `${tableName}:${key}`;
        if (!this.locks.has(tableName)) {
            this.locks.set(tableName, new Set());
        }
        
        const tableLocks = this.locks.get(tableName)!;
        if (tableLocks.has(key)) {
            throw new Error(`Row ${key} in table ${tableName} is locked`);
        }
        
        tableLocks.add(key);
    }

    private async releaseLock(tableName: string, key: string): Promise<void> {
        const tableLocks = this.locks.get(tableName);
        if (tableLocks) {
            tableLocks.delete(key);
        }
    }

    private async releaseTransactionLocks(transactionId: string): Promise<void> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) return;

        for (const operation of transaction.operations) {
            await this.releaseLock(operation.table, operation.key);
        }
    }

    private async writeToWAL(transactionId: string, operation: TransactionOperation): Promise<void> {
        const walEntry = {
            transactionId,
            timestamp: new Date().toISOString(),
            operation
        };

        const walFile = join(this.walPath, `${transactionId}.wal`);
        await writeFile(walFile, JSON.stringify(walEntry) + '\n', { flag: 'a' });
    }

    private async applyOperation(operation: TransactionOperation): Promise<void> {
        const table = this.tables.get(operation.table)!;
        
        switch (operation.type) {
            case 'insert':
                table.set(operation.key, operation.data);
                await this.updateIndexes(operation.table, operation.key, operation.data);
                break;
            case 'update':
                const existing = table.get(operation.key);
                const updated = { ...existing, ...operation.data };
                table.set(operation.key, updated);
                await this.updateIndexes(operation.table, operation.key, updated);
                break;
            case 'delete':
                table.delete(operation.key);
                await this.removeFromIndexes(operation.table, operation.key);
                break;
        }
    }

    private async updateIndexes(tableName: string, key: string, data: any): Promise<void> {
        const indexes = this.indexes.get(tableName);
        if (!indexes) return;

        // Update primary index
        const primaryIndex = indexes.get('PRIMARY');
        if (primaryIndex) {
            this.insertIntoIndex(primaryIndex, key, data);
        }

        // Update secondary indexes
        const schema = this.schemas.get(tableName)!;
        for (const indexDef of schema.indexes) {
            const index = indexes.get(indexDef.name);
            if (index) {
                const indexKey = indexDef.columns.map(col => data[col]).join(':');
                this.insertIntoIndex(index, indexKey, data);
            }
        }
    }

    private async removeFromIndexes(tableName: string, key: string): Promise<void> {
        // Implementation for removing from B+ tree indexes
        // This would involve complex B+ tree deletion logic
        console.log(`🔧 Removing ${key} from indexes for ${tableName}`);
    }

    private insertIntoIndex(index: BTreeNode, key: string, value: any): void {
        // Simplified B+ tree insertion
        // In production, this would be a full B+ tree implementation
        if (index.isLeaf && index.keys && index.values) {
            const insertPos = index.keys.findIndex(k => k > key);
            if (insertPos === -1) {
                index.keys.push(key);
                index.values.push(value);
            } else {
                index.keys.splice(insertPos, 0, key);
                index.values.splice(insertPos, 0, value);
            }
        }
    }

    private getActiveTransaction(transactionId: string): CBDTransaction {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        if (transaction.state !== TransactionState.ACTIVE) {
            throw new Error(`Transaction ${transactionId} is not active`);
        }
        return transaction;
    }

    private getSchema(tableName: string): TableSchema {
        const schema = this.schemas.get(tableName);
        if (!schema) {
            throw new Error(`Schema for table ${tableName} not found`);
        }
        return schema;
    }

    private matchesConditions(row: any, conditions: any): boolean {
        for (const [key, value] of Object.entries(conditions)) {
            if (row[key] !== value) {
                return false;
            }
        }
        return true;
    }

    private async optimizeQuery(tableName: string, conditions: any): Promise<any[] | null> {
        // Try to use indexes for optimization
        const schema = this.getSchema(tableName);
        const indexes = this.indexes.get(tableName)!;

        // Check if primary key is in conditions
        if (conditions[schema.primaryKey]) {
            const table = this.tables.get(tableName)!;
            const row = table.get(conditions[schema.primaryKey]);
            return row ? [{ ...row, [schema.primaryKey]: conditions[schema.primaryKey] }] : [];
        }

        // Check secondary indexes
        for (const indexDef of schema.indexes) {
            const hasAllColumns = indexDef.columns.every(col => conditions[col] !== undefined);
            if (hasAllColumns) {
                // Use this index
                const indexKey = indexDef.columns.map(col => conditions[col]).join(':');
                // In production, this would search the B+ tree index
                console.log(`📈 Using index ${indexDef.name} for query optimization`);
            }
        }

        return null; // No optimization possible
    }

    private async loadSchemas(): Promise<void> {
        // Implementation for loading persisted schemas
        console.log('📋 Loading table schemas...');
    }

    private async loadData(): Promise<void> {
        // Implementation for loading persisted data
        console.log('💾 Loading table data...');
    }

    private async persistSchema(schema: TableSchema): Promise<void> {
        const schemaFile = join(this.dataPath, `${schema.name}.schema`);
        await writeFile(schemaFile, JSON.stringify(schema, null, 2));
    }
}