// SQL API Implementation
import { CBDAdapter } from '../cbd-adapter.js';
import { QueryResult, CNDError } from '../types.js';

export class SQLApi {
  constructor(private adapter: CBDAdapter) { }

  async sql<T = any>(
    query: TemplateStringsArray,
    ...values: any[]
  ): Promise<T[]> {
    try {
      const sqlQuery = this.buildQuery(query, values);
      const result = await this.adapter.executeSQL(sqlQuery.text, sqlQuery.params);
      return result.data as T[];
    } catch (error) {
      throw new CNDError(
        `SQL execution failed: ${error}`,
        'SQL_EXECUTION_ERROR',
        { query: query.join(''), values }
      );
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    try {
      return await this.adapter.executeSQL(sql, params);
    } catch (error) {
      throw new CNDError(
        `SQL query failed: ${error}`,
        'SQL_QUERY_ERROR',
        { sql, params }
      );
    }
  }

  private buildQuery(query: TemplateStringsArray, values: any[]): {
    text: string;
    params: any[];
  } {
    let text = '';
    const params: any[] = [];

    for (let i = 0; i < query.length; i++) {
      text += query[i];

      if (i < values.length) {
        params.push(values[i]);
        text += `$${params.length}`;
      }
    }

    return { text, params };
  }

  // Helper methods for common SQL operations
  async select<T = any>(table: string, where?: Record<string, any>, options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
  }): Promise<T[]> {
    let sql = `SELECT * FROM ${table}`;
    const params: any[] = [];

    if (where) {
      const conditions = Object.keys(where).map((key, index) => {
        params.push(where[key]);
        return `${key} = $${params.length}`;
      });

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    if (options?.limit) {
      params.push(options.limit);
      sql += ` LIMIT $${params.length}`;
    }

    if (options?.offset) {
      params.push(options.offset);
      sql += ` OFFSET $${params.length}`;
    }

    const result = await this.adapter.executeSQL(sql, params);
    return result.data as T[];
  }

  async insert<T = any>(table: string, data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO ${table} (${keys.join(', ')}) 
      VALUES (${placeholders.join(', ')}) 
      RETURNING *
    `;

    const result = await this.adapter.executeSQL(sql, values);
    return result.data[0] as T;
  }

  async update<T = any>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`);
    values.push(id);

    const sql = `
      UPDATE ${table} 
      SET ${setClause.join(', ')} 
      WHERE id = $${values.length} 
      RETURNING *
    `;

    const result = await this.adapter.executeSQL(sql, values);
    return result.data[0] as T;
  }

  async delete(table: string, id: string | number): Promise<boolean> {
    const sql = `DELETE FROM ${table} WHERE id = $1`;
    const result = await this.adapter.executeSQL(sql, [id]);
    return result.count > 0;
  }

  async count(table: string, where?: Record<string, any>): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    const params: any[] = [];

    if (where) {
      const conditions = Object.keys(where).map((key, index) => {
        params.push(where[key]);
        return `${key} = $${params.length}`;
      });

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    const result = await this.adapter.executeSQL(sql, params);
    return parseInt(result.data[0].count);
  }
}
