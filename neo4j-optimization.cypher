// CodAI Neo4j Database Optimization Script
// Generated: 08/27/2025 12:16:50
// Purpose: Create indexes and optimize queries for CBD service

// Create indexes for better query performance
CREATE INDEX entity_type_index IF NOT EXISTS FOR (e:Entity) ON (e.type);
CREATE INDEX entity_created_index IF NOT EXISTS FOR (e:Entity) ON (e.created_at);
CREATE INDEX relationship_type_index IF NOT EXISTS FOR ()-[r:RELATES_TO]-() ON (r.type);
CREATE CONSTRAINT entity_id_unique IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;

// Query optimization examples and best practices:

// 1. Use LIMIT for large result sets
MATCH (e:Entity)
WHERE e.type = 'user'
RETURN e
ORDER BY e.created_at DESC
LIMIT 100;

// 2. Use WITH for query segmentation and memory optimization
MATCH (e1:Entity)-[r:RELATES_TO]->(e2:Entity)
WHERE e1.type = 'user' AND e2.type = 'project'
WITH e1, e2, r
WHERE r.strength > 0.5
RETURN e1.name, e2.name, r.strength
ORDER BY r.strength DESC;

// 3. Use parameters for query plan caching
// Instead of: MATCH (e:Entity) WHERE e.id = '12345'
// Use: MATCH (e:Entity) WHERE e.id = $entityId

// 4. Profile queries to identify bottlenecks
PROFILE
MATCH (e:Entity)-[r:RELATES_TO*1..3]->(target:Entity)
WHERE e.id = $startEntityId
RETURN target.name, length(r) as depth
ORDER BY depth;

// 5. Use EXPLAIN to understand query plans
EXPLAIN
MATCH (e:Entity)
WHERE e.type IN ['user', 'project', 'task']
RETURN count(e);

// Query performance monitoring
CALL db.stats.retrieve('GRAPH COUNTS');
