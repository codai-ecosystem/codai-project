/**
 * Document Storage Engine - MongoDB-compatible document database
 * Part of CBD Universal Database Phase 2 & 3
 * Now with file-based persistence
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface DocumentQuery {
  [key: string]: any;
  $and?: DocumentQuery[];
  $or?: DocumentQuery[];
  $not?: DocumentQuery;
  $eq?: any;
  $ne?: any;
  $gt?: any;
  $gte?: any;
  $lt?: any;
  $lte?: any;
  $in?: any[];
  $nin?: any[];
  $exists?: boolean;
  $regex?: string;
  $text?: { $search: string };
}

export interface DocumentUpdate {
  $set?: any;
  $unset?: any;
  $inc?: any;
  $push?: any;
  $pull?: any;
  $addToSet?: any;
}

export interface CollectionStats {
  name: string;
  count: number;
  size: number;
  avgObjSize: number;
  storageSize: number;
  indexCount: number;
}

export class DocumentStorageEngine extends EventEmitter {
  private collections = new Map<string, Map<string, any>>();
  private indexes = new Map<string, Map<string, Set<string>>>();
  private dataDir: string;
  private autosave: boolean;

  constructor(dataDir: string = './cbd-data', autosave: boolean = true) {
    super();
    this.dataDir = dataDir;
    this.autosave = autosave;
  }

  async initialize(): Promise<void> {
    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Load existing collections from disk
    await this.loadCollectionsFromDisk();

    // Initialize the document storage engine
    this.emit('initialized');
  }

  /**
   * Insert a single document
   */
  async insertDocument(collection: string, document: any): Promise<string> {
    const coll = this.getOrCreateCollection(collection);
    const id = document._id || this.generateId();
    document._id = id;

    coll.set(id, { ...document });
    this.emit('document:inserted', { collection, document });

    // Auto-save to disk
    await this.saveCollectionsToDisk();

    return id;
  }

  /**
   * Insert a single document (MongoDB-compatible alias)
   */
  async insertOne(collection: string, document: any): Promise<string> {
    return await this.insertDocument(collection, document);
  }

  /**
   * Insert multiple documents
   */
  async insertMany(collection: string, documents: any[]): Promise<string[]> {
    const insertedIds: string[] = [];

    for (const doc of documents) {
      const id = await this.insertDocument(collection, doc);
      insertedIds.push(id);
    }

    return insertedIds;
  }

  /**
   * Find documents matching query
   */
  async findDocuments(
    collection: string,
    query: DocumentQuery = {},
    options: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
      projection?: Record<string, 0 | 1>;
    } = {}
  ): Promise<any[]> {
    const coll = this.collections.get(collection);
    if (!coll) return [];

    let results = Array.from(coll.values());

    // Apply query filter
    if (Object.keys(query).length > 0) {
      results = results.filter(doc => this.matchesQuery(doc, query));
    }

    // Apply sorting
    if (options.sort) {
      results.sort((a, b) => {
        for (const [field, direction] of Object.entries(options.sort!)) {
          const aVal = a[field];
          const bVal = b[field];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          if (comparison !== 0) {
            return comparison * direction;
          }
        }
        return 0;
      });
    }

    // Apply skip and limit
    if (options.skip) {
      results = results.slice(options.skip);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Find documents (MongoDB-compatible alias)
   */
  async find(
    collection: string,
    query: DocumentQuery = {},
    options: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
      projection?: Record<string, 0 | 1>;
    } = {}
  ): Promise<any[]> {
    return await this.findDocuments(collection, query, options);
  }

  /**
   * Find a single document
   */
  async findOne(
    collection: string,
    query: DocumentQuery = {},
    options: { projection?: Record<string, 0 | 1> } = {}
  ): Promise<any | null> {
    const results = await this.findDocuments(collection, query, { ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Update a single document
   */
  async updateDocument(
    collection: string,
    filter: DocumentQuery,
    update: DocumentUpdate
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    const docs = await this.findDocuments(collection, filter, { limit: 1 });

    if (docs.length === 0) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    const doc = docs[0];
    const updatedDoc = this.applyUpdate(doc, update);

    const coll = this.getOrCreateCollection(collection);
    coll.set(doc._id, updatedDoc);

    this.emit('document:updated', { collection, filter, update, document: updatedDoc });

    // Auto-save to disk
    await this.saveCollectionsToDisk();

    return { matchedCount: 1, modifiedCount: 1 };
  }

  /**
   * Update a single document (MongoDB-compatible alias)
   */
  async updateOne(
    collection: string,
    filter: DocumentQuery,
    update: DocumentUpdate
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    return await this.updateDocument(collection, filter, update);
  }

  /**
   * Delete documents matching filter
   */
  async deleteDocuments(collection: string, filter: DocumentQuery): Promise<number> {
    const docsToDelete = await this.findDocuments(collection, filter);
    const coll = this.collections.get(collection);

    if (!coll || docsToDelete.length === 0) {
      return 0;
    }

    for (const doc of docsToDelete) {
      coll.delete(doc._id);
    }

    this.emit('document:deleted', { collection, filter, count: docsToDelete.length });

    // Auto-save to disk
    await this.saveCollectionsToDisk();

    return docsToDelete.length;
  }

  /**
   * Delete a single document
   */
  async deleteOne(collection: string, filter: DocumentQuery): Promise<number> {
    const docs = await this.findDocuments(collection, filter, { limit: 1 });

    if (docs.length === 0) {
      return 0;
    }

    const coll = this.collections.get(collection);
    if (coll) {
      coll.delete(docs[0]._id);
      this.emit('document:deleted', { collection, filter, count: 1 });
      return 1;
    }

    return 0;
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collection?: string): Promise<CollectionStats | null | Record<string, CollectionStats>> {
    if (collection) {
      const coll = this.collections.get(collection);
      if (!coll) return null;

      const docs = Array.from(coll.values());
      const totalSize = docs.reduce((size, doc) => size + JSON.stringify(doc).length, 0);

      return {
        name: collection,
        count: docs.length,
        size: totalSize,
        avgObjSize: docs.length > 0 ? totalSize / docs.length : 0,
        storageSize: totalSize * 1.2, // Estimated with overhead
        indexCount: this.indexes.get(collection)?.size || 0
      };
    }

    // Return stats for all collections when no collection specified
    const allStats: Record<string, CollectionStats> = {};
    for (const [collName, coll] of this.collections) {
      const docs = Array.from(coll.values());
      const totalSize = docs.reduce((size, doc) => size + JSON.stringify(doc).length, 0);

      allStats[collName] = {
        name: collName,
        count: docs.length,
        size: totalSize,
        avgObjSize: docs.length > 0 ? totalSize / docs.length : 0,
        storageSize: totalSize * 1.2,
        indexCount: this.indexes.get(collName)?.size || 0
      };
    }
    return allStats;
  }

  private getOrCreateCollection(collection: string): Map<string, any> {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Map());
    }
    return this.collections.get(collection)!;
  }

  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private matchesQuery(document: any, query: DocumentQuery): boolean {
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('$')) {
        // Handle logical operators
        if (key === '$and' && Array.isArray(value)) {
          return value.every(subQuery => this.matchesQuery(document, subQuery));
        }
        if (key === '$or' && Array.isArray(value)) {
          return value.some(subQuery => this.matchesQuery(document, subQuery));
        }
        if (key === '$not') {
          return !this.matchesQuery(document, value);
        }
      } else {
        // Handle field queries
        if (!this.matchesFieldQuery(document[key], value)) {
          return false;
        }
      }
    }
    return true;
  }

  private matchesFieldQuery(fieldValue: any, queryValue: any): boolean {
    if (typeof queryValue === 'object' && queryValue !== null && !Array.isArray(queryValue)) {
      for (const [operator, operatorValue] of Object.entries(queryValue)) {
        switch (operator) {
          case '$eq':
            return fieldValue === operatorValue;
          case '$ne':
            return fieldValue !== operatorValue;
          case '$gt':
            return typeof fieldValue === 'number' && typeof operatorValue === 'number'
              ? fieldValue > operatorValue : false;
          case '$gte':
            return typeof fieldValue === 'number' && typeof operatorValue === 'number'
              ? fieldValue >= operatorValue : false;
          case '$lt':
            return typeof fieldValue === 'number' && typeof operatorValue === 'number'
              ? fieldValue < operatorValue : false;
          case '$lte':
            return typeof fieldValue === 'number' && typeof operatorValue === 'number'
              ? fieldValue <= operatorValue : false;
          case '$in':
            return Array.isArray(operatorValue) && operatorValue.includes(fieldValue);
          case '$nin':
            return Array.isArray(operatorValue) && !operatorValue.includes(fieldValue);
          case '$exists':
            return operatorValue ? fieldValue !== undefined : fieldValue === undefined;
          case '$regex':
            return typeof fieldValue === 'string' && typeof operatorValue === 'string'
              ? new RegExp(operatorValue).test(fieldValue) : false;
          default:
            return false;
        }
      }
      return true;
    } else {
      return fieldValue === queryValue;
    }
  }

  private applyUpdate(document: any, update: DocumentUpdate): any {
    const updatedDoc = { ...document };

    if (update.$set) {
      Object.assign(updatedDoc, update.$set);
    }

    if (update.$unset) {
      for (const field of Object.keys(update.$unset)) {
        delete updatedDoc[field];
      }
    }

    if (update.$inc) {
      for (const [field, increment] of Object.entries(update.$inc)) {
        updatedDoc[field] = (updatedDoc[field] || 0) + Number(increment);
      }
    }

    return updatedDoc;
  }

  /**
   * Alias for insertDocument - Cloud service compatibility
   */
  async insert(collection: string, document: any): Promise<string> {
    return this.insertDocument(collection, document);
  }

  /**
   * Find document by ID - Cloud service compatibility
   */
  async findById(collection: string, id: string): Promise<any | null> {
    const coll = this.collections.get(collection);
    if (!coll) return null;

    return coll.get(id) || null;
  }

  /**
   * Load collections from disk storage
   */
  private async loadCollectionsFromDisk(): Promise<void> {
    try {
      const collectionsPath = path.join(this.dataDir, 'collections.json');
      const collectionsData = await fs.readFile(collectionsPath, 'utf-8');
      const collectionsObj = JSON.parse(collectionsData);

      // Restore collections
      for (const [collectionName, documents] of Object.entries(collectionsObj)) {
        const docMap = new Map<string, any>();
        for (const [docId, docData] of Object.entries(documents as any)) {
          docMap.set(docId, docData);
        }
        this.collections.set(collectionName, docMap);
      }

      console.log(`✅ Loaded ${this.collections.size} collections from disk`);
    } catch (error) {
      // No existing data file or error reading, start fresh
      console.log('📝 Starting with fresh document storage (no existing data)');
    }
  }

  /**
   * Save collections to disk storage
   */
  private async saveCollectionsToDisk(): Promise<void> {
    if (!this.autosave) return;

    try {
      const collectionsObj: Record<string, Record<string, any>> = {};

      // Convert Maps to plain objects for JSON serialization
      for (const [collectionName, docMap] of this.collections.entries()) {
        collectionsObj[collectionName] = {};
        for (const [docId, docData] of docMap.entries()) {
          collectionsObj[collectionName][docId] = docData;
        }
      }

      const collectionsPath = path.join(this.dataDir, 'collections.json');
      await fs.writeFile(collectionsPath, JSON.stringify(collectionsObj, null, 2), 'utf-8');

      console.log(`💾 Saved ${this.collections.size} collections to disk`);
    } catch (error) {
      console.error('❌ Failed to save collections to disk:', error);
    }
  }
}
