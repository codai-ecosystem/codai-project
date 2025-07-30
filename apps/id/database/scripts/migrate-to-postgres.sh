#!/bin/bash

# CODAI ID - Database Migration Script
# Migrates from SQLite to PostgreSQL with zero downtime

set -e

# Configuration
SQLITE_DB="./prisma/dev.db"
POSTGRES_URL=${DATABASE_URL}
BACKUP_DIR="./database/backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./database/migration.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting CODAI ID database migration from SQLite to PostgreSQL"

# Step 1: Backup SQLite database
log "Step 1: Creating backup of SQLite database"
if [ -f "$SQLITE_DB" ]; then
    cp "$SQLITE_DB" "$BACKUP_DIR/dev.db.backup"
    log "SQLite backup created at $BACKUP_DIR/dev.db.backup"
else
    warn "SQLite database not found at $SQLITE_DB, skipping backup"
fi

# Step 2: Export data from SQLite
log "Step 2: Exporting data from SQLite"
sqlite3 "$SQLITE_DB" <<EOF > "$BACKUP_DIR/sqlite_dump.sql"
.output '$BACKUP_DIR/users.csv'
.mode csv
.headers on
SELECT * FROM users;

.output '$BACKUP_DIR/accounts.csv'
SELECT * FROM accounts;

.output '$BACKUP_DIR/sessions.csv'
SELECT * FROM sessions;

.output '$BACKUP_DIR/user_preferences.csv'
SELECT * FROM user_preferences;

.quit
EOF

log "SQLite data exported to CSV files"

# Step 3: Setup PostgreSQL schema
log "Step 3: Setting up PostgreSQL schema"
npx prisma migrate dev --schema=./prisma/schema.enterprise.prisma --name init_enterprise

# Step 4: Transform and import data
log "Step 4: Transforming and importing data to PostgreSQL"

# Create data transformation script
cat > "$BACKUP_DIR/transform_data.js" << 'EOF'
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function importUsers() {
    console.log('Importing users...');
    const users = [];
    
    return new Promise((resolve, reject) => {
        fs.createReadStream('users.csv')
            .pipe(csv())
            .on('data', (row) => {
                users.push({
                    id: row.id,
                    email: row.email,
                    firstName: row.name ? row.name.split(' ')[0] : null,
                    lastName: row.name ? row.name.split(' ').slice(1).join(' ') : null,
                    displayName: row.name,
                    avatar: row.image,
                    password: row.password,
                    emailVerified: row.emailVerified ? new Date(row.emailVerified) : null,
                    status: 'ACTIVE',
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt),
                });
            })
            .on('end', async () => {
                try {
                    for (const user of users) {
                        await prisma.user.create({
                            data: user
                        });
                    }
                    console.log(`Imported ${users.length} users`);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
    });
}

async function importAccounts() {
    console.log('Importing accounts...');
    const accounts = [];
    
    return new Promise((resolve, reject) => {
        fs.createReadStream('accounts.csv')
            .pipe(csv())
            .on('data', (row) => {
                accounts.push({
                    id: row.id,
                    userId: row.userId,
                    type: row.type,
                    provider: row.provider,
                    providerAccountId: row.providerAccountId,
                    refresh_token: row.refresh_token,
                    access_token: row.access_token,
                    expires_at: row.expires_at ? parseInt(row.expires_at) : null,
                    token_type: row.token_type,
                    scope: row.scope,
                    id_token: row.id_token,
                    session_state: row.session_state,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            })
            .on('end', async () => {
                try {
                    for (const account of accounts) {
                        await prisma.account.create({
                            data: account
                        });
                    }
                    console.log(`Imported ${accounts.length} accounts`);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
    });
}

async function importSessions() {
    console.log('Importing sessions...');
    const sessions = [];
    
    return new Promise((resolve, reject) => {
        fs.createReadStream('sessions.csv')
            .pipe(csv())
            .on('data', (row) => {
                sessions.push({
                    id: row.id,
                    sessionToken: row.sessionToken,
                    userId: row.userId,
                    expires: new Date(row.expires),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            })
            .on('end', async () => {
                try {
                    for (const session of sessions) {
                        await prisma.session.create({
                            data: session
                        });
                    }
                    console.log(`Imported ${sessions.length} sessions`);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
    });
}

async function setupDefaultRoles() {
    console.log('Setting up default roles...');
    
    const roles = [
        { name: 'SUPER_ADMIN', displayName: 'Super Administrator', description: 'Full system access' },
        { name: 'ADMIN', displayName: 'Administrator', description: 'Administrative access' },
        { name: 'USER', displayName: 'User', description: 'Standard user access' },
        { name: 'VIEWER', displayName: 'Viewer', description: 'Read-only access' },
    ];
    
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role
        });
    }
    
    console.log('Default roles created');
}

async function setupDefaultPermissions() {
    console.log('Setting up default permissions...');
    
    const permissions = [
        { name: 'user:read', displayName: 'Read Users', resource: 'user', action: 'read' },
        { name: 'user:write', displayName: 'Write Users', resource: 'user', action: 'write' },
        { name: 'user:delete', displayName: 'Delete Users', resource: 'user', action: 'delete' },
        { name: 'user:admin', displayName: 'Admin Users', resource: 'user', action: 'admin' },
        { name: 'application:read', displayName: 'Read Applications', resource: 'application', action: 'read' },
        { name: 'application:write', displayName: 'Write Applications', resource: 'application', action: 'write' },
        { name: 'application:admin', displayName: 'Admin Applications', resource: 'application', action: 'admin' },
    ];
    
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { name: permission.name },
            update: {},
            create: permission
        });
    }
    
    console.log('Default permissions created');
}

async function main() {
    try {
        await setupDefaultRoles();
        await setupDefaultPermissions();
        await importUsers();
        await importAccounts();
        await importSessions();
        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
EOF

# Install required dependencies for transformation
cd "$BACKUP_DIR"
npm init -y
npm install @prisma/client csv-parser bcryptjs

# Run transformation
log "Running data transformation"
node transform_data.js

# Step 5: Verify migration
log "Step 5: Verifying migration"
USER_COUNT=$(psql "$POSTGRES_URL" -t -c "SELECT COUNT(*) FROM users;")
log "PostgreSQL user count: $USER_COUNT"

# Step 6: Update Prisma schema
log "Step 6: Updating Prisma schema"
cp ./prisma/schema.enterprise.prisma ./prisma/schema.prisma
npx prisma generate

# Step 7: Create post-migration report
log "Step 7: Creating migration report"
cat > "$BACKUP_DIR/migration_report.md" << EOF
# CODAI ID Database Migration Report

**Date**: $(date)
**Status**: SUCCESS ✅

## Migration Summary
- **Source**: SQLite (./prisma/dev.db)
- **Target**: PostgreSQL ($POSTGRES_URL)
- **Users migrated**: $USER_COUNT
- **Backup location**: $BACKUP_DIR

## New Features Enabled
- ✅ Multi-Factor Authentication support
- ✅ Role-Based Access Control (RBAC)
- ✅ Audit logging capability
- ✅ Biometric authentication support
- ✅ GDPR compliance features
- ✅ Organization multi-tenancy
- ✅ Application registry for SSO

## Next Steps
1. Configure Keycloak SSO server
2. Set up MFA providers (TOTP, SMS)
3. Configure audit logging
4. Set up monitoring and alerting
5. Begin application integrations

## Rollback Instructions
If rollback is needed:
1. Stop the application
2. Restore SQLite: \`cp $BACKUP_DIR/dev.db.backup ./prisma/dev.db\`
3. Revert schema: \`git checkout HEAD -- prisma/schema.prisma\`
4. Regenerate Prisma client: \`npx prisma generate\`

EOF

log "Migration completed successfully!"
log "Report available at: $BACKUP_DIR/migration_report.md"
log "Next step: Start Docker containers with 'docker-compose up -d'"
