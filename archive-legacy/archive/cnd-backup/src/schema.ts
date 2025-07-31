// Schema Management System
import { CBDAdapter } from './cbd-adapter.js';
import {
  SchemaDefinition,
  TableSchema,
  FieldDefinition,
  RelationDefinition,
  CNDError,
  CNDValidationError
} from './types.js';

export class SchemaManager {
  private currentSchema: SchemaDefinition = {};
  private relationships: Map<string, RelationDefinition[]> = new Map();

  constructor(private adapter: CBDAdapter) { }

  define(schema: SchemaDefinition): void {
    try {
      this.validateSchema(schema);
      this.currentSchema = { ...schema };
      this.extractRelationships(schema);
      this.generateTypes(schema);
      console.log('Schema Manager: Schema defined successfully');
    } catch (error) {
      throw new CNDError(
        `Schema definition failed: ${error}`,
        'SCHEMA_DEFINITION_ERROR',
        { schema }
      );
    }
  }

  getSchema(): SchemaDefinition {
    return { ...this.currentSchema };
  }

  getTable(tableName: string): TableSchema | null {
    return this.currentSchema[tableName] || null;
  }

  getRelationships(tableName: string): RelationDefinition[] {
    return this.relationships.get(tableName) || [];
  }

  validateData(tableName: string, data: Record<string, any>): void {
    const tableSchema = this.getTable(tableName);
    if (!tableSchema) {
      throw new CNDValidationError(
        `Table '${tableName}' not found in schema`,
        'table',
        tableName
      );
    }

    for (const [fieldName, fieldSchema] of Object.entries(tableSchema)) {
      if (this.isRelation(fieldSchema)) continue;

      const fieldDef = fieldSchema as FieldDefinition;
      const value = data[fieldName];

      // Check required fields
      if (fieldDef.required && (value === undefined || value === null)) {
        throw new CNDValidationError(
          `Field '${fieldName}' is required`,
          fieldName,
          value
        );
      }

      // Skip validation for optional undefined values
      if (value === undefined && !fieldDef.required) continue;

      // Type validation
      this.validateFieldType(fieldName, value, fieldDef);

      // Unique validation (would need database lookup in real implementation)
      if (fieldDef.unique && value !== undefined) {
        console.log(`Schema Manager: Unique constraint check for ${fieldName}`);
      }

      // Reference validation
      if (fieldDef.references && value !== undefined) {
        this.validateReference(fieldName, value, fieldDef.references);
      }
    }
  }

  async createTables(): Promise<void> {
    try {
      for (const [tableName, tableSchema] of Object.entries(this.currentSchema)) {
        await this.createTable(tableName, tableSchema);
      }

      // Create relationships after all tables are created
      await this.createRelationships();
    } catch (error) {
      throw new CNDError(
        `Table creation failed: ${error}`,
        'SCHEMA_TABLE_CREATION_ERROR'
      );
    }
  }

  async alterTable(tableName: string, changes: {
    addFields?: Record<string, FieldDefinition>;
    removeFields?: string[];
    modifyFields?: Record<string, FieldDefinition>;
  }): Promise<void> {
    try {
      console.log(`Schema Manager: Altering table ${tableName}`, changes);

      // Update schema
      const tableSchema = this.currentSchema[tableName];
      if (!tableSchema) {
        throw new CNDError(
          `Table '${tableName}' not found`,
          'SCHEMA_TABLE_NOT_FOUND',
          { tableName }
        );
      }

      // Add fields
      if (changes.addFields) {
        Object.assign(tableSchema, changes.addFields);
      }

      // Remove fields
      if (changes.removeFields) {
        for (const fieldName of changes.removeFields) {
          delete tableSchema[fieldName];
        }
      }

      // Modify fields
      if (changes.modifyFields) {
        Object.assign(tableSchema, changes.modifyFields);
      }

      // In real implementation, this would alter the table in CBD Engine
    } catch (error) {
      throw new CNDError(
        `Table alteration failed: ${error}`,
        'SCHEMA_TABLE_ALTER_ERROR',
        { tableName, changes }
      );
    }
  }

  async dropTable(tableName: string): Promise<void> {
    try {
      console.log(`Schema Manager: Dropping table ${tableName}`);

      // Remove from schema
      delete this.currentSchema[tableName];
      this.relationships.delete(tableName);

      // In real implementation, this would drop the table in CBD Engine
    } catch (error) {
      throw new CNDError(
        `Table drop failed: ${error}`,
        'SCHEMA_TABLE_DROP_ERROR',
        { tableName }
      );
    }
  }

  // Schema introspection
  getTables(): string[] {
    return Object.keys(this.currentSchema);
  }

  getFields(tableName: string): string[] {
    const tableSchema = this.getTable(tableName);
    return tableSchema ? Object.keys(tableSchema) : [];
  }

  getFieldDefinition(tableName: string, fieldName: string): FieldDefinition | null {
    const tableSchema = this.getTable(tableName);
    if (!tableSchema) return null;

    const field = tableSchema[fieldName];
    return this.isRelation(field) ? null : field as FieldDefinition;
  }

  getPrimaryKey(tableName: string): string | null {
    const tableSchema = this.getTable(tableName);
    if (!tableSchema) return null;

    for (const [fieldName, fieldDef] of Object.entries(tableSchema)) {
      if (!this.isRelation(fieldDef) && (fieldDef as FieldDefinition).primary) {
        return fieldName;
      }
    }

    // Default to 'id' if no explicit primary key
    return 'id';
  }

  // Private methods
  private validateSchema(schema: SchemaDefinition): void {
    for (const [tableName, tableSchema] of Object.entries(schema)) {
      if (!tableName || typeof tableName !== 'string') {
        throw new CNDValidationError('Invalid table name', 'tableName', tableName);
      }

      this.validateTableSchema(tableName, tableSchema);
    }
  }

  private validateTableSchema(tableName: string, tableSchema: TableSchema): void {
    let hasPrimaryKey = false;

    for (const [fieldName, fieldDef] of Object.entries(tableSchema)) {
      if (this.isRelation(fieldDef)) {
        this.validateRelation(tableName, fieldName, fieldDef as RelationDefinition);
      } else {
        this.validateField(tableName, fieldName, fieldDef as FieldDefinition);
        if ((fieldDef as FieldDefinition).primary) {
          if (hasPrimaryKey) {
            throw new CNDValidationError(
              `Multiple primary keys in table '${tableName}'`,
              'primaryKey',
              fieldName
            );
          }
          hasPrimaryKey = true;
        }
      }
    }
  }

  private validateField(tableName: string, fieldName: string, fieldDef: FieldDefinition): void {
    if (!fieldDef.type) {
      throw new CNDValidationError(
        `Field '${fieldName}' in table '${tableName}' must have a type`,
        fieldName,
        fieldDef
      );
    }

    const validTypes = ['string', 'number', 'boolean', 'date', 'json', 'text', 'uuid'];
    if (!validTypes.includes(fieldDef.type)) {
      throw new CNDValidationError(
        `Invalid field type '${fieldDef.type}' for field '${fieldName}'`,
        fieldName,
        fieldDef.type
      );
    }

    if (fieldDef.references) {
      const [table, field] = fieldDef.references.split('.');
      if (!table || !field) {
        throw new CNDValidationError(
          `Invalid reference format '${fieldDef.references}'. Use 'table.field'`,
          fieldName,
          fieldDef.references
        );
      }
    }
  }

  private validateRelation(tableName: string, fieldName: string, relationDef: RelationDefinition): void {
    const validTypes = ['hasOne', 'hasMany', 'belongsTo', 'manyToMany'];
    if (!validTypes.includes(relationDef.type)) {
      throw new CNDValidationError(
        `Invalid relation type '${relationDef.type}' for field '${fieldName}'`,
        fieldName,
        relationDef.type
      );
    }

    if (!relationDef.table) {
      throw new CNDValidationError(
        `Relation '${fieldName}' must specify a table`,
        fieldName,
        relationDef
      );
    }
  }

  private validateFieldType(fieldName: string, value: any, fieldDef: FieldDefinition): void {
    if (value === null || value === undefined) return;

    switch (fieldDef.type) {
      case 'string':
      case 'uuid':
      case 'text':
        if (typeof value !== 'string') {
          throw new CNDValidationError(
            `Field '${fieldName}' must be a string`,
            fieldName,
            value
          );
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          throw new CNDValidationError(
            `Field '${fieldName}' must be a number`,
            fieldName,
            value
          );
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new CNDValidationError(
            `Field '${fieldName}' must be a boolean`,
            fieldName,
            value
          );
        }
        break;
      case 'date':
        if (!(value instanceof Date)) {
          throw new CNDValidationError(
            `Field '${fieldName}' must be a Date`,
            fieldName,
            value
          );
        }
        break;
      case 'json':
        // JSON can be any type, but should be serializable
        try {
          JSON.stringify(value);
        } catch {
          throw new CNDValidationError(
            `Field '${fieldName}' must be JSON serializable`,
            fieldName,
            value
          );
        }
        break;
    }
  }

  private validateReference(fieldName: string, value: any, reference: string): void {
    // In real implementation, this would validate the reference exists in the database
    console.log(`Schema Manager: Validating reference ${fieldName} -> ${reference}:`, value);
  }

  private extractRelationships(schema: SchemaDefinition): void {
    this.relationships.clear();

    for (const [tableName, tableSchema] of Object.entries(schema)) {
      const relations: RelationDefinition[] = [];

      for (const [fieldName, fieldDef] of Object.entries(tableSchema)) {
        if (this.isRelation(fieldDef)) {
          relations.push({
            ...(fieldDef as RelationDefinition),
            fieldName
          });
        }
      }

      if (relations.length > 0) {
        this.relationships.set(tableName, relations);
      }
    }
  }

  private generateTypes(schema: SchemaDefinition): void {
    // In real implementation, this would generate TypeScript type definitions
    console.log('Schema Manager: Generating TypeScript types for schema');

    for (const tableName of Object.keys(schema)) {
      console.log(`  - Generated type for ${tableName}`);
    }
  }

  private async createTable(tableName: string, tableSchema: TableSchema): Promise<void> {
    console.log(`Schema Manager: Creating table ${tableName}`);

    // In real implementation, this would create the table in CBD Engine
    const fields = Object.entries(tableSchema)
      .filter(([, fieldDef]) => !this.isRelation(fieldDef))
      .map(([fieldName, fieldDef]) => ({
        name: fieldName,
        definition: fieldDef as FieldDefinition
      }));

    console.log(`  - Fields: ${fields.map(f => f.name).join(', ')}`);
  }

  private async createRelationships(): Promise<void> {
    console.log('Schema Manager: Creating relationships');

    for (const [tableName, relations] of this.relationships.entries()) {
      for (const relation of relations) {
        console.log(`  - ${tableName}.${relation.name} -> ${relation.table} (${relation.type})`);
      }
    }
  }

  private isRelation(field: FieldDefinition | RelationDefinition): field is RelationDefinition {
    return 'type' in field && ['hasOne', 'hasMany', 'belongsTo', 'manyToMany'].includes((field as any).type);
  }
}
