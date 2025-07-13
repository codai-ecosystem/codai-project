#!/bin/bash
set -e

# Create databases for each app
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create databases
    CREATE DATABASE codai;
    CREATE DATABASE memorai;
    CREATE DATABASE logai;
    CREATE DATABASE bancai;
    
    -- Create users with passwords
    CREATE USER codai WITH PASSWORD 'password';
    CREATE USER memorai WITH PASSWORD 'password';
    CREATE USER logai WITH PASSWORD 'password';
    CREATE USER bancai WITH PASSWORD 'password';
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE codai TO codai;
    GRANT ALL PRIVILEGES ON DATABASE memorai TO memorai;
    GRANT ALL PRIVILEGES ON DATABASE logai TO logai;
    GRANT ALL PRIVILEGES ON DATABASE bancai TO bancai;
    
    -- Connect to each database and grant schema privileges
    \c codai;
    GRANT ALL ON SCHEMA public TO codai;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO codai;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO codai;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO codai;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO codai;
    
    \c memorai;
    GRANT ALL ON SCHEMA public TO memorai;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO memorai;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO memorai;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO memorai;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO memorai;
    
    \c logai;
    GRANT ALL ON SCHEMA public TO logai;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO logai;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO logai;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO logai;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO logai;
    
    \c bancai;
    GRANT ALL ON SCHEMA public TO bancai;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bancai;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bancai;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bancai;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bancai;
EOSQL

echo "Database initialization completed successfully!"
