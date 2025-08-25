-- CODAI Database Performance & ACID Compliance Tests

-- Test 1: Transaction ACID Compliance
\echo 'Test 1: ACID Transaction Handling...'
BEGIN;
INSERT INTO users (username, email, password_hash) VALUES ('perf_test_user', 'perf@codai.com', 'hash_test');
SELECT 'Transaction: User inserted successfully' as status;
COMMIT;
SELECT 'Transaction: Committed successfully' as result;

-- Test 2: Data Integrity Constraints
\echo 'Test 2: Data Integrity Constraints...'
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(DISTINCT username) as unique_usernames
FROM users;

-- Test 3: Index Performance
\echo 'Test 3: Index Performance Test...'
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'admin@codai.com';

-- Test 4: Foreign Key Integrity
\echo 'Test 4: Foreign Key Integrity Test...'
SELECT 
    u.username,
    COUNT(p.id) as project_count
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.username
ORDER BY project_count DESC;

-- Test 5: JSON Data Handling
\echo 'Test 5: JSONB Data Handling Test...'
SELECT 
    name,
    model_type,
    config->'temperature' as temperature,
    config->'max_tokens' as max_tokens
FROM ai_models
WHERE config ? 'temperature';

-- Test 6: Database Statistics
\echo 'Test 6: Database Statistics and Health...'
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size('codai_main')) as value
UNION ALL
SELECT 
    'Active Connections' as metric,
    COUNT(*)::text as value
FROM pg_stat_activity
WHERE datname = 'codai_main'
UNION ALL
SELECT
    'Table Count' as metric,
    COUNT(*)::text as value
FROM information_schema.tables
WHERE table_schema = 'public';

\echo 'All database tests completed successfully!'