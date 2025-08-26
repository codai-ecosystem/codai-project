/**
 * Cypher-like Query Language for CBD Graph Database Engine
 * 
 * Provides a simplified Cypher-like query language implementation for the CBD Graph Database Engine.
 * Supports basic graph pattern matching, filtering, and result projection.
 * 
 * Inspired by Neo4j Cypher query language syntax and semantics.
 */

import { CBDGraphDatabaseEngine, GraphVertex, GraphEdge, GraphPath, GraphQueryResult } from './GraphDatabaseEngine';
import { performance } from 'perf_hooks';

export interface CypherASTNode {
  type: string;
  [key: string]: any;
}

export interface CypherMatchClause extends CypherASTNode {
  type: 'match';
  patterns: CypherPattern[];
}

export interface CypherPattern extends CypherASTNode {
  type: 'pattern';
  vertices: CypherVertex[];
  edges: CypherEdge[];
}

export interface CypherVertex extends CypherASTNode {
  type: 'vertex';
  variable?: string;
  label?: string;
  properties?: Record<string, any>;
}

export interface CypherEdge extends CypherASTNode {
  type: 'edge';
  variable?: string;
  label?: string;
  direction?: 'out' | 'in' | 'both';
  properties?: Record<string, any>;
}

export interface CypherWhereClause extends CypherASTNode {
  type: 'where';
  condition: CypherCondition;
}

export interface CypherCondition extends CypherASTNode {
  type: 'condition';
  operator: 'and' | 'or' | 'not' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  left?: CypherCondition | string | number | boolean;
  right?: CypherCondition | string | number | boolean;
  operand?: CypherCondition;
}

export interface CypherReturnClause extends CypherASTNode {
  type: 'return';
  items: CypherReturnItem[];
  limit?: number;
  orderBy?: CypherOrderBy[];
}

export interface CypherReturnItem extends CypherASTNode {
  type: 'return_item';
  expression: string;
  alias?: string;
}

export interface CypherOrderBy extends CypherASTNode {
  type: 'order_by';
  expression: string;
  direction: 'asc' | 'desc';
}

export interface CypherQuery extends CypherASTNode {
  type: 'query';
  match?: CypherMatchClause;
  where?: CypherWhereClause;
  return?: CypherReturnClause;
  create?: CypherCreateClause;
  delete?: CypherDeleteClause;
}

export interface CypherCreateClause extends CypherASTNode {
  type: 'create';
  patterns: CypherPattern[];
}

export interface CypherDeleteClause extends CypherASTNode {
  type: 'delete';
  items: string[];
  detach?: boolean;
}

/**
 * Cypher Query Engine
 */
export class CBDCypherEngine {
  constructor(private graphEngine: CBDGraphDatabaseEngine) {}

  /**
   * Execute Cypher query
   */
  async execute(query: string, parameters: Record<string, any> = {}): Promise<GraphQueryResult> {
    const startTime = performance.now();
    
    try {
      // Parse query
      const ast = this.parseQuery(query);
      
      // Execute query
      const result = await this.executeAST(ast, parameters);
      
      const executionTime = performance.now() - startTime;
      return {
        ...result,
        executionTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Cypher query execution failed: ${errorMessage}`);
    }
  }

  /**
   * Parse Cypher query into AST
   */
  private parseQuery(query: string): CypherQuery {
    // Simplified parser for basic Cypher queries
    const normalizedQuery = query.trim().toLowerCase();
    const tokens = this.tokenize(query);
    
    const ast: CypherQuery = {
      type: 'query'
    };

    let currentIndex = 0;

    // Parse MATCH clause
    if (tokens[currentIndex]?.toLowerCase() === 'match') {
      currentIndex++;
      const matchResult = this.parseMatch(tokens, currentIndex);
      ast.match = matchResult.match;
      currentIndex = matchResult.nextIndex;
    }

    // Parse WHERE clause
    if (tokens[currentIndex]?.toLowerCase() === 'where') {
      currentIndex++;
      const whereResult = this.parseWhere(tokens, currentIndex);
      ast.where = whereResult.where;
      currentIndex = whereResult.nextIndex;
    }

    // Parse RETURN clause
    if (tokens[currentIndex]?.toLowerCase() === 'return') {
      currentIndex++;
      const returnResult = this.parseReturn(tokens, currentIndex);
      ast.return = returnResult.return;
      currentIndex = returnResult.nextIndex;
    }

    // Parse CREATE clause
    if (tokens[0]?.toLowerCase() === 'create') {
      currentIndex = 1;
      const createResult = this.parseCreate(tokens, currentIndex);
      ast.create = createResult.create;
      currentIndex = createResult.nextIndex;
    }

    return ast;
  }

  /**
   * Tokenize query string
   */
  private tokenize(query: string): string[] {
    // Enhanced tokenization to handle colons properly
    return query
      .replace(/[()[\]{},]/g, ' $& ')
      .replace(/:/g, ' : ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  /**
   * Parse MATCH clause
   */
  private parseMatch(tokens: string[], startIndex: number): { match: CypherMatchClause; nextIndex: number } {
    const patterns: CypherPattern[] = [];
    let currentIndex = startIndex;

    // Parse pattern: (n:Person)-[:KNOWS]->(m:Person)
    while (currentIndex < tokens.length && 
           !['where', 'return', 'order', 'limit'].includes(tokens[currentIndex]?.toLowerCase())) {
      
      if (tokens[currentIndex] === '(') {
        const patternResult = this.parsePattern(tokens, currentIndex);
        patterns.push(patternResult.pattern);
        currentIndex = patternResult.nextIndex;
      } else {
        currentIndex++;
      }
    }

    return {
      match: {
        type: 'match',
        patterns
      },
      nextIndex: currentIndex
    };
  }

  /**
   * Parse graph pattern
   */
  private parsePattern(tokens: string[], startIndex: number): { pattern: CypherPattern; nextIndex: number } {
    const vertices: CypherVertex[] = [];
    const edges: CypherEdge[] = [];
    let currentIndex = startIndex;

    while (currentIndex < tokens.length) {
      if (tokens[currentIndex] === '(') {
        currentIndex++; // Skip opening parenthesis
        
        // Parse vertex
        const vertex: CypherVertex = { type: 'vertex' };
        
        // Variable name (optional)
        if (tokens[currentIndex] && 
            tokens[currentIndex] !== ':' && 
            !tokens[currentIndex].startsWith('{') &&
            tokens[currentIndex] !== ')') {
          vertex.variable = tokens[currentIndex];
          currentIndex++;
        }
        
        // Label (starts with :)
        if (tokens[currentIndex] === ':') {
          currentIndex++; // Skip the colon
          if (tokens[currentIndex]) {
            vertex.label = tokens[currentIndex];
            currentIndex++;
          }
        }
        
        // Properties (between { })
        if (tokens[currentIndex] === '{') {
          currentIndex++; // Skip opening brace
          vertex.properties = {};
          
            while (tokens[currentIndex] !== '}' && currentIndex < tokens.length) {
              // Handle property: key: "value" or key: value
              const key = tokens[currentIndex];
              if (tokens[currentIndex + 1] === ':' && currentIndex + 2 < tokens.length) {
                let rawValue = tokens[currentIndex + 2];
                let parsedValue: any;
                
                // Clean up quoted values
                if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
                  parsedValue = rawValue.slice(1, -1);
                } else if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
                  parsedValue = rawValue.slice(1, -1);
                } else if (!isNaN(Number(rawValue))) {
                  parsedValue = Number(rawValue);
                } else {
                  parsedValue = rawValue;
                }
                
                vertex.properties![key] = parsedValue;
                currentIndex += 3;              // Skip comma if present
              if (tokens[currentIndex] === ',') {
                currentIndex++;
              }
            } else {
              currentIndex++;
            }
          }
          
          if (tokens[currentIndex] === '}') {
            currentIndex++; // Skip closing brace
          }
        }
        
        vertices.push(vertex);
        
        // Skip closing parenthesis
        if (tokens[currentIndex] === ')') {
          currentIndex++;
        }
      } else if (tokens[currentIndex] === '-') {
        currentIndex++; // Skip dash
        
        // Parse edge
        const edge: CypherEdge = { type: 'edge', direction: 'out' };
        
        if (tokens[currentIndex] === '[') {
          currentIndex++; // Skip opening bracket
          
          // Variable (optional)
          if (tokens[currentIndex] && 
              tokens[currentIndex] !== ':' && 
              !tokens[currentIndex].startsWith('{') &&
              tokens[currentIndex] !== ']') {
            edge.variable = tokens[currentIndex];
            currentIndex++;
          }
          
          // Label (starts with :)
          if (tokens[currentIndex] === ':') {
            currentIndex++; // Skip the colon
            if (tokens[currentIndex]) {
              edge.label = tokens[currentIndex];
              currentIndex++;
            }
          }
          
          // Properties (between { })
          if (tokens[currentIndex] === '{') {
            currentIndex++; // Skip opening brace
            edge.properties = {};
            
            while (tokens[currentIndex] !== '}' && currentIndex < tokens.length) {
              const key = tokens[currentIndex];
              if (tokens[currentIndex + 1] === ':' && currentIndex + 2 < tokens.length) {
                let rawValue = tokens[currentIndex + 2];
                let parsedValue: any;
                
                // Clean up quoted values
                if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
                  parsedValue = rawValue.slice(1, -1);
                } else if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
                  parsedValue = rawValue.slice(1, -1);
                } else if (!isNaN(Number(rawValue))) {
                  parsedValue = Number(rawValue);
                } else {
                  parsedValue = rawValue;
                }
                
                edge.properties![key] = parsedValue;
                currentIndex += 3;
                
                // Skip comma if present
                if (tokens[currentIndex] === ',') {
                  currentIndex++;
                }
              } else {
                currentIndex++;
              }
            }
            
            if (tokens[currentIndex] === '}') {
              currentIndex++; // Skip closing brace
            }
          }
          
          // Skip closing bracket
          if (tokens[currentIndex] === ']') {
            currentIndex++;
          }
        }
        
        // Direction
        if (tokens[currentIndex] === '>') {
          edge.direction = 'out';
          currentIndex++;
        } else if (tokens[currentIndex] === '<') {
          edge.direction = 'in';
          currentIndex++;
        } else {
          edge.direction = 'both';
        }
        
        edges.push(edge);
      } else if (['where', 'return', 'order', 'limit'].includes(tokens[currentIndex]?.toLowerCase())) {
        break;
      } else {
        currentIndex++;
      }
    }

    return {
      pattern: {
        type: 'pattern',
        vertices,
        edges
      },
      nextIndex: currentIndex
    };
  }

  /**
   * Parse WHERE clause
   */
  private parseWhere(tokens: string[], startIndex: number): { where: CypherWhereClause; nextIndex: number } {
    // Simplified WHERE parsing
    let currentIndex = startIndex;
    const conditionTokens: string[] = [];

    while (currentIndex < tokens.length && 
           !['return', 'order', 'limit'].includes(tokens[currentIndex]?.toLowerCase())) {
      conditionTokens.push(tokens[currentIndex]);
      currentIndex++;
    }

    return {
      where: {
        type: 'where',
        condition: this.parseCondition(conditionTokens.join(' '))
      },
      nextIndex: currentIndex
    };
  }

  /**
   * Parse RETURN clause
   */
  private parseReturn(tokens: string[], startIndex: number): { return: CypherReturnClause; nextIndex: number } {
    const items: CypherReturnItem[] = [];
    let currentIndex = startIndex;
    let limit: number | undefined;

    while (currentIndex < tokens.length) {
      const token = tokens[currentIndex].toLowerCase();
      
      if (token === 'limit') {
        currentIndex++;
        limit = parseInt(tokens[currentIndex]);
        currentIndex++;
        break;
      } else if (token === 'order') {
        // Skip ORDER BY for now
        break;
      } else {
        // Parse return item
        const expression = tokens[currentIndex];
        let alias: string | undefined;
        
        currentIndex++;
        
        if (tokens[currentIndex]?.toLowerCase() === 'as') {
          currentIndex++;
          alias = tokens[currentIndex];
          currentIndex++;
        }
        
        items.push({
          type: 'return_item',
          expression,
          alias
        });
        
        // Skip comma
        if (tokens[currentIndex] === ',') {
          currentIndex++;
        }
      }
    }

    return {
      return: {
        type: 'return',
        items,
        limit
      },
      nextIndex: currentIndex
    };
  }

  /**
   * Parse CREATE clause
   */
  private parseCreate(tokens: string[], startIndex: number): { create: CypherCreateClause; nextIndex: number } {
    const patterns: CypherPattern[] = [];
    let currentIndex = startIndex;

    while (currentIndex < tokens.length) {
      if (tokens[currentIndex] === '(') {
        const patternResult = this.parsePattern(tokens, currentIndex);
        patterns.push(patternResult.pattern);
        currentIndex = patternResult.nextIndex;
      } else {
        currentIndex++;
      }
    }

    return {
      create: {
        type: 'create',
        patterns
      },
      nextIndex: currentIndex
    };
  }

  /**
   * Parse condition expression
   */
  private parseCondition(conditionStr: string): CypherCondition {
    // Simplified condition parsing
    const trimmed = conditionStr.trim();
    
    if (trimmed.includes('=')) {
      const parts = trimmed.split('=');
      return {
        type: 'condition',
        operator: 'eq',
        left: parts[0].trim(),
        right: this.parseValue(parts[1].trim())
      };
    }
    
    return {
      type: 'condition',
      operator: 'eq',
      left: trimmed,
      right: true
    };
  }

  /**
   * Parse value from token
   */
  private parseValue(token: string): any {
    if (token.startsWith('"') && token.endsWith('"')) {
      return token.slice(1, -1);
    }
    if (token.startsWith("'") && token.endsWith("'")) {
      return token.slice(1, -1);
    }
    if (!isNaN(Number(token))) {
      return Number(token);
    }
    if (token === 'true') return true;
    if (token === 'false') return false;
    if (token === 'null') return null;
    
    return token;
  }

  /**
   * Execute parsed AST
   */
  private async executeAST(ast: CypherQuery, parameters: Record<string, any>): Promise<Omit<GraphQueryResult, 'executionTime'>> {
    if (ast.create) {
      return await this.executeCreate(ast.create, parameters);
    }
    
    if (ast.match) {
      return await this.executeMatch(ast, parameters);
    }
    
    throw new Error('Unsupported query type');
  }

  /**
   * Execute CREATE clause
   */
  private async executeCreate(create: CypherCreateClause, parameters: Record<string, any>): Promise<Omit<GraphQueryResult, 'executionTime'>> {
    const createdVertices: GraphVertex[] = [];
    const createdEdges: GraphEdge[] = [];

    for (const pattern of create.patterns) {
      for (const vertexDef of pattern.vertices) {
        const id = this.generateId('vertex');
        const label = vertexDef.label || 'Unknown';
        const properties = vertexDef.properties || {};
        
        const vertex = await this.graphEngine.addVertex(id, label, properties);
        createdVertices.push(vertex);
      }
      
      // Create edges if pattern has them
      if (pattern.edges.length > 0 && pattern.vertices.length >= 2) {
        for (let i = 0; i < pattern.edges.length; i++) {
          const edgeDef = pattern.edges[i];
          const fromVertex = createdVertices[i];
          const toVertex = createdVertices[i + 1];
          
          if (fromVertex && toVertex) {
            const edgeId = this.generateId('edge');
            const label = edgeDef.label || 'RELATED';
            const properties = edgeDef.properties || {};
            
            const edge = await this.graphEngine.addEdge(
              edgeId,
              label,
              fromVertex.id,
              toVertex.id,
              properties
            );
            createdEdges.push(edge);
          }
        }
      }
    }

    return {
      vertices: createdVertices,
      edges: createdEdges
    };
  }

  /**
   * Execute MATCH clause
   */
  private async executeMatch(ast: CypherQuery, parameters: Record<string, any>): Promise<Omit<GraphQueryResult, 'executionTime'>> {
    if (!ast.match) {
      throw new Error('No MATCH clause found');
    }

    let vertices: GraphVertex[] = [];
    let edges: GraphEdge[] = [];

    // Simple pattern matching
    for (const pattern of ast.match.patterns) {
      if (pattern.vertices.length > 0) {
        const vertexDef = pattern.vertices[0];
        
        // Find vertices matching the pattern
        const matchedVertices = await this.graphEngine.findVertices(
          vertexDef.label,
          vertexDef.properties,
          ast.return?.limit || 1000
        );
        
        vertices.push(...matchedVertices);
      }
    }

    // Apply WHERE conditions
    if (ast.where) {
      vertices = vertices.filter(vertex => this.evaluateCondition(ast.where!.condition, vertex, parameters));
    }

    return {
      vertices,
      edges
    };
  }

  /**
   * Evaluate WHERE condition
   */
  private evaluateCondition(condition: CypherCondition, vertex: GraphVertex, parameters: Record<string, any>): boolean {
    switch (condition.operator) {
      case 'eq':
        if (typeof condition.left === 'string' && condition.left.includes('.')) {
          const [varName, propName] = condition.left.split('.');
          return vertex.properties[propName] === condition.right;
        }
        return condition.left === condition.right;
      
      case 'ne':
        if (typeof condition.left === 'string' && condition.left.includes('.')) {
          const [varName, propName] = condition.left.split('.');
          return vertex.properties[propName] !== condition.right;
        }
        return condition.left !== condition.right;
      
      default:
        return true;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(type: 'vertex' | 'edge'): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default CBDCypherEngine;