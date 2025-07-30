/**
 * SQL Injection Protection Service
 * Addresses CRITICAL security vulnerability: SQL injection vulnerabilities
 */

import express from 'express'

export interface DatabaseQuery {
    table: string
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
    where?: Record<string, any>
    data?: Record<string, any>
    select?: string[]
    orderBy?: OrderByClause[]
    limit?: number
    offset?: number
}

export interface OrderByClause {
    field: string
    direction: 'ASC' | 'DESC'
}

export interface SafeQuery {
    query: string
    parameters: any[]
    parameterNames: string[]
}

export interface QueryValidationResult {
    isValid: boolean
    errors: string[]
    sanitizedQuery?: SafeQuery
}

export interface SQLInjectionConfig {
    enableParameterizedQueries: boolean
    logSuspiciousQueries: boolean
    blockDangerousPatterns: boolean
    maxQueryLength: number
    allowedTables: string[]
}

export class SQLInjectionProtector {
    private config: SQLInjectionConfig

    constructor(config: SQLInjectionConfig) {
        this.config = config
    }

    /**
     * Express middleware to validate requests for SQL injection attempts
     */
    validateRequest(req: express.Request, res: express.Response, next: express.NextFunction): void {
        try {
            // Check query parameters
            if (req.query && this.containsSQLInjection(JSON.stringify(req.query))) {
                this.logSuspiciousActivity('Query parameters contain SQL injection attempt', req)
                return res.status(400).json({
                    success: false,
                    error: 'Invalid query parameters detected',
                    securityAlert: true,
                    timestamp: new Date()
                })
            }

            // Check request body
            if (req.body && this.containsSQLInjection(JSON.stringify(req.body))) {
                this.logSuspiciousActivity('Request body contains SQL injection attempt', req)
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request data detected',
                    securityAlert: true,
                    timestamp: new Date()
                })
            }

            next()
        } catch (error) {
            console.error('❌ SQL injection validation error:', error)
            next()
        }
    }

    /**
     * Validate database query for SQL injection patterns
     */
    validateDatabaseQuery(queryString: string): boolean {
        if (!this.config.blockDangerousPatterns) {
            return true
        }

        return !this.containsSQLInjection(queryString)
    }

    /**
     * Validate and sanitize database queries to prevent SQL injection
     */
    validateQuery(query: DatabaseQuery): QueryValidationResult {
        const errors: string[] = []

        try {
            // Check table name
            if (!this.isValidTableName(query.table)) {
                errors.push(`Invalid table name: ${query.table}`)
            }

            // Check if table is allowed
            if (this.config.allowedTables.length > 0 && !this.config.allowedTables.includes(query.table)) {
                errors.push(`Table not allowed: ${query.table}`)
            }

            // Validate WHERE conditions
            if (query.where) {
                for (const [key, value] of Object.entries(query.where)) {
                    if (!this.isValidColumnName(key)) {
                        errors.push(`Invalid column name: ${key}`)
                    }
                    if (typeof value === 'string' && this.containsSQLInjection(value)) {
                        errors.push(`SQL injection detected in WHERE clause for column: ${key}`)
                    }
                }
            }

            // Validate data for INSERT/UPDATE
            if (query.data && (query.operation === 'INSERT' || query.operation === 'UPDATE')) {
                for (const [key, value] of Object.entries(query.data)) {
                    if (!this.isValidColumnName(key)) {
                        errors.push(`Invalid column name: ${key}`)
                    }
                    if (typeof value === 'string' && this.containsSQLInjection(value)) {
                        errors.push(`SQL injection detected in data for column: ${key}`)
                    }
                }
            }

            // Validate SELECT fields
            if (query.select) {
                for (const field of query.select) {
                    if (!this.isValidColumnName(field)) {
                        errors.push(`Invalid field name: ${field}`)
                    }
                }
            }

            // Validate ORDER BY
            if (query.orderBy && query.orderBy.length > 0) {
                for (const orderClause of query.orderBy) {
                    if (!this.isValidColumnName(orderClause.field)) {
                        errors.push(`Invalid order by field: ${orderClause.field}`)
                    }
                    if (!['ASC', 'DESC'].includes(orderClause.direction)) {
                        errors.push(`Invalid order direction: ${orderClause.direction}`)
                    }
                }
            }

            const isValid = errors.length === 0
            let sanitizedQuery: SafeQuery | undefined

            if (isValid && this.config.enableParameterizedQueries) {
                sanitizedQuery = this.buildParameterizedQuery(query)
            }

            return {
                isValid,
                errors,
                sanitizedQuery
            }

        } catch (error) {
            console.error('❌ Query validation error:', error)
            return {
                isValid: false,
                errors: [`Validation error: ${error.message}`]
            }
        }
    }

    /**
     * Build a safe parameterized query
     */
    private buildParameterizedQuery(query: DatabaseQuery): SafeQuery {
        let sql = ''
        const parameters: any[] = []
        const parameterNames: string[] = []

        switch (query.operation) {
            case 'SELECT':
                sql = this.buildSelectQuery(query, parameters, parameterNames)
                break
            case 'INSERT':
                sql = this.buildInsertQuery(query, parameters, parameterNames)
                break
            case 'UPDATE':
                sql = this.buildUpdateQuery(query, parameters, parameterNames)
                break
            case 'DELETE':
                sql = this.buildDeleteQuery(query, parameters, parameterNames)
                break
            default:
                throw new Error(`Unsupported operation: ${query.operation}`)
        }

        return {
            query: sql,
            parameters,
            parameterNames
        }
    }

    private buildSelectQuery(query: DatabaseQuery, parameters: any[], parameterNames: string[]): string {
        let sql = 'SELECT '

        if (query.select && query.select.length > 0) {
            sql += query.select.map(field => this.escapeIdentifier(field)).join(', ')
        } else {
            sql += '*'
        }

        sql += ` FROM ${this.escapeIdentifier(query.table)}`

        if (query.where && Object.keys(query.where).length > 0) {
            sql += ' WHERE '
            const conditions = Object.entries(query.where).map(([key, value]) => {
                parameters.push(value)
                parameterNames.push(key)
                return `${this.escapeIdentifier(key)} = ?`
            })
            sql += conditions.join(' AND ')
        }

        if (query.orderBy && query.orderBy.length > 0) {
            sql += ' ORDER BY ' + query.orderBy.map(clause =>
                `${this.escapeIdentifier(clause.field)} ${clause.direction}`
            ).join(', ')
        }

        if (query.limit) {
            sql += ` LIMIT ${parseInt(String(query.limit))}`
        }

        if (query.offset) {
            sql += ` OFFSET ${parseInt(String(query.offset))}`
        }

        return sql
    }

    private buildInsertQuery(query: DatabaseQuery, parameters: any[], parameterNames: string[]): string {
        if (!query.data || Object.keys(query.data).length === 0) {
            throw new Error('INSERT query requires data')
        }

        const columns = Object.keys(query.data)
        const values = Object.values(query.data)

        parameters.push(...values)
        parameterNames.push(...columns)

        let sql = `INSERT INTO ${this.escapeIdentifier(query.table)} (`
        sql += columns.map(col => this.escapeIdentifier(col)).join(', ')
        sql += ') VALUES ('
        sql += columns.map(() => '?').join(', ')
        sql += ')'

        return sql
    }

    private buildUpdateQuery(query: DatabaseQuery, parameters: any[], parameterNames: string[]): string {
        if (!query.data || Object.keys(query.data).length === 0) {
            throw new Error('UPDATE query requires data')
        }

        if (!query.where || Object.keys(query.where).length === 0) {
            throw new Error('UPDATE query requires WHERE conditions for safety')
        }

        let sql = `UPDATE ${this.escapeIdentifier(query.table)} SET `

        const setClauses = Object.entries(query.data).map(([key, value]) => {
            parameters.push(value)
            parameterNames.push(key)
            return `${this.escapeIdentifier(key)} = ?`
        })
        sql += setClauses.join(', ')

        sql += ' WHERE '
        const conditions = Object.entries(query.where).map(([key, value]) => {
            parameters.push(value)
            parameterNames.push(key)
            return `${this.escapeIdentifier(key)} = ?`
        })
        sql += conditions.join(' AND ')

        return sql
    }

    private buildDeleteQuery(query: DatabaseQuery, parameters: any[], parameterNames: string[]): string {
        if (!query.where || Object.keys(query.where).length === 0) {
            throw new Error('DELETE query requires WHERE conditions for safety')
        }

        let sql = `DELETE FROM ${this.escapeIdentifier(query.table)}`

        sql += ' WHERE '
        const conditions = Object.entries(query.where).map(([key, value]) => {
            parameters.push(value)
            parameterNames.push(key)
            return `${this.escapeIdentifier(key)} = ?`
        })
        sql += conditions.join(' AND ')

        return sql
    }

    /**
     * Check if string contains SQL injection patterns
     */
    private containsSQLInjection(input: string): boolean {
        if (!input || typeof input !== 'string') {
            return false
        }

        // Normalize input for analysis
        const normalized = input.toLowerCase().replace(/\s+/g, ' ').trim()

        // SQL injection patterns
        const patterns = [
            // Basic SQL injection
            /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b|\btruncate\b)/gi,
            // Union-based injection
            /\bunion\b.*\bselect\b/gi,
            // Comment-based injection
            /(--|\/\*|\*\/|#)/g,
            // String concatenation attacks
            /(\+\s*'|'\s*\+|\|\|)/g,
            // Boolean-based blind injection
            /(\bor\b\s+[\w'"]+\s*=\s*[\w'"]+|\band\b\s+[\w'"]+\s*=\s*[\w'"]+)/gi,
            // Time-based blind injection
            /(\bwaitfor\b|\bdelay\b|\bsleep\b|\bbenchmark\b)/gi,
            // Error-based injection
            /(\bcast\b|\bconvert\b|\bchar\b|\bnchar\b)/gi,
            // Stacked queries
            /;\s*(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b)/gi,
            // Information schema access
            /\binformation_schema\b/gi,
            // System functions
            /(\bsystem\b|\bexec\b|\bexecute\b|\bsp_\w+)/gi
        ]

        return patterns.some(pattern => pattern.test(normalized))
    }

    /**
     * Validate table name format
     */
    private isValidTableName(name: string): boolean {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
    }

    /**
     * Validate column name format
     */
    private isValidColumnName(name: string): boolean {
        return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$/.test(name)
    }

    /**
     * Escape SQL identifiers (table names, column names)
     */
    private escapeIdentifier(identifier: string): string {
        // Remove any existing backticks and add new ones
        return '`' + identifier.replace(/`/g, '``') + '`'
    }

    /**
     * Log suspicious SQL injection attempts
     */
    private logSuspiciousActivity(message: string, req: express.Request): void {
        if (this.config.logSuspiciousQueries) {
            console.warn(`🚨 SQL Injection Attempt Detected:`)
            console.warn(`   Message: ${message}`)
            console.warn(`   IP: ${req.ip}`)
            console.warn(`   URL: ${req.url}`)
            console.warn(`   Method: ${req.method}`)
            console.warn(`   User-Agent: ${req.get('User-Agent') || 'Unknown'}`)
            console.warn(`   Timestamp: ${new Date().toISOString()}`)
        }
    }
}

// Default configuration for SQL injection protection
export const defaultSQLInjectionConfig: SQLInjectionConfig = {
    enableParameterizedQueries: true,
    logSuspiciousQueries: true,
    blockDangerousPatterns: true,
    maxQueryLength: 10000,
    allowedTables: ['memories', 'entities', 'relations', 'observations', 'users', 'sessions']
}
