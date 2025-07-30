#!/bin/bash
set -e

# Create the CODAI ID database and user
createdb -U postgres codai_id
psql -U postgres -d codai_id -c "CREATE USER codai_user WITH PASSWORD '${POSTGRES_PASSWORD}';"
psql -U postgres -d codai_id -c "GRANT ALL PRIVILEGES ON DATABASE codai_id TO codai_user;"
psql -U postgres -d codai_id -c "ALTER USER codai_user CREATEDB;"

# Create extensions for enterprise features
psql -U postgres -d codai_id -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql -U postgres -d codai_id -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"
psql -U postgres -d codai_id -c "CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";"

echo "CODAI ID database initialized successfully!"
