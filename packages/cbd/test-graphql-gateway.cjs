#!/usr/bin/env node

/**
 * CBD GraphQL Gateway Test Suite
 * Comprehensive testing for GraphQL API Gateway functionality
 * 
 * Tests:
 * - Gateway service health and initialization
 * - GraphQL endpoint availability and response
 * - Schema validation and introspection
 * - Query execution and validation
 * - Mutation operations
 * - Subscription handling (if available)
 * - DataLoader batching efficiency
 * - Performance and error handling
 * - Real-time capabilities
 * - Analytics integration
 */

const http = require('http');

/**
 * GraphQL Gateway Test Runner
 * Comprehensive test suite for GraphQL functionality
 */
class GraphQLGatewayTestRunner {
    constructor(options = {}) {
        this.config = {
            host: options.host || 'localhost',
            port: options.port || 4800,
            timeout: options.timeout || 10000,
            verbose: options.verbose !== false,
            ...options
        };

        this.baseUrl = `http://${this.config.host}:${this.config.port}`;
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: [],
            details: [],
            startTime: Date.now(),
            endTime: null
        };

        this.testGroups = [
            'Service Health Tests',
            'GraphQL Endpoint Tests',
            'Schema Validation Tests',
            'Query Execution Tests',
            'Mutation Operation Tests',
            'Subscription Tests',
            'Performance Tests',
            'Error Handling Tests',
            'Analytics Integration Tests',
            'Real-time Feature Tests'
        ];
    }

    log(message, type = 'info') {
        if (!this.config.verbose && type === 'debug') return;

        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'debug': '🔍'
        }[type] || '📋';

        console.log(`${timestamp} ${prefix} ${message}`);
    }

    async makeRequest(path, options = {}) {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}${path}`;
            const requestOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: this.config.timeout
            };

            const req = http.request(url, requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = {
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: res.headers['content-type']?.includes('application/json')
                                ? JSON.parse(data)
                                : data
                        };
                        resolve(response);
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: data,
                            parseError: error.message
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (options.body) {
                req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async graphqlRequest(query, variables = {}, operationName = null) {
        return await this.makeRequest('/graphql', {
            method: 'POST',
            body: {
                query,
                variables,
                operationName
            }
        });
    }

    async runTest(testName, testFunction) {
        this.results.total++;
        const startTime = Date.now();

        try {
            this.log(`Running: ${testName}`, 'debug');
            await testFunction();

            const duration = Date.now() - startTime;
            this.results.passed++;
            this.results.details.push({
                name: testName,
                status: 'passed',
                duration,
                error: null
            });

            this.log(`✅ ${testName} (${duration}ms)`, 'success');

        } catch (error) {
            const duration = Date.now() - startTime;
            this.results.failed++;
            this.results.errors.push({
                test: testName,
                error: error.message,
                stack: error.stack
            });
            this.results.details.push({
                name: testName,
                status: 'failed',
                duration,
                error: error.message
            });

            this.log(`❌ ${testName}: ${error.message}`, 'error');
        }
    }

    async runServiceHealthTests() {
        this.log('🔍 Running Service Health Tests...', 'info');

        await this.runTest('Gateway service is running', async () => {
            const response = await this.makeRequest('/health');

            if (response.statusCode !== 200) {
                throw new Error(`Health check failed with status ${response.statusCode}`);
            }

            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Health check response is not valid JSON');
            }

            if (response.data.status !== 'healthy') {
                throw new Error(`Service status is ${response.data.status}, expected 'healthy'`);
            }

            // Validate required health fields
            const requiredFields = ['service', 'version', 'uptime', 'stats', 'features'];
            for (const field of requiredFields) {
                if (!(field in response.data)) {
                    throw new Error(`Health response missing required field: ${field}`);
                }
            }
        });

        await this.runTest('GraphQL endpoint is accessible', async () => {
            const response = await this.makeRequest('/graphql');

            // GraphQL endpoint should be accessible (200 for GET with playground or 400 for missing query)
            if (response.statusCode !== 200 && response.statusCode !== 400) {
                throw new Error(`GraphQL endpoint returned unexpected status ${response.statusCode}`);
            }
        });

        await this.runTest('Schema info endpoint is working', async () => {
            const response = await this.makeRequest('/schema');

            if (response.statusCode !== 200) {
                throw new Error(`Schema endpoint failed with status ${response.statusCode}`);
            }

            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Schema response is not valid JSON');
            }
        });

        await this.runTest('Statistics endpoint is working', async () => {
            const response = await this.makeRequest('/stats');

            if (response.statusCode !== 200) {
                throw new Error(`Stats endpoint failed with status ${response.statusCode}`);
            }

            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Stats response is not valid JSON');
            }

            // Validate stats structure
            const requiredStats = ['totalQueries', 'totalMutations', 'totalSubscriptions', 'startTime'];
            for (const stat of requiredStats) {
                if (!(stat in response.data)) {
                    throw new Error(`Stats response missing required field: ${stat}`);
                }
            }
        });
    }

    async runGraphQLEndpointTests() {
        this.log('🔍 Running GraphQL Endpoint Tests...', 'info');

        await this.runTest('GraphQL introspection query', async () => {
            const introspectionQuery = `
                query IntrospectionQuery {
                    __schema {
                        types {
                            name
                            kind
                        }
                        queryType {
                            name
                        }
                        mutationType {
                            name
                        }
                        subscriptionType {
                            name
                        }
                    }
                }
            `;

            const response = await this.graphqlRequest(introspectionQuery);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.__schema) {
                throw new Error('Introspection query did not return schema information');
            }

            const schema = response.data.data.__schema;
            if (!schema.queryType || schema.queryType.name !== 'Query') {
                throw new Error('Schema missing Query type');
            }
        });

        await this.runTest('GraphQL schema info query', async () => {
            const schemaInfoQuery = `
                query {
                    schemaInfo {
                        version
                        types
                        queries
                        mutations
                        subscriptions
                        complexity
                        features
                    }
                }
            `;

            const response = await this.graphqlRequest(schemaInfoQuery);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.schemaInfo) {
                throw new Error('Schema info query did not return data');
            }

            const schemaInfo = response.data.data.schemaInfo;
            if (!schemaInfo.version || !schemaInfo.features) {
                throw new Error('Schema info missing required fields');
            }
        });

        await this.runTest('Invalid GraphQL query handling', async () => {
            const invalidQuery = `
                query {
                    nonExistentField {
                        invalidSubfield
                    }
                }
            `;

            const response = await this.graphqlRequest(invalidQuery);

            if (response.statusCode !== 200) {
                throw new Error(`Expected 200 status for GraphQL error, got ${response.statusCode}`);
            }

            if (!response.data.errors || response.data.errors.length === 0) {
                throw new Error('Expected GraphQL errors for invalid query');
            }
        });
    }

    async runQueryExecutionTests() {
        this.log('🔍 Running Query Execution Tests...', 'info');

        await this.runTest('Document query execution', async () => {
            const documentQuery = `
                query {
                    document(id: "test-doc-1") {
                        id
                        title
                        content
                        collection
                        createdAt
                        updatedAt
                        status
                        version
                        author {
                            id
                            username
                        }
                    }
                }
            `;

            const response = await this.graphqlRequest(documentQuery);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.document) {
                throw new Error('Document query did not return data');
            }

            const document = response.data.data.document;
            if (!document.id || !document.title || !document.status) {
                throw new Error('Document missing required fields');
            }
        });

        await this.runTest('Documents list query with pagination', async () => {
            const documentsQuery = `
                query {
                    documents(limit: 5, offset: 0) {
                        nodes {
                            id
                            title
                            status
                            createdAt
                        }
                        totalCount
                        pageInfo {
                            hasNextPage
                            hasPreviousPage
                            startCursor
                            endCursor
                        }
                    }
                }
            `;

            const response = await this.graphqlRequest(documentsQuery);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.documents) {
                throw new Error('Documents query did not return data');
            }

            const documents = response.data.data.documents;
            if (!Array.isArray(documents.nodes) || typeof documents.totalCount !== 'number') {
                throw new Error('Documents pagination structure invalid');
            }
        });

        await this.runTest('User query execution', async () => {
            const userQuery = `
                query {
                    user(id: "test-user-1") {
                        id
                        username
                        email
                        profile {
                            firstName
                            lastName
                            bio
                        }
                        status
                        createdAt
                        lastActive
                    }
                }
            `;

            const response = await this.graphqlRequest(userQuery);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.user) {
                throw new Error('User query did not return data');
            }

            const user = response.data.data.user;
            if (!user.id || !user.username || !user.email) {
                throw new Error('User missing required fields');
            }
        });

        await this.runTest('Analytics query execution', async () => {
            const analyticsQuery = `
                query {
                    analytics(query: {
                        type: PREDICTIVE
                        parameters: {}
                        filters: {}
                        options: {}
                    }) {
                        id
                        query
                        results
                        insights {
                            type
                            description
                            confidence
                            data
                        }
                        performance {
                            processingTime
                            dataPoints
                            accuracy
                            efficiency
                        }
                        createdAt
                    }
                }
            `;

            const response = await this.graphqlRequest(analyticsQuery);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.analytics) {
                throw new Error('Analytics query did not return data');
            }

            const analytics = response.data.data.analytics;
            if (!analytics.id || !analytics.results || !analytics.performance) {
                throw new Error('Analytics result missing required fields');
            }
        });
    }

    async runMutationOperationTests() {
        this.log('🔍 Running Mutation Operation Tests...', 'info');

        await this.runTest('Create document mutation', async () => {
            const createDocumentMutation = `
                mutation {
                    createDocument(input: {
                        title: "Test Document"
                        content: { text: "This is a test document" }
                        collection: "test-documents"
                        metadata: { tags: ["test", "mutation"] }
                    }) {
                        id
                        title
                        content
                        collection
                        status
                        version
                        createdAt
                        author {
                            id
                            username
                        }
                    }
                }
            `;

            const response = await this.graphqlRequest(createDocumentMutation);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.createDocument) {
                throw new Error('Create document mutation did not return data');
            }

            const document = response.data.data.createDocument;
            if (!document.id || document.title !== "Test Document") {
                throw new Error('Created document has incorrect data');
            }
        });

        await this.runTest('Update document mutation', async () => {
            const updateDocumentMutation = `
                mutation {
                    updateDocument(
                        id: "test-doc-1"
                        input: {
                            title: "Updated Test Document"
                            content: { text: "This document has been updated" }
                            status: PUBLISHED
                        }
                    ) {
                        id
                        title
                        content
                        status
                        version
                        updatedAt
                    }
                }
            `;

            const response = await this.graphqlRequest(updateDocumentMutation);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.updateDocument) {
                throw new Error('Update document mutation did not return data');
            }

            const document = response.data.data.updateDocument;
            if (document.title !== "Updated Test Document" || document.status !== 'PUBLISHED') {
                throw new Error('Updated document has incorrect data');
            }
        });

        await this.runTest('Create user mutation', async () => {
            const createUserMutation = `
                mutation {
                    createUser(input: {
                        username: "testuser123"
                        email: "testuser@example.com"
                        profile: {
                            firstName: "Test"
                            lastName: "User"
                            bio: "This is a test user"
                        }
                    }) {
                        id
                        username
                        email
                        profile {
                            firstName
                            lastName
                            bio
                        }
                        status
                        createdAt
                    }
                }
            `;

            const response = await this.graphqlRequest(createUserMutation);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.createUser) {
                throw new Error('Create user mutation did not return data');
            }

            const user = response.data.data.createUser;
            if (user.username !== "testuser123" || user.email !== "testuser@example.com") {
                throw new Error('Created user has incorrect data');
            }
        });

        await this.runTest('Train model mutation', async () => {
            const trainModelMutation = `
                mutation {
                    trainModel(input: {
                        name: "test-model"
                        type: REGRESSION
                        data: { 
                            features: [[1, 2], [3, 4], [5, 6]]
                            labels: [10, 20, 30]
                        }
                        config: { epochs: 10, learningRate: 0.01 }
                    }) {
                        modelId
                        status
                        accuracy
                        loss
                        metrics
                    }
                }
            `;

            const response = await this.graphqlRequest(trainModelMutation);

            if (response.statusCode !== 200) {
                throw new Error(`GraphQL request failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.trainModel) {
                throw new Error('Train model mutation did not return data');
            }

            const result = response.data.data.trainModel;
            if (!result.modelId || !result.status) {
                throw new Error('Model training result missing required fields');
            }
        });
    }

    async runPerformanceTests() {
        this.log('🔍 Running Performance Tests...', 'info');

        await this.runTest('Query response time performance', async () => {
            const startTime = Date.now();

            const query = `
                query {
                    documents(limit: 10) {
                        nodes {
                            id
                            title
                            author {
                                id
                                username
                            }
                        }
                        totalCount
                    }
                }
            `;

            const response = await this.graphqlRequest(query);
            const duration = Date.now() - startTime;

            if (response.statusCode !== 200) {
                throw new Error(`Query failed with status ${response.statusCode}`);
            }

            if (duration > 5000) {
                throw new Error(`Query too slow: ${duration}ms (expected < 5000ms)`);
            }

            this.log(`Query completed in ${duration}ms`, 'debug');
        });

        await this.runTest('Concurrent query handling', async () => {
            const query = `
                query {
                    user(id: "concurrent-test") {
                        id
                        username
                        email
                    }
                }
            `;

            const startTime = Date.now();

            // Run 5 concurrent queries
            const promises = Array(5).fill(0).map(() => this.graphqlRequest(query));
            const responses = await Promise.all(promises);

            const duration = Date.now() - startTime;

            // Check all responses are successful
            for (let i = 0; i < responses.length; i++) {
                if (responses[i].statusCode !== 200) {
                    throw new Error(`Concurrent query ${i + 1} failed with status ${responses[i].statusCode}`);
                }
            }

            if (duration > 10000) {
                throw new Error(`Concurrent queries too slow: ${duration}ms (expected < 10000ms)`);
            }

            this.log(`5 concurrent queries completed in ${duration}ms`, 'debug');
        });

        await this.runTest('Large query result handling', async () => {
            const query = `
                query {
                    documents(limit: 50) {
                        nodes {
                            id
                            title
                            content
                            metadata
                            author {
                                id
                                username
                                email
                                profile {
                                    firstName
                                    lastName
                                    bio
                                }
                            }
                        }
                        totalCount
                        pageInfo {
                            hasNextPage
                            hasPreviousPage
                            startCursor
                            endCursor
                        }
                    }
                }
            `;

            const response = await this.graphqlRequest(query);

            if (response.statusCode !== 200) {
                throw new Error(`Large query failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`Large query errors: ${JSON.stringify(response.data.errors)}`);
            }

            const responseSize = JSON.stringify(response.data).length;
            this.log(`Large query response size: ${responseSize} bytes`, 'debug');
        });
    }

    async runErrorHandlingTests() {
        this.log('🔍 Running Error Handling Tests...', 'info');

        await this.runTest('GraphQL syntax error handling', async () => {
            const invalidSyntaxQuery = `
                query {
                    document(id: "test") {
                        id
                        title
                        // Missing closing brace
                    // }
                }
            `;

            const response = await this.graphqlRequest(invalidSyntaxQuery);

            if (response.statusCode !== 200) {
                throw new Error(`Expected 200 status for syntax error, got ${response.statusCode}`);
            }

            if (!response.data.errors || response.data.errors.length === 0) {
                throw new Error('Expected GraphQL syntax errors');
            }
        });

        await this.runTest('Invalid field error handling', async () => {
            const invalidFieldQuery = `
                query {
                    document(id: "test") {
                        id
                        nonExistentField
                        title
                    }
                }
            `;

            const response = await this.graphqlRequest(invalidFieldQuery);

            if (response.statusCode !== 200) {
                throw new Error(`Expected 200 status for field error, got ${response.statusCode}`);
            }

            if (!response.data.errors || response.data.errors.length === 0) {
                throw new Error('Expected GraphQL field errors');
            }
        });

        await this.runTest('Invalid argument error handling', async () => {
            const invalidArgumentQuery = `
                query {
                    documents(invalidArgument: "test") {
                        nodes {
                            id
                            title
                        }
                    }
                }
            `;

            const response = await this.graphqlRequest(invalidArgumentQuery);

            if (response.statusCode !== 200) {
                throw new Error(`Expected 200 status for argument error, got ${response.statusCode}`);
            }

            if (!response.data.errors || response.data.errors.length === 0) {
                throw new Error('Expected GraphQL argument errors');
            }
        });
    }

    async runAnalyticsIntegrationTests() {
        this.log('🔍 Running Analytics Integration Tests...', 'info');

        await this.runTest('Predictive analytics query', async () => {
            const predictiveQuery = `
                query {
                    predictiveAnalytics(
                        data: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
                        horizon: 5
                    ) {
                        forecast
                        confidence
                        trend
                        seasonality
                        accuracy
                    }
                }
            `;

            const response = await this.graphqlRequest(predictiveQuery);

            if (response.statusCode !== 200) {
                throw new Error(`Predictive analytics query failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`Predictive analytics errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.predictiveAnalytics) {
                throw new Error('Predictive analytics query did not return data');
            }

            const result = response.data.data.predictiveAnalytics;
            if (!result.forecast || !Array.isArray(result.forecast) || result.forecast.length !== 5) {
                throw new Error('Predictive analytics forecast invalid');
            }
        });

        await this.runTest('Anomaly detection query', async () => {
            const anomalyQuery = `
                query {
                    anomalyDetection(
                        data: [1.0, 2.0, 3.0, 100.0, 5.0, 6.0, 7.0, 8.0, 200.0, 10.0]
                        threshold: 2.0
                    ) {
                        anomalies {
                            index
                            value
                            score
                            severity
                            description
                        }
                        threshold
                        method
                        statistics
                    }
                }
            `;

            const response = await this.graphqlRequest(anomalyQuery);

            if (response.statusCode !== 200) {
                throw new Error(`Anomaly detection query failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`Anomaly detection errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.anomalyDetection) {
                throw new Error('Anomaly detection query did not return data');
            }

            const result = response.data.data.anomalyDetection;
            if (!Array.isArray(result.anomalies) || typeof result.threshold !== 'number') {
                throw new Error('Anomaly detection result invalid');
            }
        });
    }

    async runRealtimeFeatureTests() {
        this.log('🔍 Running Real-time Feature Tests...', 'info');

        await this.runTest('Real-time status query', async () => {
            const statusQuery = `
                query {
                    realtimeStatus {
                        activeConnections
                        activeCollaborations
                        systemLoad
                        uptime
                    }
                }
            `;

            const response = await this.graphqlRequest(statusQuery);

            if (response.statusCode !== 200) {
                throw new Error(`Real-time status query failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`Real-time status errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.realtimeStatus) {
                throw new Error('Real-time status query did not return data');
            }

            const status = response.data.data.realtimeStatus;
            if (typeof status.activeConnections !== 'number' || typeof status.uptime !== 'number') {
                throw new Error('Real-time status data invalid');
            }
        });

        await this.runTest('Collaboration operations', async () => {
            // Start collaboration
            const startCollaboration = `
                mutation {
                    startCollaboration(input: {
                        name: "Test Collaboration"
                        documentId: "test-doc-1"
                        settings: {
                            notifications: true
                            autoSave: true
                            conflictResolution: OPERATIONAL_TRANSFORM
                        }
                    }) {
                        id
                        name
                        status
                        participants {
                            id
                            username
                        }
                        settings {
                            notifications
                            autoSave
                            conflictResolution
                        }
                    }
                }
            `;

            const response = await this.graphqlRequest(startCollaboration);

            if (response.statusCode !== 200) {
                throw new Error(`Start collaboration mutation failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`Start collaboration errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || !response.data.data.startCollaboration) {
                throw new Error('Start collaboration mutation did not return data');
            }

            const collaboration = response.data.data.startCollaboration;
            if (!collaboration.id || collaboration.name !== "Test Collaboration") {
                throw new Error('Collaboration data invalid');
            }
        });

        await this.runTest('Publish update mutation', async () => {
            const publishUpdate = `
                mutation {
                    publishUpdate(input: {
                        type: DOCUMENT_CHANGE
                        data: { documentId: "test-doc-1", changes: ["title updated"] }
                        target: "collaboration-123"
                    })
                }
            `;

            const response = await this.graphqlRequest(publishUpdate);

            if (response.statusCode !== 200) {
                throw new Error(`Publish update mutation failed with status ${response.statusCode}`);
            }

            if (response.data.errors) {
                throw new Error(`Publish update errors: ${JSON.stringify(response.data.errors)}`);
            }

            if (!response.data.data || response.data.data.publishUpdate !== true) {
                throw new Error('Publish update mutation did not return success');
            }
        });
    }

    async runAllTests() {
        this.log('🚀 Starting CBD GraphQL Gateway Test Suite...', 'info');
        this.log(`Testing endpoint: ${this.baseUrl}`, 'info');

        try {
            // Service Health Tests
            await this.runServiceHealthTests();

            // GraphQL Endpoint Tests
            await this.runGraphQLEndpointTests();

            // Query Execution Tests
            await this.runQueryExecutionTests();

            // Mutation Operation Tests
            await this.runMutationOperationTests();

            // Performance Tests
            await this.runPerformanceTests();

            // Error Handling Tests
            await this.runErrorHandlingTests();

            // Analytics Integration Tests
            await this.runAnalyticsIntegrationTests();

            // Real-time Feature Tests
            await this.runRealtimeFeatureTests();

        } catch (error) {
            this.log(`Test suite error: ${error.message}`, 'error');
        }

        this.results.endTime = Date.now();
        const totalDuration = this.results.endTime - this.results.startTime;

        this.log('\n📊 Test Results Summary:', 'info');
        this.log(`Total Tests: ${this.results.total}`, 'info');
        this.log(`Passed: ${this.results.passed}`, 'success');
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');
        this.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`, 'info');
        this.log(`Total Duration: ${totalDuration}ms`, 'info');

        if (this.results.errors.length > 0) {
            this.log('\n❌ Failed Tests:', 'error');
            this.results.errors.forEach(error => {
                this.log(`  ${error.test}: ${error.error}`, 'error');
            });
        }

        // Performance summary
        const avgDuration = this.results.details.reduce((sum, test) => sum + test.duration, 0) / this.results.details.length;
        this.log(`Average Test Duration: ${avgDuration.toFixed(1)}ms`, 'info');

        const successRate = (this.results.passed / this.results.total) * 100;

        return {
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                successRate: successRate,
                totalDuration,
                averageDuration: avgDuration
            },
            details: this.results.details,
            errors: this.results.errors,
            endpoint: this.baseUrl,
            timestamp: new Date().toISOString()
        };
    }
}

// Auto-run if called directly
if (require.main === module) {
    const config = {
        host: process.env.TEST_HOST || 'localhost',
        port: parseInt(process.env.TEST_PORT) || 4800,
        verbose: process.env.VERBOSE !== 'false'
    };

    const testRunner = new GraphQLGatewayTestRunner(config);

    testRunner.runAllTests()
        .then(results => {
            console.log('\n🎯 Test suite completed');

            if (results.summary.failed > 0) {
                process.exit(1);
            } else {
                process.exit(0);
            }
        })
        .catch(error => {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        });
}

module.exports = GraphQLGatewayTestRunner;
