/**
 * Comprehensive Integration Tests for CBD Graph Database Engine
 * 
 * Tests all graph database functionality including:
 * - Vertex and edge operations
 * - Graph traversal algorithms (BFS/DFS)
 * - Path finding algorithms
 * - Gremlin API compatibility
 * - Cypher-like query language
 * - Graph analytics and performance
 */

import { CBDGraphDatabaseEngine, GraphVertex, GraphEdge, GraphPath } from '../src/graph/GraphDatabaseEngine';
import { CBDGremlinAPI } from '../src/graph/GremlinAPI';
import { CBDCypherEngine } from '../src/graph/CypherEngine';

describe('CBD Graph Database Engine Integration Tests', () => {
  let graphEngine: CBDGraphDatabaseEngine;
  let gremlinAPI: CBDGremlinAPI;
  let cypherEngine: CBDCypherEngine;

  beforeEach(async () => {
    graphEngine = new CBDGraphDatabaseEngine({
      enableIndexing: true,
      enableCaching: true,
      enableAnalytics: true
    });
    gremlinAPI = new CBDGremlinAPI(graphEngine);
    cypherEngine = new CBDCypherEngine(graphEngine);
  });

  afterEach(async () => {
    await graphEngine.clear();
  });

  describe('Basic Graph Operations', () => {
    test('should create vertices with properties', async () => {
      const vertex = await graphEngine.addVertex('user1', 'User', {
        name: 'Alice Johnson',
        age: 28,
        email: 'alice@example.com'
      });

      expect(vertex.id).toBe('user1');
      expect(vertex.label).toBe('User');
      expect(vertex.properties.name).toBe('Alice Johnson');
      expect(vertex.properties.age).toBe(28);
      expect(vertex.createdAt).toBeGreaterThan(0);
    });

    test('should create edges between vertices', async () => {
      await graphEngine.addVertex('user1', 'User', { name: 'Alice' });
      await graphEngine.addVertex('user2', 'User', { name: 'Bob' });

      const edge = await graphEngine.addEdge('friendship1', 'FRIENDS', 'user1', 'user2', {
        since: '2020-01-01',
        strength: 0.8
      }, 0.8);

      expect(edge.id).toBe('friendship1');
      expect(edge.label).toBe('FRIENDS');
      expect(edge.fromVertex).toBe('user1');
      expect(edge.toVertex).toBe('user2');
      expect(edge.weight).toBe(0.8);
      expect(edge.properties.since).toBe('2020-01-01');
    });

    test('should retrieve vertices and edges by ID', async () => {
      await graphEngine.addVertex('user1', 'User', { name: 'Alice' });
      await graphEngine.addVertex('user2', 'User', { name: 'Bob' });
      await graphEngine.addEdge('friendship1', 'FRIENDS', 'user1', 'user2');

      const vertex = await graphEngine.getVertex('user1');
      const edge = await graphEngine.getEdge('friendship1');

      expect(vertex).toBeTruthy();
      expect(vertex!.properties.name).toBe('Alice');
      expect(edge).toBeTruthy();
      expect(edge!.label).toBe('FRIENDS');
    });

    test('should find vertices by label and properties', async () => {
      await graphEngine.addVertex('user1', 'User', { name: 'Alice', age: 28 });
      await graphEngine.addVertex('user2', 'User', { name: 'Bob', age: 32 });
      await graphEngine.addVertex('user3', 'Person', { name: 'Charlie', age: 28 });

      const userVertices = await graphEngine.findVertices('User');
      const age28Vertices = await graphEngine.findVertices(undefined, { age: 28 });

      expect(userVertices).toHaveLength(2);
      expect(age28Vertices).toHaveLength(2);
    });
  });

  describe('Graph Traversal Algorithms', () => {
    beforeEach(async () => {
      // Create a sample social network graph
      await graphEngine.addVertex('alice', 'Person', { name: 'Alice', age: 28 });
      await graphEngine.addVertex('bob', 'Person', { name: 'Bob', age: 32 });
      await graphEngine.addVertex('charlie', 'Person', { name: 'Charlie', age: 25 });
      await graphEngine.addVertex('diana', 'Person', { name: 'Diana', age: 30 });
      await graphEngine.addVertex('eve', 'Person', { name: 'Eve', age: 27 });

      // Create relationships
      await graphEngine.addEdge('e1', 'KNOWS', 'alice', 'bob', {}, 1);
      await graphEngine.addEdge('e2', 'KNOWS', 'bob', 'charlie', {}, 1);
      await graphEngine.addEdge('e3', 'KNOWS', 'charlie', 'diana', {}, 1);
      await graphEngine.addEdge('e4', 'KNOWS', 'alice', 'eve', {}, 1);
      await graphEngine.addEdge('e5', 'KNOWS', 'eve', 'diana', {}, 1);
    });

    test('should perform BFS traversal', async () => {
      const paths = await graphEngine.bfsTraversal('alice', {
        maxDepth: 3,
        direction: 'out',
        limit: 10
      });

      expect(paths.length).toBeGreaterThan(0);
      
      // Check that Alice connects to Bob directly
      const directConnection = paths.find(path => 
        path.vertices.length === 2 && 
        path.vertices[1].id === 'bob'
      );
      expect(directConnection).toBeTruthy();
      expect(directConnection!.length).toBe(1);
    });

    test('should perform DFS traversal', async () => {
      const paths = await graphEngine.dfsTraversal('alice', {
        maxDepth: 3,
        direction: 'out',
        limit: 10
      });

      expect(paths.length).toBeGreaterThan(0);
      
      // DFS should explore deeply before backtracking
      const deepestPath = paths.reduce((deepest, current) => 
        current.length > deepest.length ? current : deepest
      );
      
      expect(deepestPath.length).toBeGreaterThan(1);
    });

    test('should find shortest path between vertices', async () => {
      const shortestPath = await graphEngine.shortestPath('alice', 'diana', {
        weighted: true
      });

      expect(shortestPath).toBeTruthy();
      expect(shortestPath!.vertices[0].id).toBe('alice');
      expect(shortestPath!.vertices[shortestPath!.vertices.length - 1].id).toBe('diana');
      expect(shortestPath!.length).toBeGreaterThan(0);
    });

    test('should handle traversal with filters', async () => {
      const paths = await graphEngine.bfsTraversal('alice', {
        maxDepth: 2,
        direction: 'out',
        edgeLabels: ['KNOWS'],
        vertexLabels: ['Person'],
        filter: (vertex) => vertex.properties.age < 30
      });

      // Should only include vertices with age < 30
      for (const path of paths) {
        for (const vertex of path.vertices) {
          if (vertex.id !== 'alice') { // Alice is the starting point
            expect(vertex.properties.age).toBeLessThan(30);
          }
        }
      }
    });
  });

  describe('Graph Analytics', () => {
    beforeEach(async () => {
      // Create a sample network for analytics
      await graphEngine.addVertex('v1', 'Node', { name: 'Node1' });
      await graphEngine.addVertex('v2', 'Node', { name: 'Node2' });
      await graphEngine.addVertex('v3', 'Node', { name: 'Node3' });
      await graphEngine.addVertex('v4', 'Node', { name: 'Node4' });

      await graphEngine.addEdge('e1', 'CONNECTED', 'v1', 'v2');
      await graphEngine.addEdge('e2', 'CONNECTED', 'v2', 'v3');
      await graphEngine.addEdge('e3', 'CONNECTED', 'v3', 'v4');
      await graphEngine.addEdge('e4', 'CONNECTED', 'v1', 'v4');
    });

    test('should calculate degree centrality', async () => {
      const centrality = await graphEngine.calculateDegreeCentrality();

      expect(Object.keys(centrality)).toHaveLength(4);
      expect(centrality['v1']).toBeGreaterThan(0);
      expect(centrality['v2']).toBeGreaterThan(0);
      expect(centrality['v3']).toBeGreaterThan(0);
      expect(centrality['v4']).toBeGreaterThan(0);
    });

    test('should detect communities', async () => {
      const communities = await graphEngine.detectCommunities();

      expect(communities).toHaveLength(1); // All nodes should be in one connected component
      expect(communities[0]).toHaveLength(4);
      expect(communities[0]).toContain('v1');
      expect(communities[0]).toContain('v2');
      expect(communities[0]).toContain('v3');
      expect(communities[0]).toContain('v4');
    });

    test('should provide graph statistics', async () => {
      const stats = await graphEngine.getGraphStatistics();

      expect(stats!.vertexCount).toBe(4);
      expect(stats!.edgeCount).toBe(4);
      expect(stats!.averageDegree).toBeGreaterThan(0);
      expect(stats!.density).toBeGreaterThan(0);
    });
  });

  describe('Gremlin API Compatibility', () => {
    test('should add vertices using Gremlin API', async () => {
      const g = gremlinAPI.g();
      
      const vertex = await g.addV('Person')
        .property('name', 'John Doe')
        .property('age', 35)
        .next();

      expect(vertex.label).toBe('Person');
      expect(vertex.properties.name).toBe('John Doe');
      expect(vertex.properties.age).toBe(35);
    });

    test('should add edges using Gremlin API', async () => {
      const g = gremlinAPI.g();
      
      const v1 = await g.addV('Person').property('name', 'Alice').next();
      const v2 = await g.addV('Person').property('name', 'Bob').next();
      
      const edge = await g.addE('KNOWS')
        .from(v1.id)
        .to(v2.id)
        .property('since', '2020-01-01')
        .next();

      expect(edge.label).toBe('KNOWS');
      expect(edge.fromVertex).toBe(v1.id);
      expect(edge.toVertex).toBe(v2.id);
      expect(edge.properties.since).toBe('2020-01-01');
    });

    test('should query vertices using Gremlin API', async () => {
      const g = gremlinAPI.g();
      
      await g.addV('Person').property('name', 'Alice').property('age', 28).next();
      await g.addV('Person').property('name', 'Bob').property('age', 32).next();
      
      const count = await g.V().hasLabel('Person').count();
      const values = await g.V().hasLabel('Person').values('name');

      expect(count).toBe(2);
      expect(values).toContain('Alice');
      expect(values).toContain('Bob');
    });

    test('should filter vertices with has() step', async () => {
      const g = gremlinAPI.g();
      
      await g.addV('Person').property('name', 'Alice').property('age', 28).next();
      await g.addV('Person').property('name', 'Bob').property('age', 32).next();
      
      const youngPeople = await g.V().hasLabel('Person').has('age').toList();
      const specificAge = await g.V().hasLabel('Person').has('age', 28).toList();

      expect(youngPeople).toHaveLength(2);
      expect(specificAge).toHaveLength(1);
      expect(specificAge[0].properties.name).toBe('Alice');
    });

    test('should limit results with limit() step', async () => {
      const g = gremlinAPI.g();
      
      await g.addV('Person').property('name', 'Alice').next();
      await g.addV('Person').property('name', 'Bob').next();
      await g.addV('Person').property('name', 'Charlie').next();
      
      const limitedResults = await g.V().hasLabel('Person').limit(2).toList();

      expect(limitedResults).toHaveLength(2);
    });
  });

  describe('Cypher Query Language', () => {
    test('should create vertices using Cypher CREATE', async () => {
      const result = await cypherEngine.execute(`
        CREATE (p:Person {name: "Alice", age: 28})
      `);

      expect(result.vertices).toHaveLength(1);
      expect(result.vertices![0].label).toBe('Person');
      expect(result.vertices![0].properties.name).toBe('Alice');
      expect(result.vertices![0].properties.age).toBe(28);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    test('should create relationships using Cypher CREATE', async () => {
      const result = await cypherEngine.execute(`
        CREATE (a:Person {name: "Alice"})-[:KNOWS {since: "2020-01-01"}]->(b:Person {name: "Bob"})
      `);

      expect(result.vertices).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.edges![0].label).toBe('KNOWS');
      expect(result.edges![0].properties.since).toBe('2020-01-01');
    });

    test('should match vertices using Cypher MATCH', async () => {
      // First create some data
      await cypherEngine.execute(`CREATE (p:Person {name: "Alice", age: 28})`);
      await cypherEngine.execute(`CREATE (p:Person {name: "Bob", age: 32})`);

      const result = await cypherEngine.execute(`
        MATCH (p:Person) RETURN p
      `);

      expect(result.vertices).toHaveLength(2);
      expect(result.vertices!.some(v => v.properties.name === 'Alice')).toBe(true);
      expect(result.vertices!.some(v => v.properties.name === 'Bob')).toBe(true);
    });

    test('should filter with WHERE clause', async () => {
      // Create test data
      await cypherEngine.execute(`CREATE (p:Person {name: "Alice", age: 28})`);
      await cypherEngine.execute(`CREATE (p:Person {name: "Bob", age: 32})`);

      const result = await cypherEngine.execute(`
        MATCH (p:Person) WHERE p.age = 28 RETURN p
      `);

      expect(result.vertices).toHaveLength(1);
      expect(result.vertices![0].properties.name).toBe('Alice');
    });

    test('should limit results with LIMIT', async () => {
      // Create test data
      await cypherEngine.execute(`CREATE (p:Person {name: "Alice"})`);
      await cypherEngine.execute(`CREATE (p:Person {name: "Bob"})`);
      await cypherEngine.execute(`CREATE (p:Person {name: "Charlie"})`);

      const result = await cypherEngine.execute(`
        MATCH (p:Person) RETURN p LIMIT 2
      `);

      expect(result.vertices).toHaveLength(2);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large number of vertices efficiently', async () => {
      const startTime = performance.now();
      
      // Create 1000 vertices
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(graphEngine.addVertex(`vertex_${i}`, 'TestNode', { index: i }));
      }
      await Promise.all(promises);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      const stats = await graphEngine.getEngineStats();
      expect(stats.vertices).toBe(1000);
    });

    test('should handle complex graph traversals', async () => {
      // Create a complex graph structure
      const numVertices = 50;
      const numEdges = 100;

      // Create vertices
      for (let i = 0; i < numVertices; i++) {
        await graphEngine.addVertex(`v${i}`, 'Node', { value: i });
      }

      // Create edges ensuring v0 has connections
      await graphEngine.addEdge('e_start_1', 'CONNECTED', 'v0', 'v1');
      await graphEngine.addEdge('e_start_2', 'CONNECTED', 'v0', 'v2');
      
      // Create random edges
      for (let i = 2; i < numEdges; i++) {
        const from = Math.floor(Math.random() * numVertices);
        const to = Math.floor(Math.random() * numVertices);
        if (from !== to) {
          try {
            await graphEngine.addEdge(`e${i}`, 'CONNECTED', `v${from}`, `v${to}`, {}, Math.random());
          } catch (e) {
            // Skip if edge already exists
          }
        }
      }

      const startTime = performance.now();
      const paths = await graphEngine.bfsTraversal('v0', { maxDepth: 5, limit: 100 });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(paths.length).toBeGreaterThan(0);
    });

    test('should handle non-existent vertices gracefully', async () => {
      const vertex = await graphEngine.getVertex('non-existent');
      expect(vertex).toBeNull();

      await expect(graphEngine.addEdge('edge1', 'KNOWS', 'non-existent1', 'non-existent2'))
        .rejects.toThrow('Both vertices must exist');
    });

    test('should prevent duplicate vertex IDs', async () => {
      await graphEngine.addVertex('duplicate', 'Test', {});
      
      await expect(graphEngine.addVertex('duplicate', 'Test', {}))
        .rejects.toThrow('Vertex with ID duplicate already exists');
    });

    test('should prevent duplicate edge IDs', async () => {
      await graphEngine.addVertex('v1', 'Test', {});
      await graphEngine.addVertex('v2', 'Test', {});
      await graphEngine.addEdge('duplicate', 'CONNECTED', 'v1', 'v2');
      
      await expect(graphEngine.addEdge('duplicate', 'CONNECTED', 'v1', 'v2'))
        .rejects.toThrow('Edge with ID duplicate already exists');
    });

    test('should provide accurate engine statistics', async () => {
      await graphEngine.addVertex('v1', 'Test', {});
      await graphEngine.addVertex('v2', 'Test', {});
      await graphEngine.addEdge('e1', 'CONNECTED', 'v1', 'v2');

      const stats = await graphEngine.getEngineStats();

      expect(stats.vertices).toBe(2);
      expect(stats.edges).toBe(1);
      expect(stats.indexCount).toBeGreaterThan(0);
      expect(stats.cacheSize).toBe(0); // No cache entries yet
    });

    test('should clear all data properly', async () => {
      await graphEngine.addVertex('v1', 'Test', {});
      await graphEngine.addVertex('v2', 'Test', {});
      await graphEngine.addEdge('e1', 'CONNECTED', 'v1', 'v2');

      let stats = await graphEngine.getEngineStats();
      expect(stats.vertices).toBe(2);
      expect(stats.edges).toBe(1);

      await graphEngine.clear();

      stats = await graphEngine.getEngineStats();
      expect(stats.vertices).toBe(0);
      expect(stats.edges).toBe(0);
    });
  });

  describe('Event Emissions', () => {
    test('should emit events for vertex operations', async () => {
      let eventsReceived = 0;
      
      const eventPromise = new Promise<void>((resolve) => {
        graphEngine.on('vertexAdded', (event) => {
          expect(event.vertex).toBeTruthy();
          expect(event.executionTime).toBeGreaterThan(0);
          eventsReceived++;
          if (eventsReceived === 1) resolve();
        });
      });

      await graphEngine.addVertex('test', 'Test', {});
      await eventPromise;
    });

    test('should emit events for edge operations', async () => {
      const eventPromise = new Promise<void>((resolve) => {
        graphEngine.on('edgeAdded', (event) => {
          expect(event.edge).toBeTruthy();
          expect(event.executionTime).toBeGreaterThan(0);
          resolve();
        });
      });

      await graphEngine.addVertex('v1', 'Test', {});
      await graphEngine.addVertex('v2', 'Test', {});
      await graphEngine.addEdge('e1', 'CONNECTED', 'v1', 'v2');
      await eventPromise;
    });

    test('should emit events for traversal operations', async () => {
      const eventPromise = new Promise<void>((resolve) => {
        graphEngine.on('traversalCompleted', (event) => {
          expect(event.algorithm).toBe('BFS');
          expect(event.startVertex).toBe('v1');
          expect(event.resultCount).toBeGreaterThanOrEqual(0);
          expect(event.executionTime).toBeGreaterThan(0);
          resolve();
        });
      });

      await graphEngine.addVertex('v1', 'Test', {});
      await graphEngine.bfsTraversal('v1');
      await eventPromise;
    });
  });
});

describe('Graph Database Integration with HTAP System', () => {
  test('should integrate with existing HTAP architecture', async () => {
    const graphEngine = new CBDGraphDatabaseEngine({ enableAnalytics: true });
    
    // Simulate integration test
    await graphEngine.addVertex('integration_test', 'TestVertex', { 
      integration: true,
      timestamp: Date.now()
    });

    const vertex = await graphEngine.getVertex('integration_test');
    expect(vertex).toBeTruthy();
    expect(vertex!.properties.integration).toBe(true);
    
    const stats = await graphEngine.getEngineStats();
    expect(stats.vertices).toBe(1);
  });
});