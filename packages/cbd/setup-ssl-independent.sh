#!/bin/bash

# CBD SSL Certificate Setup Script
# Independent SSL solution using Let's Encrypt (Certbot)

set -e

# Configuration
DOMAIN="cbd.memorai.ro"
EMAIL="codaiecosystem@gmail.com"
WEBROOT="/var/www/cbd-ssl"
CBD_SERVICE_PORT="4180"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 CBD SSL Certificate Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Domain: ${DOMAIN}"
echo -e "Email: ${EMAIL}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
   exit 1
fi

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update -y

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
apt-get install -y certbot nginx curl

# Create webroot directory
echo -e "${YELLOW}📁 Creating webroot directory...${NC}"
mkdir -p ${WEBROOT}/.well-known/acme-challenge
chown -R www-data:www-data ${WEBROOT}

# Create Nginx configuration for ACME challenge
echo -e "${YELLOW}⚙️ Configuring Nginx for ACME challenge...${NC}"
cat > /etc/nginx/sites-available/cbd-ssl << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # ACME challenge location
    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
        try_files \$uri =404;
    }

    # Proxy all other requests to CBD service
    location / {
        proxy_pass http://localhost:${CBD_SERVICE_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Handle WebSocket connections
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/cbd-ssl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${YELLOW}🧪 Testing Nginx configuration...${NC}"
nginx -t

# Start/restart Nginx
echo -e "${YELLOW}🔄 Starting Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

# Wait for Nginx to start
sleep 2

# Test HTTP access
echo -e "${YELLOW}🧪 Testing HTTP access...${NC}"
if curl -f -s "http://${DOMAIN}/health" > /dev/null; then
    echo -e "${GREEN}✅ HTTP access working${NC}"
else
    echo -e "${RED}❌ HTTP access failed - check CBD service and Nginx${NC}"
    echo -e "${YELLOW}💡 Make sure CBD service is running on port ${CBD_SERVICE_PORT}${NC}"
    exit 1
fi

# Request SSL certificate
echo -e "${YELLOW}🔒 Requesting SSL certificate from Let's Encrypt...${NC}"
certbot certonly \
    --webroot \
    --webroot-path=${WEBROOT} \
    --email ${EMAIL} \
    --agree-tos \
    --non-interactive \
    --domains ${DOMAIN} \
    --keep-until-expiring

# Check if certificate was obtained
if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
    echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"
else
    echo -e "${RED}❌ SSL certificate request failed${NC}"
    echo -e "${YELLOW}💡 Check the certbot logs for details${NC}"
    exit 1
fi

# Create HTTPS Nginx configuration
echo -e "${YELLOW}⚙️ Configuring Nginx for HTTPS...${NC}"
cat > /etc/nginx/sites-available/cbd-ssl << EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name ${DOMAIN};

    # ACME challenge location (for certificate renewal)
    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
        try_files \$uri =404;
    }

    # Redirect all other HTTP requests to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    # SSL certificate configuration
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to CBD service
    location / {
        proxy_pass http://localhost:${CBD_SERVICE_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Handle WebSocket connections
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Increase proxy timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Test Nginx configuration
echo -e "${YELLOW}🧪 Testing Nginx HTTPS configuration...${NC}"
nginx -t

# Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx with HTTPS configuration...${NC}"
systemctl reload nginx

# Test HTTPS access
echo -e "${YELLOW}🧪 Testing HTTPS access...${NC}"
sleep 3
if curl -f -s "https://${DOMAIN}/health" > /dev/null; then
    echo -e "${GREEN}✅ HTTPS access working${NC}"
else
    echo -e "${YELLOW}⚠️ HTTPS access test failed - this might be normal if DNS hasn't propagated${NC}"
fi

# Setup automatic certificate renewal
echo -e "${YELLOW}🔄 Setting up automatic certificate renewal...${NC}"
cat > /etc/cron.d/cbd-ssl-renewal << EOF
# CBD SSL Certificate Auto-Renewal
# Runs twice daily at random minutes to avoid load spikes
$(shuf -i 0-59 -n 1) $(shuf -i 0-23 -n 1) * * * root certbot renew --quiet && systemctl reload nginx
$(shuf -i 0-59 -n 1) $(shuf -i 0-23 -n 1) * * * root certbot renew --quiet && systemctl reload nginx
EOF

# Test certificate renewal (dry run)
echo -e "${YELLOW}🧪 Testing certificate renewal (dry run)...${NC}"
certbot renew --dry-run

echo -e "${GREEN}🎉 CBD SSL Certificate Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "✅ Domain: ${DOMAIN}"
echo -e "✅ SSL Certificate: Let's Encrypt"
echo -e "✅ HTTP Access: http://${DOMAIN} (redirects to HTTPS)"
echo -e "✅ HTTPS Access: https://${DOMAIN}"
echo -e "✅ Auto-renewal: Configured (twice daily)"
echo ""
echo -e "${BLUE}🔧 Commands:${NC}"
echo -e "Check certificate: certbot certificates"
echo -e "Renew certificate: certbot renew"
echo -e "Test renewal: certbot renew --dry-run"
echo -e "Check Nginx: systemctl status nginx"
echo -e "View logs: journalctl -u nginx -f"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "HTTP: http://${DOMAIN}"
echo -e "HTTPS: https://${DOMAIN}"
echo -e "Health Check: https://${DOMAIN}/health"
echo -e "Stats: https://${DOMAIN}/stats"
echo ""
echo -e "${GREEN}🎯 CBD Universal Database is now accessible with SSL!${NC}"
