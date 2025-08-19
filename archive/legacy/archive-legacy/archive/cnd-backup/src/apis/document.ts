// Document API Implementation (MongoDB-like operations)
import { CBDAdapter } from '../cbd-adapter.js';
import { DocumentQuery, CNDError } from '../types.js';
import { v4 as uuid } from 'uuid';

export class DocumentAPI implements DocumentQuery {
  constructor(
    private collection: string,
    private adapter: CBDAdapter
  ) { }

  async find<T = any>(query?: Record<string, any>): Promise<T[]> {
    try {
      return await this.adapter.findDocuments(this.collection, query || {});
    } catch (error) {
      throw new CNDError(
        `Document find failed: ${error}`,
        'DOCUMENT_FIND_ERROR',
        { collection: this.collection, query }
      );
    }
  }

  async findOne<T = any>(query?: Record<string, any>): Promise<T | null> {
    const results = await this.find<T>(query);
    return results.length > 0 ? results[0] : null;
  }

  async findById<T = any>(id: string): Promise<T | null> {
    return this.findOne<T>({ id });
  }

  async create<T = any>(document: Partial<T>): Promise<T> {
    try {
      const docWithId = {
        ...document,
        id: (document as any).id || uuid(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.adapter.storeDocument(this.collection, docWithId);
    } catch (error) {
      throw new CNDError(
        `Document create failed: ${error}`,
        'DOCUMENT_CREATE_ERROR',
        { collection: this.collection, document }
      );
    }
  }

  async update<T = any>(id: string, updates: Partial<T>): Promise<T> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      return await this.adapter.updateDocument(this.collection, id, updateData);
    } catch (error) {
      throw new CNDError(
        `Document update failed: ${error}`,
        'DOCUMENT_UPDATE_ERROR',
        { collection: this.collection, id, updates }
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await this.adapter.deleteDocument(this.collection, id);
    } catch (error) {
      throw new CNDError(
        `Document delete failed: ${error}`,
        'DOCUMENT_DELETE_ERROR',
        { collection: this.collection, id }
      );
    }
  }

  async count(query?: Record<string, any>): Promise<number> {
    const documents = await this.find(query);
    return documents.length;
  }

  async search<T = any>(text: string, fields?: string[]): Promise<T[]> {
    try {
      // Simple text search implementation
      // In real implementation, this would use CBD Engine's search capabilities
      const allDocuments = await this.find<T>();
      const searchText = text.toLowerCase();

      return allDocuments.filter(doc => {
        const searchFields = fields || Object.keys(doc as Record<string, any>);

        return searchFields.some(field => {
          const value = (doc as any)[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchText);
          }
          return false;
        });
      });
    } catch (error) {
      throw new CNDError(
        `Document search failed: ${error}`,
        'DOCUMENT_SEARCH_ERROR',
        { collection: this.collection, text, fields }
      );
    }
  }

  // Advanced query operations
  async insertMany<T = any>(documents: Partial<T>[]): Promise<T[]> {
    const results: T[] = [];

    for (const doc of documents) {
      const result = await this.create<T>(doc);
      results.push(result);
    }

    return results;
  }

  async updateMany(query: Record<string, any>, updates: Record<string, any>): Promise<number> {
    const documents = await this.find(query);
    let updatedCount = 0;

    for (const doc of documents) {
      await this.update((doc as any).id, updates);
      updatedCount++;
    }

    return updatedCount;
  }

  async deleteMany(query: Record<string, any>): Promise<number> {
    const documents = await this.find(query);
    let deletedCount = 0;

    for (const doc of documents) {
      const deleted = await this.delete((doc as any).id);
      if (deleted) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Aggregation-like operations
  async aggregate<T = any>(pipeline: any[]): Promise<T[]> {
    // Simple aggregation implementation
    let result = await this.find();

    for (const stage of pipeline) {
      if (stage.$match) {
        result = result.filter(doc => this.matchesQuery(doc, stage.$match));
      }

      if (stage.$sort) {
        result = this.sortDocuments(result, stage.$sort);
      }

      if (stage.$limit) {
        result = result.slice(0, stage.$limit);
      }

      if (stage.$skip) {
        result = result.slice(stage.$skip);
      }
    }

    return result as T[];
  }

  // Query builder pattern
  where(conditions: Record<string, any>): DocumentQueryBuilder<any> {
    return new DocumentQueryBuilder(this, conditions);
  }

  // Helper methods
  private matchesQuery(document: any, query: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(query)) {
      if (document[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private sortDocuments(documents: any[], sortSpec: Record<string, 1 | -1>): any[] {
    return documents.sort((a, b) => {
      for (const [field, direction] of Object.entries(sortSpec)) {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal < bVal) return direction === 1 ? -1 : 1;
        if (aVal > bVal) return direction === 1 ? 1 : -1;
      }
      return 0;
    });
  }
}

// Query builder for fluent API
class DocumentQueryBuilder<T> {
  private conditions: Record<string, any> = {};
  private sortSpec: Record<string, 1 | -1> = {};
  private limitValue?: number;
  private skipValue?: number;

  constructor(
    private documentAPI: DocumentAPI,
    initialConditions: Record<string, any> = {}
  ) {
    this.conditions = { ...initialConditions };
  }

  where(conditions: Record<string, any>): this {
    this.conditions = { ...this.conditions, ...conditions };
    return this;
  }

  sort(spec: Record<string, 1 | -1>): this {
    this.sortSpec = { ...this.sortSpec, ...spec };
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  skip(count: number): this {
    this.skipValue = count;
    return this;
  }

  async execute(): Promise<T[]> {
    const pipeline: any[] = [];

    if (Object.keys(this.conditions).length > 0) {
      pipeline.push({ $match: this.conditions });
    }

    if (Object.keys(this.sortSpec).length > 0) {
      pipeline.push({ $sort: this.sortSpec });
    }

    if (this.skipValue) {
      pipeline.push({ $skip: this.skipValue });
    }

    if (this.limitValue) {
      pipeline.push({ $limit: this.limitValue });
    }

    return this.documentAPI.aggregate<T>(pipeline);
  }

  async first(): Promise<T | null> {
    const results = await this.limit(1).execute();
    return results.length > 0 ? results[0] : null;
  }

  async count(): Promise<number> {
    const results = await this.execute();
    return results.length;
  }
}
