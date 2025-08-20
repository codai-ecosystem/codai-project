/**
 * 🐳 MemorAI MCP Phase 8: Docker Configuration & Container Management
 * 
 * Docker containerization for production deployment
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const CONFIG = require('./config');

class DockerManager {
    constructor() {
        this.imageName = CONFIG.DOCKER.IMAGE_NAME;
        this.tag = CONFIG.DOCKER.TAG;
        this.registry = CONFIG.DOCKER.REGISTRY;
        this.network = CONFIG.DOCKER.NETWORK;
        this.volume = CONFIG.DOCKER.VOLUME;
    }

    async generateDockerfile() {
        const dockerfile = `# 🐳 MemorAI MCP Production Dockerfile
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache python3 make g++ git curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --production

# Multi-stage build for production
FROM node:20-alpine AS production

# Add non-root user
RUN addgroup -g 1001 -S memorai && \\
    adduser -S memorai -u 1001

# Install runtime dependencies
RUN apk add --no-cache curl tini

# Set working directory
WORKDIR /app

# Copy dependencies from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy application code
COPY --chown=memorai:memorai . .

# Create data directory
RUN mkdir -p /app/data && chown memorai:memorai /app/data

# Switch to non-root user
USER memorai

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
    CMD curl -f http://localhost:${CONFIG.PORT}/health || exit 1

# Expose port
EXPOSE ${CONFIG.PORT}

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "memorai-mcp-production-phase8.cjs"]
`;

        await fs.writeFile(path.join(__dirname, '..', 'Dockerfile'), dockerfile, 'utf8');
        console.log('✅ Dockerfile generated');
    }

    async generateDockerCompose() {
        const dockerCompose = `# 🐳 MemorAI MCP Production Docker Compose
version: '3.8'

services:
  memorai-mcp:
    build:
      context: .
      dockerfile: Dockerfile
    image: ${this.imageName}:${this.tag}
    container_name: memorai-mcp-prod
    restart: unless-stopped
    ports:
      - "${CONFIG.PORT}:${CONFIG.PORT}"
    environment:
      - NODE_ENV=production
      - MEMORAI_PROD_PORT=${CONFIG.PORT}
      - MEMORAI_API_KEY=\${MEMORAI_API_KEY}
      - LOG_LEVEL=info
    volumes:
      - ${this.volume}:/app/data
      - ./logs:/app/logs
    networks:
      - ${this.network}
    depends_on:
      - redis
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${CONFIG.PORT}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  redis:
    image: redis:7-alpine
    container_name: memorai-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - ${this.network}
    command: redis-server --appendonly yes

  postgres:
    image: postgres:15-alpine
    container_name: memorai-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=memorai
      - POSTGRES_USER=memorai
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - ${this.network}

  nginx:
    image: nginx:alpine
    container_name: memorai-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    networks:
      - ${this.network}
    depends_on:
      - memorai-mcp

volumes:
  ${this.volume}:
  redis-data:
  postgres-data:

networks:
  ${this.network}:
    driver: bridge
`;

        await fs.writeFile(path.join(__dirname, '..', 'docker-compose.yml'), dockerCompose, 'utf8');
        console.log('✅ Docker Compose file generated');
    }

    async generateNginxConfig() {
        const nginxConfig = `# 🌐 MemorAI MCP Nginx Configuration
events {
    worker_connections 1024;
}

http {
    upstream memorai_backend {
        server memorai-mcp:${CONFIG.PORT};
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name memorai.local;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name memorai.local;

        # SSL Configuration
        ssl_certificate /etc/nginx/certs/memorai.crt;
        ssl_certificate_key /etc/nginx/certs/memorai.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Proxy configuration
        location / {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://memorai_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://memorai_backend/health;
        }
    }
}
`;

        await fs.writeFile(path.join(__dirname, '..', 'nginx.conf'), nginxConfig, 'utf8');
        console.log('✅ Nginx configuration generated');
    }

    async buildImage() {
        console.log('🏗️ Building Docker image...');

        try {
            const buildCommand = `docker build -t ${this.imageName}:${this.tag} .`;
            execSync(buildCommand, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            console.log('✅ Docker image built successfully');
        } catch (error) {
            console.error('❌ Docker build failed:', error.message);
            throw error;
        }
    }

    async pushImage() {
        console.log('📤 Pushing Docker image to registry...');

        try {
            const tagCommand = `docker tag ${this.imageName}:${this.tag} ${this.registry}/${this.imageName}:${this.tag}`;
            const pushCommand = `docker push ${this.registry}/${this.imageName}:${this.tag}`;

            execSync(tagCommand, { stdio: 'inherit' });
            execSync(pushCommand, { stdio: 'inherit' });
            console.log('✅ Docker image pushed successfully');
        } catch (error) {
            console.error('❌ Docker push failed:', error.message);
            throw error;
        }
    }

    async deployStack() {
        console.log('🚀 Deploying Docker stack...');

        try {
            const deployCommand = `docker-compose up -d`;
            execSync(deployCommand, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            console.log('✅ Docker stack deployed successfully');
        } catch (error) {
            console.error('❌ Docker deployment failed:', error.message);
            throw error;
        }
    }

    async generateDockerIgnore() {
        const dockerIgnore = `# 🐳 Docker ignore file
node_modules
npm-debug.log
Dockerfile
docker-compose*.yml
.dockerignore
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.cache
.npm
.eslintcache
.node_repl_history
.npm
.lock-wscript
.wafpickle-N
.*.swp
.DS_Store
*~
.tmp
logs
*.log
pids
*.pid
*.seed
*.pid.lock
lib-cov
build/Release
jspm_packages/
typings/
.vscode
.idea
*.tgz
*.tar.gz
`;

        await fs.writeFile(path.join(__dirname, '..', '.dockerignore'), dockerIgnore, 'utf8');
        console.log('✅ .dockerignore generated');
    }
}

module.exports = DockerManager;
