#!/bin/bash
# Production deployment script for Cautai
# Handles SSL certificates, environment setup, and production deployment

set -euo pipefail

# Configuration
DOMAIN="romcp.ro"
API_DOMAIN="api.romcp.ro"
MCP_DOMAIN="mcp.romcp.ro"
DATA_DIR="/var/lib/cautai"
SSL_DIR="/etc/nginx/ssl"
BACKUP_DIR="/var/backups/cautai"
LOG_FILE="/var/log/cautai-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root for production deployment"
    fi
}

# Create necessary directories
create_directories() {
    log "Creating production directories..."
    
    mkdir -p "$DATA_DIR"/{postgres,redis,elasticsearch,backups}
    mkdir -p "$SSL_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p /var/log/cautai
    
    # Set proper permissions
    chown -R 1000:1000 "$DATA_DIR"
    chmod -R 755 "$DATA_DIR"
    chmod -R 700 "$SSL_DIR"
    
    log "Directories created successfully"
}

# Generate SSL certificates (using Let's Encrypt)
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        log "Installing certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Stop nginx if running
    systemctl stop nginx 2>/dev/null || true
    
    # Generate certificates for all domains
    for domain in "$DOMAIN" "www.$DOMAIN" "$API_DOMAIN" "$MCP_DOMAIN"; do
        log "Generating SSL certificate for $domain..."
        
        certbot certonly --standalone \
            --email admin@$DOMAIN \
            --agree-tos \
            --no-eff-email \
            -d "$domain" || warning "Failed to generate certificate for $domain"
    done
    
    # Copy certificates to nginx directory
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/$DOMAIN.crt"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/$DOMAIN.key"
    cp "/etc/letsencrypt/live/$API_DOMAIN/fullchain.pem" "$SSL_DIR/$API_DOMAIN.crt"
    cp "/etc/letsencrypt/live/$API_DOMAIN/privkey.pem" "$SSL_DIR/$API_DOMAIN.key"
    cp "/etc/letsencrypt/live/$MCP_DOMAIN/fullchain.pem" "$SSL_DIR/$MCP_DOMAIN.crt"
    cp "/etc/letsencrypt/live/$MCP_DOMAIN/privkey.pem" "$SSL_DIR/$MCP_DOMAIN.key"
    
    # Set proper permissions
    chmod 600 "$SSL_DIR"/*.key
    chmod 644 "$SSL_DIR"/*.crt
    
    log "SSL certificates configured successfully"
}

# Setup auto-renewal for SSL certificates
setup_ssl_renewal() {
    log "Setting up SSL certificate auto-renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/renew-cautai-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/romcp.ro/fullchain.pem /etc/nginx/ssl/romcp.ro.crt
cp /etc/letsencrypt/live/romcp.ro/privkey.pem /etc/nginx/ssl/romcp.ro.key
cp /etc/letsencrypt/live/api.romcp.ro/fullchain.pem /etc/nginx/ssl/api.romcp.ro.crt
cp /etc/letsencrypt/live/api.romcp.ro/privkey.pem /etc/nginx/ssl/api.romcp.ro.key
cp /etc/letsencrypt/live/mcp.romcp.ro/fullchain.pem /etc/nginx/ssl/mcp.romcp.ro.crt
cp /etc/letsencrypt/live/mcp.romcp.ro/privkey.pem /etc/nginx/ssl/mcp.romcp.ro.key
docker exec cautai-nginx nginx -s reload
EOF
    
    chmod +x /usr/local/bin/renew-cautai-ssl.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 3 * * 0 /usr/local/bin/renew-cautai-ssl.sh") | crontab -
    
    log "SSL auto-renewal configured"
}

# Setup monitoring and alerting
setup_monitoring() {
    log "Setting up monitoring and alerting..."
    
    # Install monitoring tools
    apt-get update
    apt-get install -y htop iotop nethogs fail2ban ufw
    
    # Configure fail2ban
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Configure UFW firewall
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable
    
    log "Security monitoring configured"
}

# Create backup script
setup_backup() {
    log "Setting up backup system..."
    
    cat > /usr/local/bin/backup-cautai.sh << EOF
#!/bin/bash
# Cautai backup script

BACKUP_DIR="$BACKUP_DIR"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="\$BACKUP_DIR/cautai_backup_\$DATE"

mkdir -p "\$BACKUP_PATH"

# Backup PostgreSQL
docker exec cautai-postgres pg_dumpall -U cautai > "\$BACKUP_PATH/postgres_backup.sql"

# Backup Redis
docker exec cautai-redis redis-cli --rdb /tmp/redis_backup.rdb
docker cp cautai-redis:/tmp/redis_backup.rdb "\$BACKUP_PATH/"

# Backup Elasticsearch (if running)
if docker ps | grep -q cautai-elasticsearch; then
    docker exec cautai-elasticsearch curl -X POST "localhost:9200/_snapshot/backup_repo/snapshot_\$DATE?wait_for_completion=true" || true
fi

# Backup application data
tar -czf "\$BACKUP_PATH/data_backup.tar.gz" -C "$DATA_DIR" .

# Backup SSL certificates
tar -czf "\$BACKUP_PATH/ssl_backup.tar.gz" -C "$SSL_DIR" .

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "cautai_backup_*" -mtime +30 -exec rm -rf {} \;

echo "Backup completed: \$BACKUP_PATH"
EOF
    
    chmod +x /usr/local/bin/backup-cautai.sh
    
    # Schedule daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-cautai.sh") | crontab -
    
    log "Backup system configured"
}

# Deploy application
deploy_application() {
    log "Deploying Cautai application..."
    
    # Pull latest images
    docker-compose -f docker-compose.cautai.yml -f docker-compose.cautai.prod.yml pull
    
    # Stop existing services
    docker-compose -f docker-compose.cautai.yml -f docker-compose.cautai.prod.yml down
    
    # Start services
    docker-compose -f docker-compose.cautai.yml -f docker-compose.cautai.prod.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Health check
    local healthy=0
    local total=5
    
    # Check each service
    if curl -f http://localhost/health > /dev/null 2>&1; then
        ((healthy++))
        log "✅ Web frontend healthy"
    else
        warning "❌ Web frontend unhealthy"
    fi
    
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        ((healthy++))
        log "✅ HTTP API healthy"
    else
        warning "❌ HTTP API unhealthy"
    fi
    
    if docker exec cautai-mcp-server curl -f http://localhost:3000/health > /dev/null 2>&1; then
        ((healthy++))
        log "✅ MCP server healthy"
    else
        warning "❌ MCP server unhealthy"
    fi
    
    if docker exec cautai-postgres pg_isready -U cautai > /dev/null 2>&1; then
        ((healthy++))
        log "✅ PostgreSQL healthy"
    else
        warning "❌ PostgreSQL unhealthy"
    fi
    
    if docker exec cautai-redis redis-cli ping | grep -q PONG; then
        ((healthy++))
        log "✅ Redis healthy"
    else
        warning "❌ Redis unhealthy"
    fi
    
    log "Health check: $healthy/$total services healthy"
    
    if [ $healthy -eq $total ]; then
        log "🎉 Deployment successful! All services are healthy."
    else
        warning "⚠️ Deployment completed with some issues. Check logs for details."
    fi
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    cat > /etc/logrotate.d/cautai << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}

/var/log/cautai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
    
    log "Log rotation configured"
}

# Main deployment function
main() {
    log "🚀 Starting Cautai production deployment..."
    
    check_root
    create_directories
    setup_ssl
    setup_ssl_renewal
    setup_monitoring
    setup_backup
    setup_log_rotation
    deploy_application
    
    log "🎉 Cautai production deployment completed!"
    log "🌐 Application available at: https://$DOMAIN"
    log "📡 API available at: https://$API_DOMAIN"
    log "🔌 MCP available at: wss://$MCP_DOMAIN"
    log "📊 Logs available in: /var/log/cautai/"
    log "💾 Backups stored in: $BACKUP_DIR"
    
    echo
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Update DNS records to point to this server"
    echo "2. Test all endpoints: web, API, MCP"
    echo "3. Configure monitoring dashboards"
    echo "4. Set up alerting notifications"
    echo "5. Run performance tests"
    echo
    echo -e "${BLUE}Useful commands:${NC}"
    echo "- View logs: docker-compose logs -f"
    echo "- Check status: docker-compose ps"
    echo "- Manual backup: /usr/local/bin/backup-cautai.sh"
    echo "- SSL renewal: /usr/local/bin/renew-cautai-ssl.sh"
}

# Run main function
main "$@"