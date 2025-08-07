#!/usr/bin/env node

/**
 * Test script for CBD Universal Database DELETE operations
 * Tests all engines: Document, Key-Value, Vector, Graph
 */

const BASE_URL = 'http://localhost:4180';

async function testRequest(method, endpoint, body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();

        console.log(`${method} ${endpoint}:`, response.status, result);
        return result;
    } catch (error) {
        console.error(`${method} ${endpoint} ERROR:`, error.message);
        return null;
    }
}

async function testDocumentOperations() {
    console.log('\n🗂️  Testing Document Operations...');

    // Create a test document
    const insertResult = await testRequest('POST', '/document/', {
        collection: 'test_collection',
        document: { name: 'test_doc', value: 123 }
    });

    if (insertResult?.success) {
        const docId = insertResult.result.insertedId;
        console.log('✅ Document created with ID:', docId);

        // Test DELETE single document
        const deleteResult = await testRequest('DELETE', `/document/test_collection/${docId}`);
        console.log('🗑️  Delete result:', deleteResult);

        // Create another document for bulk delete test
        await testRequest('POST', '/document/', {
            collection: 'test_collection',
            document: { name: 'bulk_test', value: 456 }
        });

        // Test bulk DELETE
        const bulkDeleteResult = await testRequest('DELETE', '/document/test_collection', {
            query: { name: 'bulk_test' }
        });
        console.log('🗑️  Bulk delete result:', bulkDeleteResult);
    }
}

async function testKeyValueOperations() {
    console.log('\n🔑 Testing Key-Value Operations...');

    // Set a test key
    const setResult = await testRequest('POST', '/kv/test_key', {
        value: 'test_value',
        ttl: 60000
    });

    if (setResult?.success) {
        console.log('✅ Key-value pair created');

        // Test DELETE key
        const deleteResult = await testRequest('DELETE', '/kv/test_key');
        console.log('🗑️  Delete result:', deleteResult);

        // Verify key is deleted
        const getResult = await testRequest('GET', '/kv/test_key');
        console.log('🔍 Verification (should be null):', getResult);
    }
}

async function testVectorOperations() {
    console.log('\n🔢 Testing Vector Operations...');

    // Insert a test vector
    const insertResult = await testRequest('POST', '/vector/', {
        id: 'test_vector_1',
        vector: [1, 2, 3, 4, 5],
        metadata: { category: 'test' }
    });

    if (insertResult?.success) {
        console.log('✅ Vector created');

        // Test DELETE single vector
        const deleteResult = await testRequest('DELETE', '/vector/test_vector_1');
        console.log('🗑️  Delete result:', deleteResult);

        // Create vectors for bulk delete test
        await testRequest('POST', '/vector/', {
            id: 'bulk_vector_1',
            vector: [1, 1, 1, 1, 1],
            metadata: { category: 'bulk_test' }
        });

        await testRequest('POST', '/vector/', {
            id: 'bulk_vector_2',
            vector: [2, 2, 2, 2, 2],
            metadata: { category: 'bulk_test' }
        });

        // Test bulk DELETE by filter
        const bulkDeleteResult = await testRequest('DELETE', '/vector/', {
            filters: { category: 'bulk_test' }
        });
        console.log('🗑️  Bulk delete result:', bulkDeleteResult);
    }
}

async function testGraphOperations() {
    console.log('\n🕸️  Testing Graph Operations...');

    // Create test nodes
    const node1Result = await testRequest('POST', '/graph/node', {
        id: 'node_1',
        labels: ['Person'],
        properties: { name: 'Alice' }
    });

    const node2Result = await testRequest('POST', '/graph/node', {
        id: 'node_2',
        labels: ['Person'],
        properties: { name: 'Bob' }
    });

    if (node1Result?.success && node2Result?.success) {
        console.log('✅ Nodes created');

        // Create a relationship
        const relResult = await testRequest('POST', '/graph/relationship', {
            id: 'rel_1',
            type: 'KNOWS',
            fromNodeId: 'node_1',
            toNodeId: 'node_2',
            properties: { since: '2023' }
        });

        if (relResult?.success) {
            console.log('✅ Relationship created');

            // Test DELETE relationship
            const deleteRelResult = await testRequest('DELETE', '/graph/relationship/rel_1');
            console.log('🗑️  Delete relationship result:', deleteRelResult);
        }

        // Test DELETE nodes
        const deleteNode1Result = await testRequest('DELETE', '/graph/node/node_1');
        const deleteNode2Result = await testRequest('DELETE', '/graph/node/node_2');
        console.log('🗑️  Delete nodes result:', { node1: deleteNode1Result, node2: deleteNode2Result });
    }
}

async function main() {
    console.log('🧪 CBD Universal Database DELETE Operations Test');
    console.log('='.repeat(50));

    // Test health first
    const health = await testRequest('GET', '/health');
    if (!health) {
        console.error('❌ CBD Database is not accessible!');
        return;
    }

    console.log('✅ CBD Database is healthy');

    // Run all tests
    await testDocumentOperations();
    await testKeyValueOperations();
    await testVectorOperations();
    await testGraphOperations();

    console.log('\n🎉 All DELETE operations tests completed!');
}

// Run the tests
main().catch(console.error);
