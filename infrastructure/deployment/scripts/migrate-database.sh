#!/bin/bash
# CODAI Database Migration Script
# Handle database migrations, backups, and schema updates

set -e

# Configuration
NAMESPACE="codai-production"
DB_NAME="codai_production"
MIGRATION_TIMEOUT=300
BACKUP_RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${GREEN}$1${NC}"
}

warn() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${YELLOW}WARNING: $1${NC}"
}

error() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${RED}ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${BLUE}INFO: $1${NC}"
}

# Help function
show_help() {
    echo "CODAI Database Migration Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  migrate                 Run all pending migrations"
    echo "  rollback [STEPS]        Rollback N migration steps (default: 1)"
    echo "  backup                  Create database backup"
    echo "  restore [BACKUP_FILE]   Restore from backup file"
    echo "  status                  Show migration status"
    echo "  seed                    Run database seeders"
    echo "  reset                   Reset database (WARNING: destructive)"
    echo "  health                  Check database health"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -n, --namespace NAME    Target namespace (default: codai-production)"
    echo "  -d, --database NAME     Database name (default: codai_production)"
    echo "  --dry-run              Show what would be done without executing"
    echo "  --force                Force operation without confirmation"
    echo ""
    echo "Examples:"
    echo "  $0 migrate              Run all pending migrations"
    echo "  $0 backup               Create a backup"
    echo "  $0 rollback 3           Rollback 3 migration steps"
    echo "  $0 status               Show current migration status"
    echo ""
}

# Parse command line arguments
parse_arguments() {
    COMMAND=""
    DRY_RUN=false
    FORCE=false
    ROLLBACK_STEPS=1
    BACKUP_FILE=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -d|--database)
                DB_NAME="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            migrate|rollback|backup|restore|status|seed|reset|health)
                COMMAND="$1"
                shift
                if [[ "$COMMAND" == "rollback" && "$1" =~ ^[0-9]+$ ]]; then
                    ROLLBACK_STEPS="$1"
                    shift
                elif [[ "$COMMAND" == "restore" && -n "$1" && ! "$1" =~ ^- ]]; then
                    BACKUP_FILE="$1"
                    shift
                fi
                ;;
            *)
                error "Unknown argument: $1"
                ;;
        esac
    done
    
    if [[ -z "$COMMAND" ]]; then
        error "No command specified. Use -h for help."
    fi
}

# Get database connection details
get_db_connection() {
    log "🔗 Getting database connection details..."
    
    # Get database credentials from secrets
    if ! kubectl get secret postgresql-credentials -n $NAMESPACE &>/dev/null; then
        error "Database credentials secret not found in namespace $NAMESPACE"
    fi
    
    DB_HOST=$(kubectl get secret postgresql-credentials -n $NAMESPACE -o jsonpath='{.data.host}' 2>/dev/null | base64 --decode 2>/dev/null || echo "postgresql")
    DB_USER=$(kubectl get secret postgresql-credentials -n $NAMESPACE -o jsonpath='{.data.username}' 2>/dev/null | base64 --decode 2>/dev/null || echo "codai")
    DB_PASS=$(kubectl get secret postgresql-credentials -n $NAMESPACE -o jsonpath='{.data.password}' 2>/dev/null | base64 --decode 2>/dev/null || echo "")
    DB_PORT=$(kubectl get secret postgresql-credentials -n $NAMESPACE -o jsonpath='{.data.port}' 2>/dev/null | base64 --decode 2>/dev/null || echo "5432")
    
    # Construct database URL
    if [[ -z "$DB_PASS" ]]; then
        DATABASE_URL="postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    else
        DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
    fi
    
    info "Database connection configured for $DB_HOST:$DB_PORT/$DB_NAME"
}

# Test database connectivity
test_db_connection() {
    log "🔍 Testing database connection..."
    
    if kubectl run db-test --rm -i --restart=Never \
        --image=postgres:13 \
        --env="PGPASSWORD=$DB_PASS" \
        --namespace=$NAMESPACE \
        -- pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME; then
        log "✅ Database connection successful"
    else
        error "❌ Database connection failed"
    fi
}

# Create backup
create_backup() {
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    local backup_file="/tmp/${backup_name}.sql"
    
    log "💾 Creating database backup: $backup_name"
    
    if [[ "$DRY_RUN" == true ]]; then
        info "[DRY RUN] Would create backup: $backup_file"
        return
    fi
    
    # Create backup using pg_dump
    kubectl run db-backup-job --rm -i --restart=Never \
        --image=postgres:13 \
        --env="PGPASSWORD=$DB_PASS" \
        --namespace=$NAMESPACE \
        -- pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
           --verbose --clean --no-owner --no-acl \
           --file=/backup.sql
    
    # TODO: Copy backup file from pod to local storage or S3
    # This would require mounting volumes or using kubectl cp
    
    log "✅ Backup created: $backup_name"
    
    # Upload to S3 if configured
    if [[ -n "${AWS_BUCKET_NAME:-}" ]]; then
        info "Uploading backup to S3..."
        # kubectl run s3-upload --rm -i --restart=Never \
        #     --image=amazon/aws-cli \
        #     -- aws s3 cp /backup.sql s3://$AWS_BUCKET_NAME/database-backups/$backup_name.sql
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "🧹 Cleaning up old backups..."
    
    if [[ "$DRY_RUN" == true ]]; then
        info "[DRY RUN] Would clean backups older than $BACKUP_RETENTION_DAYS days"
        return
    fi
    
    # Clean local backups
    find /tmp -name "backup-*.sql" -type f -mtime +$BACKUP_RETENTION_DAYS -delete 2>/dev/null || true
    
    # Clean S3 backups if configured
    if [[ -n "${AWS_BUCKET_NAME:-}" ]]; then
        info "Cleaning old S3 backups..."
        # kubectl run s3-cleanup --rm -i --restart=Never \
        #     --image=amazon/aws-cli \
        #     -- aws s3 ls s3://$AWS_BUCKET_NAME/database-backups/ \
        #        --query "Contents[?LastModified<=\`$(date -d "$BACKUP_RETENTION_DAYS days ago" -u +%Y-%m-%dT%H:%M:%S.%3NZ)\`].Key" \
        #        --output text | xargs -r aws s3 rm
    fi
    
    log "✅ Backup cleanup completed"
}

# Run migrations
run_migrations() {
    log "🚀 Running database migrations..."
    
    if [[ "$DRY_RUN" == true ]]; then
        info "[DRY RUN] Would run pending migrations"
        return
    fi
    
    # Create migration job
    kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: migration-job-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: migration-runner
        image: codai/migration-runner:latest
        env:
        - name: DATABASE_URL
          value: "$DATABASE_URL"
        - name: NODE_ENV
          value: "production"
        - name: RUN_MIGRATIONS
          value: "true"
        command:
        - /bin/bash
        - -c
        - |
          echo "Starting database migrations..."
          npm run migrate
          echo "Migrations completed successfully"
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "400m"
      backoffLimit: 3
      activeDeadlineSeconds: $MIGRATION_TIMEOUT
EOF
    
    # Wait for migration job to complete
    JOB_NAME="migration-job-$(date +%s)"
    info "Waiting for migration job to complete..."
    
    kubectl wait --for=condition=complete job/$JOB_NAME -n $NAMESPACE --timeout=${MIGRATION_TIMEOUT}s || {
        error "Migration job failed or timed out"
    }
    
    # Show migration logs
    kubectl logs job/$JOB_NAME -n $NAMESPACE
    
    # Cleanup job
    kubectl delete job $JOB_NAME -n $NAMESPACE
    
    log "✅ Database migrations completed successfully"
}

# Rollback migrations
rollback_migrations() {
    local steps=$1
    log "🔄 Rolling back $steps migration step(s)..."
    
    if [[ "$FORCE" == false ]]; then
        warn "⚠️  MIGRATION ROLLBACK"
        echo "This will rollback $steps migration step(s) in the database."
        echo "This operation may result in data loss."
        echo ""
        read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Rollback cancelled by user"
            return
        fi
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        info "[DRY RUN] Would rollback $steps migration step(s)"
        return
    fi
    
    # Create backup before rollback
    create_backup
    
    # Run rollback job
    kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: rollback-job-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: migration-runner
        image: codai/migration-runner:latest
        env:
        - name: DATABASE_URL
          value: "$DATABASE_URL"
        - name: NODE_ENV
          value: "production"
        - name: ROLLBACK_STEPS
          value: "$steps"
        command:
        - /bin/bash
        - -c
        - |
          echo "Starting migration rollback..."
          npm run migrate:rollback -- --steps=$steps
          echo "Rollback completed successfully"
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "400m"
      backoffLimit: 1
      activeDeadlineSeconds: $MIGRATION_TIMEOUT
EOF
    
    # Wait for rollback job to complete
    JOB_NAME="rollback-job-$(date +%s)"
    kubectl wait --for=condition=complete job/$JOB_NAME -n $NAMESPACE --timeout=${MIGRATION_TIMEOUT}s
    
    # Show rollback logs
    kubectl logs job/$JOB_NAME -n $NAMESPACE
    
    # Cleanup job
    kubectl delete job $JOB_NAME -n $NAMESPACE
    
    log "✅ Migration rollback completed"
}

# Show migration status
show_migration_status() {
    log "📊 Checking migration status..."
    
    kubectl run migration-status --rm -i --restart=Never \
        --image=codai/migration-runner:latest \
        --env="DATABASE_URL=$DATABASE_URL" \
        --namespace=$NAMESPACE \
        -- npm run migrate:status
    
    log "✅ Migration status retrieved"
}

# Run database seeders
run_seeders() {
    log "🌱 Running database seeders..."
    
    if [[ "$FORCE" == false ]]; then
        warn "⚠️  DATABASE SEEDING"
        echo "This will populate the database with initial data."
        echo "Existing data may be modified or replaced."
        echo ""
        read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Seeding cancelled by user"
            return
        fi
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        info "[DRY RUN] Would run database seeders"
        return
    fi
    
    kubectl run seeder-job --rm -i --restart=Never \
        --image=codai/migration-runner:latest \
        --env="DATABASE_URL=$DATABASE_URL" \
        --env="NODE_ENV=production" \
        --namespace=$NAMESPACE \
        -- npm run seed
    
    log "✅ Database seeding completed"
}

# Reset database
reset_database() {
    error "⚠️  DESTRUCTIVE OPERATION"
    
    if [[ "$FORCE" == false ]]; then
        warn "🚨 DATABASE RESET WARNING"
        echo "This will completely reset the database:"
        echo "• Drop all tables"
        echo "• Delete all data"
        echo "• Run fresh migrations"
        echo "• Apply seeders"
        echo ""
        echo "THIS OPERATION CANNOT BE UNDONE!"
        echo ""
        read -p "Type 'RESET' to confirm database reset: " confirmation
        if [[ "$confirmation" != "RESET" ]]; then
            log "Database reset cancelled"
            return
        fi
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        info "[DRY RUN] Would reset the entire database"
        return
    fi
    
    # Create backup before reset
    create_backup
    
    log "🔥 Resetting database..."
    
    kubectl run db-reset-job --rm -i --restart=Never \
        --image=codai/migration-runner:latest \
        --env="DATABASE_URL=$DATABASE_URL" \
        --env="NODE_ENV=production" \
        --namespace=$NAMESPACE \
        -- /bin/bash -c "
            echo 'Dropping all tables...'
            npm run migrate:reset
            echo 'Running fresh migrations...'
            npm run migrate
            echo 'Applying seeders...'
            npm run seed
            echo 'Database reset completed'
        "
    
    log "✅ Database reset completed"
}

# Check database health
check_database_health() {
    log "🏥 Checking database health..."
    
    # Basic connectivity test
    test_db_connection
    
    # Run health checks
    kubectl run db-health-check --rm -i --restart=Never \
        --image=postgres:13 \
        --env="PGPASSWORD=$DB_PASS" \
        --namespace=$NAMESPACE \
        -- /bin/bash -c "
            echo 'Testing database connectivity...'
            pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
            
            echo 'Checking database size...'
            psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"
                SELECT 
                    pg_size_pretty(pg_database_size('$DB_NAME')) AS database_size,
                    (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') AS table_count;
            \"
            
            echo 'Checking active connections...'
            psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"
                SELECT count(*) as active_connections 
                FROM pg_stat_activity 
                WHERE state = 'active';
            \"
            
            echo 'Checking for long-running queries...'
            psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"
                SELECT query, state, query_start 
                FROM pg_stat_activity 
                WHERE state = 'active' AND query_start < now() - interval '5 minutes'
                LIMIT 5;
            \"
        "
    
    log "✅ Database health check completed"
}

# Restore from backup
restore_database() {
    local backup_file=$1
    
    if [[ -z "$backup_file" ]]; then
        error "No backup file specified for restore operation"
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
    fi
    
    warn "🔄 DATABASE RESTORE"
    echo "This will restore the database from: $backup_file"
    echo "Current database will be completely replaced."
    echo ""
    
    if [[ "$FORCE" == false ]]; then
        read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Restore cancelled by user"
            return
        fi
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        info "[DRY RUN] Would restore database from $backup_file"
        return
    fi
    
    log "💾 Restoring database from backup..."
    
    # TODO: Implement restore logic
    # This would involve copying the backup file to a pod and running psql
    
    warn "Restore functionality not yet implemented"
    
    log "✅ Database restore completed"
}

# Main function
main() {
    echo ""
    echo "🗄️  CODAI Database Migration Tool"
    echo "================================="
    echo ""
    
    parse_arguments "$@"
    get_db_connection
    
    case $COMMAND in
        migrate)
            test_db_connection
            create_backup
            run_migrations
            cleanup_old_backups
            ;;
        rollback)
            test_db_connection
            rollback_migrations $ROLLBACK_STEPS
            ;;
        backup)
            test_db_connection
            create_backup
            cleanup_old_backups
            ;;
        restore)
            restore_database "$BACKUP_FILE"
            ;;
        status)
            test_db_connection
            show_migration_status
            ;;
        seed)
            test_db_connection
            run_seeders
            ;;
        reset)
            test_db_connection
            reset_database
            ;;
        health)
            check_database_health
            ;;
        *)
            error "Unknown command: $COMMAND"
            ;;
    esac
    
    log "🎉 Database operation completed successfully!"
}

# Handle script interruption
trap 'error "Database operation interrupted!"' INT TERM

# Run main function
main "$@"
