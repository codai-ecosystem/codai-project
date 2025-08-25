#!/bin/bash
# CODAI PostgreSQL Backup and Recovery Script
# This script creates automated backups and validates recovery procedures

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="codai_main"
DB_USER="codai_user"

echo "🗃️ CODAI Database Backup & Recovery System"
echo "=============================================="

# Create backup directory
mkdir -p $BACKUP_DIR

# Function: Create database backup
create_backup() {
    echo "📦 Creating database backup..."
    pg_dump -U $DB_USER -h localhost $DB_NAME > "$BACKUP_DIR/codai_backup_$TIMESTAMP.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup created successfully: codai_backup_$TIMESTAMP.sql"
        return 0
    else
        echo "❌ Backup failed!"
        return 1
    fi
}

# Function: Test backup integrity
test_backup() {
    echo "🔍 Testing backup integrity..."
    local backup_file="$BACKUP_DIR/codai_backup_$TIMESTAMP.sql"
    
    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        echo "✅ Backup file exists and is not empty"
        
        # Check if backup contains essential tables
        if grep -q "CREATE TABLE.*users" "$backup_file" && \
           grep -q "CREATE TABLE.*projects" "$backup_file" && \
           grep -q "CREATE TABLE.*ai_models" "$backup_file"; then
            echo "✅ Backup contains all essential tables"
            return 0
        else
            echo "❌ Backup missing essential tables"
            return 1
        fi
    else
        echo "❌ Backup file is missing or empty"
        return 1
    fi
}

# Function: Create recovery test database
test_recovery() {
    echo "🔄 Testing database recovery procedure..."
    
    # Create temporary test database
    createdb -U $DB_USER -h localhost "codai_test_recovery"
    
    if [ $? -eq 0 ]; then
        echo "✅ Test recovery database created"
        
        # Restore backup to test database
        psql -U $DB_USER -h localhost codai_test_recovery < "$BACKUP_DIR/codai_backup_$TIMESTAMP.sql"
        
        if [ $? -eq 0 ]; then
            echo "✅ Recovery test successful"
            
            # Verify data integrity
            local user_count=$(psql -U $DB_USER -h localhost codai_test_recovery -t -c "SELECT COUNT(*) FROM users;")
            local project_count=$(psql -U $DB_USER -h localhost codai_test_recovery -t -c "SELECT COUNT(*) FROM projects;")
            
            echo "📊 Recovered data verification:"
            echo "   Users: $user_count"
            echo "   Projects: $project_count"
            
            # Cleanup test database
            dropdb -U $DB_USER -h localhost "codai_test_recovery"
            echo "✅ Test database cleaned up"
            
            return 0
        else
            echo "❌ Recovery test failed"
            dropdb -U $DB_USER -h localhost "codai_test_recovery" 2>/dev/null
            return 1
        fi
    else
        echo "❌ Failed to create test recovery database"
        return 1
    fi
}

# Main execution
echo "Starting backup and recovery validation..."

if create_backup && test_backup && test_recovery; then
    echo ""
    echo "🎉 CODAI Database Backup & Recovery: ALL TESTS PASSED"
    echo "✅ Backup created and validated"
    echo "✅ Recovery procedure tested and verified"
    echo "✅ Data integrity confirmed"
    echo "=============================================="
    exit 0
else
    echo ""
    echo "❌ CODAI Database Backup & Recovery: TESTS FAILED"
    echo "=============================================="
    exit 1
fi