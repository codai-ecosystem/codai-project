@echo off
cd /d E:\GitHub\codai-project\apps\memorai\graphql
set GRAPHQL_CLIENT_API_KEY=memorai-test-key-2025-secure
set GRAPHQL_REQUIRE_AUTH=false
set GRAPHQL_SERVICE_TOKEN=memorai-test-key-2025-secure
set MEMORAI_API_BASE_URL=http://localhost:4006
set NODE_ENV=development
echo Starting GraphQL server with correct API keys...
node memorai-graphql-server.js
