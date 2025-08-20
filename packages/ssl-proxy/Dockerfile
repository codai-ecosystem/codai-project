# SSL Proxy Service - NGINX Configuration
FROM nginx:1.24-alpine

# Install curl and openssl for health checks and SSL certificates
RUN apk add --no-cache curl openssl

# Generate self-signed SSL certificate
RUN mkdir -p /etc/ssl/certs /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/nginx-selfsigned.key \
        -out /etc/ssl/certs/nginx-selfsigned.crt \
        -subj "/C=US/ST=CA/L=San Francisco/O=CODAI/OU=IT/CN=codai.local"

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl.conf /etc/nginx/conf.d/default.conf

# Create non-root user (nginx already exists)
RUN adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx sslproxy

# Create log directories and set permissions
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /etc/nginx && \
    chmod 600 /etc/ssl/private/nginx-selfsigned.key && \
    chmod 644 /etc/ssl/certs/nginx-selfsigned.crt

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/nginx-health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
