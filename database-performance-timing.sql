-- Database Performance Test with Timing
\timing on

-- Simple query performance
SELECT 'Test 1: Simple COUNT query' as test_name;
SELECT COUNT(*) FROM users;

-- Join query performance  
SELECT 'Test 2: JOIN query performance' as test_name;
SELECT u.username, COUNT(p.id) as project_count 
FROM users u 
LEFT JOIN projects p ON u.id = p.user_id 
GROUP BY u.username;

-- JSON query performance
SELECT 'Test 3: JSONB query performance' as test_name;
SELECT name, config->'temperature' as temp 
FROM ai_models 
WHERE config ? 'temperature';

-- Complex query performance
SELECT 'Test 4: Complex aggregation query' as test_name;
SELECT 
    u.username,
    COUNT(p.id) as total_projects,
    AVG(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_ratio
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.username
ORDER BY total_projects DESC;

SELECT 'Performance tests completed!' as result;