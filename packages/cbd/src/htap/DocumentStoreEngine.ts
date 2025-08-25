/**
 * Document Store Engine - JSON/BSON Storage with Flexible Schemas
 * Part of CBD 2.0 Multi-Paradigm Database Implementation
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

/**
 * Document schema definition (flexible)
 */
export interface DocumentSchema {
    name: string;
    version: string;
    fields: Record<string, FieldDefinition>;
    indexes: IndexDefinition[];
    validationRules?: ValidationRule[];
    relationships?: RelationshipDefinition[];
}

export interface FieldDefinition {
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'mixed';
    required?: boolean;
    default?: any;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        enum?: any[];
    };
    indexed?: boolean;
}

export interface IndexDefinition {
    name: string;
    fields: string[];
    type: 'btree' | 'hash' | 'text' | 'geo' | 'compound';
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
}

export interface ValidationRule {
    field: string;
    rule: 'required' | 'unique' | 'format' | 'custom';
    value?: any;
    customValidator?: (value: any, document: any) => boolean;
    message?: string;
}

export interface RelationshipDefinition {
    name: string;
    type: 'one_to_one' | 'one_to_many' | 'many_to_many';
    targetCollection: string;
    foreignKey: string;
    localKey?: string;
}

/**
 * Document query interface (MongoDB-like)
 */
export interface DocumentQuery {
    collection: string;
    filter?: Record<string, any>;
    projection?: Record<string, 1 | 0>;
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
    hint?: string; // Index hint
}

/**
 * Document aggregation pipeline
 */
export interface AggregationPipeline {
    collection: string;
    pipeline: PipelineStage[];
    options?: {
        allowDiskUse?: boolean;
        maxTimeMS?: number;
        hint?: string;
    };
}

export interface PipelineStage {
    $match?: Record<string, any>;
    $group?: {
        _id: any;
        [key: string]: any;
    };
    $project?: Record<string, any>;
    $sort?: Record<string, 1 | -1>;
    $limit?: number;
    $skip?: number;
    $lookup?: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
    };
    $unwind?: string | { path: string; preserveNullAndEmptyArrays?: boolean };
}

/**
 * Document modification operations
 */
export interface DocumentUpdate {
    $set?: Record<string, any>;
    $unset?: Record<string, 1>;
    $inc?: Record<string, number>;
    $push?: Record<string, any>;
    $pull?: Record<string, any>;
    $addToSet?: Record<string, any>;
    $rename?: Record<string, string>;
}

/**
 * Collection statistics
 */
export interface CollectionStats {
    documentCount: number;
    averageDocumentSize: number;
    totalSize: number;
    indexCount: number;
    indexSizes: Record<string, number>;
    queryStats: {
        totalQueries: number;
        avgExecutionTime: number;
        indexUsage: Record<string, number>;
    };
}

/**
 * Document Store Engine with MongoDB-compatible operations
 */
export class CBDDocumentStoreEngine extends EventEmitter {
    private collections: Map<string, Map<string, any>> = new Map(); // Collection -> DocumentId -> Document
    private schemas: Map<string, DocumentSchema> = new Map();
    private indexes: Map<string, Map<string, Map<any, string[]>>> = new Map(); // Collection -> Index -> Value -> DocumentIds
    private dataPath: string;
    private queryCache: Map<string, { result: any; timestamp: number; ttl: number }> = new Map();
    private stats: Map<string, CollectionStats> = new Map();

    constructor(dataPath: string = './cbd-data/documents') {
        super();
        this.dataPath = dataPath;
    }

    /**
     * Initialize the document store engine
     */
    async initialize(): Promise<void> {
        console.log('📄 Initializing CBD Document Store Engine...');
        
        if (!existsSync(this.dataPath)) {
            await mkdir(this.dataPath, { recursive: true });
        }

        await this.loadCollections();
        await this.loadSchemas();
        await this.rebuildIndexes();

        console.log('✅ Document Store Engine initialized');
        this.emit('initialized');
    }

    /**
     * Create or update collection schema
     */
    async createCollection(name: string, schema?: DocumentSchema): Promise<void> {
        if (!this.collections.has(name)) {
            this.collections.set(name, new Map());
            this.indexes.set(name, new Map());
            this.stats.set(name, {
                documentCount: 0,
                averageDocumentSize: 0,
                totalSize: 0,
                indexCount: 0,
                indexSizes: {},
                queryStats: {
                    totalQueries: 0,
                    avgExecutionTime: 0,
                    indexUsage: {}
                }
            });
        }

        if (schema) {
            this.schemas.set(name, schema);
            await this.createIndexes(name, schema.indexes || []);
        }

        await this.persistCollection(name);
        console.log(`📂 Collection '${name}' created successfully`);
        this.emit('collectionCreated', name);
    }

    /**
     * Insert single document
     */
    async insertOne(collection: string, document: any): Promise<{ insertedId: string; acknowledged: boolean }> {
        const collectionData = this.collections.get(collection);
        if (!collectionData) {
            throw new Error(`Collection '${collection}' not found`);
        }

        // Validate document against schema
        await this.validateDocument(collection, document);

        // Generate ID if not provided
        if (!document._id) {
            document._id = randomUUID();
        }

        const documentId = String(document._id);

        // Check for unique constraints
        await this.checkUniqueConstraints(collection, document, documentId);

        // Insert document
        collectionData.set(documentId, { ...document, _createdAt: new Date(), _updatedAt: new Date() });

        // Update indexes
        await this.updateIndexesForDocument(collection, document, documentId, 'insert');

        // Update statistics
        await this.updateCollectionStats(collection);

        // Persist changes
        await this.persistCollection(collection);

        console.log(`➕ Document inserted into '${collection}' with ID: ${documentId}`);
        this.emit('documentInserted', collection, documentId, document);

        return { insertedId: documentId, acknowledged: true };
    }

    /**
     * Insert multiple documents
     */
    async insertMany(collection: string, documents: any[]): Promise<{ insertedIds: string[]; acknowledged: boolean }> {
        const insertedIds: string[] = [];
        
        for (const document of documents) {
            const result = await this.insertOne(collection, document);
            insertedIds.push(result.insertedId);
        }

        console.log(`➕ Inserted ${insertedIds.length} documents into '${collection}'`);
        return { insertedIds, acknowledged: true };
    }

    /**
     * Find documents with query
     */
    async find(query: DocumentQuery): Promise<any[]> {
        const startTime = Date.now();
        
        // Check cache first
        const cacheKey = this.getCacheKey(query);
        const cached = this.queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            console.log('⚡ Query result served from cache');
            return cached.result;
        }

        const collectionData = this.collections.get(query.collection);
        if (!collectionData) {
            throw new Error(`Collection '${query.collection}' not found`);
        }

        let documents: any[] = [];

        // Use index if available for optimization
        if (query.filter && this.canUseIndex(query.collection, query.filter)) {
            documents = await this.findWithIndex(query);
        } else {
            // Full collection scan
            for (const [id, doc] of collectionData.entries()) {
                if (!query.filter || this.matchesFilter(doc, query.filter)) {
                    documents.push({ ...doc });
                }
            }
        }

        // Apply projection
        if (query.projection) {
            documents = this.applyProjection(documents, query.projection);
        }

        // Apply sorting
        if (query.sort) {
            documents = this.applySorting(documents, query.sort);
        }

        // Apply skip and limit
        if (query.skip) {
            documents = documents.slice(query.skip);
        }
        if (query.limit) {
            documents = documents.slice(0, query.limit);
        }

        const executionTime = Date.now() - startTime;

        // Cache results
        this.cacheQuery(cacheKey, documents, 300000); // 5 minutes TTL

        // Update query statistics
        await this.updateQueryStats(query.collection, executionTime);

        console.log(`🔍 Found ${documents.length} documents in ${executionTime}ms`);
        return documents;
    }

    /**
     * Find single document
     */
    async findOne(query: DocumentQuery): Promise<any | null> {
        const limitedQuery = { ...query, limit: 1 };
        const results = await this.find(limitedQuery);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Update documents
     */
    async updateMany(
        collection: string, 
        filter: Record<string, any>, 
        update: DocumentUpdate,
        options?: { upsert?: boolean }
    ): Promise<{ matchedCount: number; modifiedCount: number; upsertedId?: string }> {
        const collectionData = this.collections.get(collection);
        if (!collectionData) {
            throw new Error(`Collection '${collection}' not found`);
        }

        const matchedDocuments = await this.find({ collection, filter });
        let modifiedCount = 0;
        let upsertedId: string | undefined;

        if (matchedDocuments.length === 0 && options?.upsert) {
            // Perform upsert
            const newDocument = this.mergeUpdateOperations({}, update);
            Object.assign(newDocument, filter); // Include filter fields
            const result = await this.insertOne(collection, newDocument);
            upsertedId = result.insertedId;
            return { matchedCount: 0, modifiedCount: 0, upsertedId };
        }

        for (const doc of matchedDocuments) {
            const documentId = doc._id;
            const originalDoc = collectionData.get(documentId);
            
            if (originalDoc) {
                const updatedDoc = this.mergeUpdateOperations(originalDoc, update);
                updatedDoc._updatedAt = new Date();
                
                // Validate updated document
                await this.validateDocument(collection, updatedDoc);
                
                // Update document
                collectionData.set(documentId, updatedDoc);
                
                // Update indexes
                await this.updateIndexesForDocument(collection, updatedDoc, documentId, 'update', originalDoc);
                
                modifiedCount++;
            }
        }

        // Persist changes
        await this.persistCollection(collection);

        console.log(`📝 Updated ${modifiedCount}/${matchedDocuments.length} documents in '${collection}'`);
        this.emit('documentsUpdated', collection, modifiedCount);

        return { matchedCount: matchedDocuments.length, modifiedCount, upsertedId };
    }

    /**
     * Update single document
     */
    async updateOne(
        collection: string,
        filter: Record<string, any>,
        update: DocumentUpdate,
        options?: { upsert?: boolean }
    ): Promise<{ matchedCount: number; modifiedCount: number; upsertedId?: string }> {
        const result = await this.updateMany(collection, filter, update, options);
        return {
            matchedCount: Math.min(result.matchedCount, 1),
            modifiedCount: Math.min(result.modifiedCount, 1),
            upsertedId: result.upsertedId
        };
    }

    /**
     * Delete documents
     */
    async deleteMany(collection: string, filter: Record<string, any>): Promise<{ deletedCount: number; acknowledged: boolean }> {
        const collectionData = this.collections.get(collection);
        if (!collectionData) {
            throw new Error(`Collection '${collection}' not found`);
        }

        const documentsToDelete = await this.find({ collection, filter });
        let deletedCount = 0;

        for (const doc of documentsToDelete) {
            const documentId = doc._id;
            
            if (collectionData.delete(documentId)) {
                // Update indexes
                await this.updateIndexesForDocument(collection, doc, documentId, 'delete');
                deletedCount++;
            }
        }

        // Persist changes
        await this.persistCollection(collection);

        console.log(`🗑️ Deleted ${deletedCount} documents from '${collection}'`);
        this.emit('documentsDeleted', collection, deletedCount);

        return { deletedCount, acknowledged: true };
    }

    /**
     * Delete single document
     */
    async deleteOne(collection: string, filter: Record<string, any>): Promise<{ deletedCount: number; acknowledged: boolean }> {
        const limitedFilter = { ...filter };
        const documentsToDelete = await this.find({ collection: collection, filter: limitedFilter, limit: 1 });
        
        if (documentsToDelete.length === 0) {
            return { deletedCount: 0, acknowledged: true };
        }

        return await this.deleteMany(collection, { _id: documentsToDelete[0]._id });
    }

    /**
     * Execute aggregation pipeline
     */
    async aggregate(aggregation: AggregationPipeline): Promise<any[]> {
        console.log(`📊 Executing aggregation pipeline on '${aggregation.collection}'`);
        
        const collectionData = this.collections.get(aggregation.collection);
        if (!collectionData) {
            throw new Error(`Collection '${aggregation.collection}' not found`);
        }

        let results: any[] = Array.from(collectionData.values());

        // Process pipeline stages
        for (const stage of aggregation.pipeline) {
            results = await this.processPipelineStage(results, stage, aggregation.collection);
        }

        console.log(`📈 Aggregation completed: ${results.length} results`);
        return results;
    }

    /**
     * Create index on collection
     */
    async createIndex(collection: string, indexDef: IndexDefinition): Promise<void> {
        const collectionIndexes = this.indexes.get(collection);
        if (!collectionIndexes) {
            throw new Error(`Collection '${collection}' not found`);
        }

        // Create index structure
        const indexData = new Map<any, string[]>();
        collectionIndexes.set(indexDef.name, indexData);

        // Build index from existing documents
        const collectionData = this.collections.get(collection);
        if (collectionData) {
            for (const [docId, doc] of collectionData.entries()) {
                await this.addDocumentToIndex(collection, indexDef.name, doc, docId);
            }
        }

        console.log(`🔍 Index '${indexDef.name}' created on collection '${collection}'`);
        this.emit('indexCreated', collection, indexDef.name);
    }

    /**
     * Get collection statistics
     */
    async getCollectionStats(collection: string): Promise<CollectionStats | null> {
        return this.stats.get(collection) || null;
    }

    /**
     * List all collections
     */
    async listCollections(): Promise<string[]> {
        return Array.from(this.collections.keys());
    }

    /**
     * Drop collection
     */
    async dropCollection(collection: string): Promise<boolean> {
        const success = this.collections.delete(collection) && 
                       this.indexes.delete(collection) && 
                       this.stats.delete(collection) &&
                       this.schemas.delete(collection);

        if (success) {
            console.log(`🗑️ Collection '${collection}' dropped successfully`);
            this.emit('collectionDropped', collection);
        }

        return success;
    }

    // Private helper methods

    private async validateDocument(collection: string, document: any): Promise<void> {
        const schema = this.schemas.get(collection);
        if (!schema) return;

        // Validate required fields
        for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
            if (fieldDef.required && (document[fieldName] === undefined || document[fieldName] === null)) {
                throw new Error(`Required field '${fieldName}' is missing`);
            }

            // Validate field type and constraints
            if (document[fieldName] !== undefined) {
                this.validateField(fieldName, document[fieldName], fieldDef);
            }
        }

        // Run custom validation rules
        if (schema.validationRules) {
            for (const rule of schema.validationRules) {
                if (!this.validateRule(document, rule)) {
                    throw new Error(rule.message || `Validation failed for field '${rule.field}'`);
                }
            }
        }
    }

    private validateField(fieldName: string, value: any, fieldDef: FieldDefinition): void {
        // Type validation
        switch (fieldDef.type) {
            case 'string':
                if (typeof value !== 'string') throw new Error(`Field '${fieldName}' must be a string`);
                break;
            case 'number':
                if (typeof value !== 'number') throw new Error(`Field '${fieldName}' must be a number`);
                break;
            case 'boolean':
                if (typeof value !== 'boolean') throw new Error(`Field '${fieldName}' must be a boolean`);
                break;
            case 'date':
                if (!(value instanceof Date) && !Date.parse(value)) {
                    throw new Error(`Field '${fieldName}' must be a valid date`);
                }
                break;
            case 'array':
                if (!Array.isArray(value)) throw new Error(`Field '${fieldName}' must be an array`);
                break;
            case 'object':
                if (typeof value !== 'object' || Array.isArray(value)) {
                    throw new Error(`Field '${fieldName}' must be an object`);
                }
                break;
        }

        // Validation constraints
        if (fieldDef.validation) {
            const validation = fieldDef.validation;
            
            if (typeof value === 'number') {
                if (validation.min !== undefined && value < validation.min) {
                    throw new Error(`Field '${fieldName}' must be at least ${validation.min}`);
                }
                if (validation.max !== undefined && value > validation.max) {
                    throw new Error(`Field '${fieldName}' must be at most ${validation.max}`);
                }
            } else if (typeof value === 'string') {
                if (validation.min !== undefined && value.length < validation.min) {
                    throw new Error(`Field '${fieldName}' must be at least ${validation.min} characters`);
                }
                if (validation.max !== undefined && value.length > validation.max) {
                    throw new Error(`Field '${fieldName}' must be at most ${validation.max} characters`);
                }
            }

            if (validation.pattern && typeof value === 'string') {
                const regex = new RegExp(validation.pattern);
                if (!regex.test(value)) {
                    throw new Error(`Field '${fieldName}' does not match required pattern`);
                }
            }

            if (validation.enum && !validation.enum.includes(value)) {
                throw new Error(`Field '${fieldName}' must be one of: ${validation.enum.join(', ')}`);
            }
        }
    }

    private validateRule(document: any, rule: ValidationRule): boolean {
        switch (rule.rule) {
            case 'required':
                return document[rule.field] !== undefined && document[rule.field] !== null;
            case 'custom':
                return rule.customValidator ? rule.customValidator(document[rule.field], document) : true;
            default:
                return true;
        }
    }

    private async checkUniqueConstraints(collection: string, document: any, documentId: string): Promise<void> {
        const schema = this.schemas.get(collection);
        if (!schema) return;

        for (const index of schema.indexes) {
            if (index.unique) {
                const existingDoc = await this.findDocumentByIndex(collection, index.name, document);
                if (existingDoc && existingDoc._id !== documentId) {
                    throw new Error(`Unique constraint violation on index '${index.name}'`);
                }
            }
        }
    }

    private async findDocumentByIndex(collection: string, indexName: string, document: any): Promise<any | null> {
        const collectionIndexes = this.indexes.get(collection);
        const indexData = collectionIndexes?.get(indexName);
        
        if (!indexData) return null;

        // Simple implementation - would need to be more sophisticated for compound indexes
        const schema = this.schemas.get(collection);
        const indexDef = schema?.indexes.find(i => i.name === indexName);
        
        if (indexDef && indexDef.fields.length === 1) {
            const field = indexDef.fields[0];
            const value = document[field];
            const documentIds = indexData.get(value);
            
            if (documentIds && documentIds.length > 0) {
                const collectionData = this.collections.get(collection);
                return collectionData?.get(documentIds[0]) || null;
            }
        }

        return null;
    }

    private matchesFilter(document: any, filter: Record<string, any>): boolean {
        for (const [key, value] of Object.entries(filter)) {
            if (key.startsWith('$')) {
                // Handle operators
                if (!this.evaluateOperator(document, key, value)) {
                    return false;
                }
            } else {
                // Direct field comparison
                if (document[key] !== value) {
                    return false;
                }
            }
        }
        return true;
    }

    private evaluateOperator(document: any, operator: string, operand: any): boolean {
        switch (operator) {
            case '$and':
                return Array.isArray(operand) && operand.every(filter => this.matchesFilter(document, filter));
            case '$or':
                return Array.isArray(operand) && operand.some(filter => this.matchesFilter(document, filter));
            case '$not':
                return !this.matchesFilter(document, operand);
            default:
                return true; // Unknown operators are ignored
        }
    }

    private mergeUpdateOperations(original: any, update: DocumentUpdate): any {
        const result = { ...original };

        // $set operations
        if (update.$set) {
            Object.assign(result, update.$set);
        }

        // $unset operations
        if (update.$unset) {
            for (const field of Object.keys(update.$unset)) {
                delete result[field];
            }
        }

        // $inc operations
        if (update.$inc) {
            for (const [field, value] of Object.entries(update.$inc)) {
                result[field] = (result[field] || 0) + value;
            }
        }

        // $push operations
        if (update.$push) {
            for (const [field, value] of Object.entries(update.$push)) {
                if (!Array.isArray(result[field])) {
                    result[field] = [];
                }
                result[field].push(value);
            }
        }

        // $pull operations
        if (update.$pull) {
            for (const [field, value] of Object.entries(update.$pull)) {
                if (Array.isArray(result[field])) {
                    result[field] = result[field].filter((item: any) => item !== value);
                }
            }
        }

        // $addToSet operations
        if (update.$addToSet) {
            for (const [field, value] of Object.entries(update.$addToSet)) {
                if (!Array.isArray(result[field])) {
                    result[field] = [];
                }
                if (!result[field].includes(value)) {
                    result[field].push(value);
                }
            }
        }

        // $rename operations
        if (update.$rename) {
            for (const [oldField, newField] of Object.entries(update.$rename)) {
                if (result[oldField] !== undefined) {
                    result[newField as string] = result[oldField];
                    delete result[oldField];
                }
            }
        }

        return result;
    }

    private applyProjection(documents: any[], projection: Record<string, 1 | 0>): any[] {
        const isExclusive = Object.values(projection).some(v => v === 0);
        
        return documents.map(doc => {
            if (isExclusive) {
                // Exclusion projection
                const result = { ...doc };
                for (const [field, value] of Object.entries(projection)) {
                    if (value === 0) {
                        delete result[field];
                    }
                }
                return result;
            } else {
                // Inclusion projection
                const result: any = {};
                result._id = doc._id; // Always include _id unless explicitly excluded
                
                for (const [field, value] of Object.entries(projection)) {
                    if (value === 1) {
                        result[field] = doc[field];
                    }
                }
                return result;
            }
        });
    }

    private applySorting(documents: any[], sort: Record<string, 1 | -1>): any[] {
        return documents.sort((a, b) => {
            for (const [field, direction] of Object.entries(sort)) {
                const aVal = a[field];
                const bVal = b[field];
                
                if (aVal < bVal) return direction === 1 ? -1 : 1;
                if (aVal > bVal) return direction === 1 ? 1 : -1;
            }
            return 0;
        });
    }

    private canUseIndex(collection: string, filter: Record<string, any>): boolean {
        const schema = this.schemas.get(collection);
        if (!schema) return false;

        // Check if any indexed field is in the filter
        for (const index of schema.indexes) {
            if (index.fields.some(field => filter.hasOwnProperty(field))) {
                return true;
            }
        }

        return false;
    }

    private async findWithIndex(query: DocumentQuery): Promise<any[]> {
        // Simplified index usage - would be more sophisticated in production
        const collectionData = this.collections.get(query.collection!);
        if (!collectionData) return [];

        const documents: any[] = [];
        for (const [id, doc] of collectionData.entries()) {
            if (!query.filter || this.matchesFilter(doc, query.filter)) {
                documents.push({ ...doc });
            }
        }

        return documents;
    }

    private async processPipelineStage(documents: any[], stage: PipelineStage, collection: string): Promise<any[]> {
        if (stage.$match) {
            return documents.filter(doc => this.matchesFilter(doc, stage.$match!));
        }

        if (stage.$project) {
            return this.applyProjection(documents, stage.$project);
        }

        if (stage.$sort) {
            return this.applySorting(documents, stage.$sort);
        }

        if (stage.$limit) {
            return documents.slice(0, stage.$limit);
        }

        if (stage.$skip) {
            return documents.slice(stage.$skip);
        }

        if (stage.$group) {
            return this.processGroupStage(documents, stage.$group);
        }

        // More stages would be implemented here...
        return documents;
    }

    private processGroupStage(documents: any[], groupSpec: any): any[] {
        const groups = new Map();

        for (const doc of documents) {
            const groupKey = this.evaluateExpression(doc, groupSpec._id);
            const keyStr = JSON.stringify(groupKey);

            if (!groups.has(keyStr)) {
                groups.set(keyStr, { _id: groupKey, docs: [] });
            }
            groups.get(keyStr).docs.push(doc);
        }

        const results = [];
        for (const group of groups.values()) {
            const result: any = { _id: group._id };
            
            // Process aggregation operators
            for (const [field, expression] of Object.entries(groupSpec)) {
                if (field !== '_id') {
                    result[field] = this.evaluateAggregationExpression(group.docs, expression);
                }
            }
            
            results.push(result);
        }

        return results;
    }

    private evaluateExpression(document: any, expression: any): any {
        if (typeof expression === 'string' && expression.startsWith('$')) {
            return document[expression.substring(1)];
        }
        return expression;
    }

    private evaluateAggregationExpression(documents: any[], expression: any): any {
        if (typeof expression === 'object' && expression !== null) {
            const operator = Object.keys(expression)[0];
            const operand = expression[operator];

            switch (operator) {
                case '$sum':
                    if (operand === 1) return documents.length;
                    if (typeof operand === 'string' && operand.startsWith('$')) {
                        const field = operand.substring(1);
                        return documents.reduce((sum, doc) => sum + (doc[field] || 0), 0);
                    }
                    return operand;
                    
                case '$avg':
                    if (typeof operand === 'string' && operand.startsWith('$')) {
                        const field = operand.substring(1);
                        const values = documents.map(doc => doc[field]).filter(v => v != null);
                        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
                    }
                    return 0;
                    
                case '$count':
                    return documents.length;
                    
                default:
                    return null;
            }
        }
        return expression;
    }

    private getCacheKey(query: DocumentQuery): string {
        return JSON.stringify(query);
    }

    private cacheQuery(key: string, result: any, ttl: number): void {
        this.queryCache.set(key, { result, timestamp: Date.now(), ttl });
    }

    // Index management
    private async createIndexes(collection: string, indexDefs: IndexDefinition[]): Promise<void> {
        for (const indexDef of indexDefs) {
            await this.createIndex(collection, indexDef);
        }
    }

    private async updateIndexesForDocument(
        collection: string,
        document: any,
        documentId: string,
        operation: 'insert' | 'update' | 'delete',
        oldDocument?: any
    ): Promise<void> {
        const collectionIndexes = this.indexes.get(collection);
        if (!collectionIndexes) return;

        const schema = this.schemas.get(collection);
        if (!schema) return;

        for (const indexDef of schema.indexes) {
            if (operation === 'delete' || (operation === 'update' && oldDocument)) {
                await this.removeDocumentFromIndex(collection, indexDef.name, oldDocument || document, documentId);
            }
            
            if (operation === 'insert' || operation === 'update') {
                await this.addDocumentToIndex(collection, indexDef.name, document, documentId);
            }
        }
    }

    private async addDocumentToIndex(collection: string, indexName: string, document: any, documentId: string): Promise<void> {
        const collectionIndexes = this.indexes.get(collection);
        const indexData = collectionIndexes?.get(indexName);
        
        if (!indexData) return;

        const schema = this.schemas.get(collection);
        const indexDef = schema?.indexes.find(i => i.name === indexName);
        
        if (indexDef) {
            const indexKey = this.buildIndexKey(document, indexDef.fields);
            
            if (!indexData.has(indexKey)) {
                indexData.set(indexKey, []);
            }
            
            const docIds = indexData.get(indexKey)!;
            if (!docIds.includes(documentId)) {
                docIds.push(documentId);
            }
        }
    }

    private async removeDocumentFromIndex(collection: string, indexName: string, document: any, documentId: string): Promise<void> {
        const collectionIndexes = this.indexes.get(collection);
        const indexData = collectionIndexes?.get(indexName);
        
        if (!indexData) return;

        const schema = this.schemas.get(collection);
        const indexDef = schema?.indexes.find(i => i.name === indexName);
        
        if (indexDef) {
            const indexKey = this.buildIndexKey(document, indexDef.fields);
            const docIds = indexData.get(indexKey);
            
            if (docIds) {
                const index = docIds.indexOf(documentId);
                if (index !== -1) {
                    docIds.splice(index, 1);
                    
                    if (docIds.length === 0) {
                        indexData.delete(indexKey);
                    }
                }
            }
        }
    }

    private buildIndexKey(document: any, fields: string[]): any {
        if (fields.length === 1) {
            return document[fields[0]];
        }
        
        return fields.map(field => document[field]).join('|');
    }

    // Statistics and persistence
    private async updateCollectionStats(collection: string): Promise<void> {
        const collectionData = this.collections.get(collection);
        const stats = this.stats.get(collection);
        
        if (!collectionData || !stats) return;

        stats.documentCount = collectionData.size;
        
        let totalSize = 0;
        for (const doc of collectionData.values()) {
            totalSize += JSON.stringify(doc).length;
        }
        
        stats.totalSize = totalSize;
        stats.averageDocumentSize = stats.documentCount > 0 ? totalSize / stats.documentCount : 0;
    }

    private async updateQueryStats(collection: string, executionTime: number): Promise<void> {
        const stats = this.stats.get(collection);
        if (!stats) return;

        stats.queryStats.totalQueries++;
        const totalTime = stats.queryStats.avgExecutionTime * (stats.queryStats.totalQueries - 1) + executionTime;
        stats.queryStats.avgExecutionTime = totalTime / stats.queryStats.totalQueries;
    }

    private async loadCollections(): Promise<void> {
        console.log('📚 Loading document collections...');
        // Implementation would load collections from disk
    }

    private async loadSchemas(): Promise<void> {
        console.log('📋 Loading collection schemas...');
        // Implementation would load schemas from disk
    }

    private async rebuildIndexes(): Promise<void> {
        console.log('🔍 Rebuilding indexes...');
        // Implementation would rebuild indexes from existing data
    }

    private async persistCollection(collection: string): Promise<void> {
        const collectionFile = join(this.dataPath, `${collection}.json`);
        const collectionData = this.collections.get(collection);
        
        if (collectionData) {
            const documents = Object.fromEntries(collectionData.entries());
            await writeFile(collectionFile, JSON.stringify(documents, null, 2));
        }
    }
}