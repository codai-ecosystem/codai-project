/**
 * Deployment Configuration and Scripts
 * Production-ready deployment configuration for CBD Universal Database
 */

import { promises as fs } from 'fs';
import path from 'path';

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  database: {
    host: string;
    port: number;
    ssl: boolean;
    pool_size: number;
  };
  security: {
    cors_origins: string[];
    rate_limit: {
      window_ms: number;
      max_requests: number;
    };
    api_keys: boolean;
    jwt_secret?: string;
  };
  performance: {
    cache_size: number;
    vector_index_size: number;
    connection_pool_size: number;
  };
  monitoring: {
    enabled: boolean;
    metrics_endpoint: string;
    health_check_interval: number;
  };
  scaling: {
    replicas: number;
    auto_scaling: boolean;
    max_replicas: number;
    cpu_threshold: number;
    memory_threshold: number;
  };
}

/**
 * Deployment Manager
 * Handles all deployment-related operations
 */
export class DeploymentManager {
  private config: DeploymentConfig;
  private deploymentPath: string;

  constructor(environment: 'development' | 'staging' | 'production' = 'production') {
    this.config = this.getEnvironmentConfig(environment);
    this.deploymentPath = path.join(process.cwd(), 'deployment');
  }

  /**
   * Get environment-specific configuration
   */
  private getEnvironmentConfig(environment: string): DeploymentConfig {
    const baseConfig: DeploymentConfig = {
      environment: environment as any,
      database: {
        host: process.env.CBD_HOST || 'localhost',
        port: parseInt(process.env.CBD_PORT || '4180'),
        ssl: environment === 'production',
        pool_size: environment === 'production' ? 20 : 10
      },
      security: {
        cors_origins: environment === 'production'
          ? [process.env.ALLOWED_ORIGINS || 'https://yourapp.com']
          : ['http://localhost:3000', 'http://localhost:3001'],
        rate_limit: {
          window_ms: 15 * 60 * 1000, // 15 minutes
          max_requests: environment === 'production' ? 100 : 1000
        },
        api_keys: true,
        jwt_secret: process.env.JWT_SECRET
      },
      performance: {
        cache_size: environment === 'production' ? 1000 : 100,
        vector_index_size: environment === 'production' ? 10000 : 1000,
        connection_pool_size: environment === 'production' ? 50 : 10
      },
      monitoring: {
        enabled: true,
        metrics_endpoint: '/metrics',
        health_check_interval: 30000
      },
      scaling: {
        replicas: environment === 'production' ? 3 : 1,
        auto_scaling: environment === 'production',
        max_replicas: 10,
        cpu_threshold: 70,
        memory_threshold: 80
      }
    };

    return baseConfig;
  }

  /**
   * Prepare deployment artifacts
   */
  async prepareDeployment(): Promise<void> {
    console.log('🚀 Preparing deployment artifacts...');

    try {
      // Create deployment directory
      await fs.mkdir(this.deploymentPath, { recursive: true });

      // Generate configuration files
      await this.generateConfigFiles();

      // Generate Docker files
      await this.generateDockerFiles();

      // Generate Kubernetes manifests
      await this.generateKubernetesManifests();

      // Generate deployment scripts
      await this.generateDeploymentScripts();

      // Generate monitoring configuration
      await this.generateMonitoringConfig();

      console.log('✅ Deployment artifacts prepared successfully');
    } catch (error) {
      console.error('❌ Failed to prepare deployment:', error);
      throw error;
    }
  }

  /**
   * Generate configuration files
   */
  private async generateConfigFiles(): Promise<void> {
    console.log('📝 Generating configuration files...');

    // Production environment configuration
    const envConfig = `
# CBD Universal Database Production Configuration
NODE_ENV=${this.config.environment}
CBD_HOST=${this.config.database.host}
CBD_PORT=${this.config.database.port}
CBD_SSL=${this.config.database.ssl}
CBD_POOL_SIZE=${this.config.database.pool_size}

# Security Configuration
CORS_ORIGINS=${this.config.security.cors_origins.join(',')}
RATE_LIMIT_WINDOW=${this.config.security.rate_limit.window_ms}
RATE_LIMIT_MAX=${this.config.security.rate_limit.max_requests}
API_KEYS_ENABLED=${this.config.security.api_keys}
JWT_SECRET=${this.config.security.jwt_secret || 'your-secret-key'}

# Performance Configuration
CACHE_SIZE=${this.config.performance.cache_size}
VECTOR_INDEX_SIZE=${this.config.performance.vector_index_size}
CONNECTION_POOL_SIZE=${this.config.performance.connection_pool_size}

# Monitoring Configuration
MONITORING_ENABLED=${this.config.monitoring.enabled}
METRICS_ENDPOINT=${this.config.monitoring.metrics_endpoint}
HEALTH_CHECK_INTERVAL=${this.config.monitoring.health_check_interval}

# OpenAI Configuration (Required for vector embeddings)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=text-embedding-3-small
`;

    await fs.writeFile(
      path.join(this.deploymentPath, '.env.production'),
      envConfig.trim()
    );

    // Application configuration
    const appConfig = {
      name: 'CBD Universal Database',
      version: '1.0.0',
      ...this.config
    };

    await fs.writeFile(
      path.join(this.deploymentPath, 'config.json'),
      JSON.stringify(appConfig, null, 2)
    );
  }

  /**
   * Generate Docker files
   */
  private async generateDockerFiles(): Promise<void> {
    console.log('🐳 Generating Docker files...');

    // Multi-stage Dockerfile for production
    const dockerfile = `
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install pnpm
RUN corepack enable pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S cbd -u 1001

# Set ownership
RUN chown -R cbd:nodejs /app
USER cbd

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD node -e "require('http').get('http://localhost:4180/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 4180

# Start application
CMD ["node", "dist/src/service.js"]
`;

    await fs.writeFile(
      path.join(this.deploymentPath, 'Dockerfile'),
      dockerfile.trim()
    );

    // Docker Compose for development and staging
    const dockerCompose = `
version: '3.8'

services:
  cbd-database:
    build:
      context: ..
      dockerfile: deployment/Dockerfile
    ports:
      - "4180:4180"
    environment:
      - NODE_ENV=${this.config.environment}
      - CBD_HOST=0.0.0.0
      - CBD_PORT=4180
    env_file:
      - .env.${this.config.environment}
    volumes:
      - cbd-data:/app/data
      - cbd-logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4180/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cbd.rule=PathPrefix(/api/cbd)"
      - "traefik.http.services.cbd.loadbalancer.server.port=4180"

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

  # Optional: Monitoring with Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    restart: unless-stopped

volumes:
  cbd-data:
  cbd-logs:
  redis-data:
  prometheus-data:

networks:
  default:
    name: codai-network
`;

    await fs.writeFile(
      path.join(this.deploymentPath, 'docker-compose.yml'),
      dockerCompose.trim()
    );

    // .dockerignore
    const dockerignore = `
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.*
coverage
test-results
*.test.ts
*.spec.ts
tests/
`;

    await fs.writeFile(
      path.join(this.deploymentPath, '.dockerignore'),
      dockerignore.trim()
    );
  }

  /**
   * Generate Kubernetes manifests
   */
  private async generateKubernetesManifests(): Promise<void> {
    console.log('☸️ Generating Kubernetes manifests...');

    const k8sDir = path.join(this.deploymentPath, 'k8s');
    await fs.mkdir(k8sDir, { recursive: true });

    // Namespace
    const namespace = `
apiVersion: v1
kind: Namespace
metadata:
  name: codai
  labels:
    name: codai
`;

    await fs.writeFile(path.join(k8sDir, '01-namespace.yaml'), namespace.trim());

    // ConfigMap
    const configMap = `
apiVersion: v1
kind: ConfigMap
metadata:
  name: cbd-config
  namespace: codai
data:
  NODE_ENV: "${this.config.environment}"
  CBD_HOST: "0.0.0.0"
  CBD_PORT: "4180"
  CACHE_SIZE: "${this.config.performance.cache_size}"
  MONITORING_ENABLED: "${this.config.monitoring.enabled}"
`;

    await fs.writeFile(path.join(k8sDir, '02-configmap.yaml'), configMap.trim());

    // Secret
    const secret = `
apiVersion: v1
kind: Secret
metadata:
  name: cbd-secrets
  namespace: codai
type: Opaque
stringData:
  OPENAI_API_KEY: "your-openai-api-key-here"
  JWT_SECRET: "your-jwt-secret-here"
`;

    await fs.writeFile(path.join(k8sDir, '03-secret.yaml'), secret.trim());

    // Deployment
    const deployment = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cbd-database
  namespace: codai
  labels:
    app: cbd-database
spec:
  replicas: ${this.config.scaling.replicas}
  selector:
    matchLabels:
      app: cbd-database
  template:
    metadata:
      labels:
        app: cbd-database
    spec:
      containers:
      - name: cbd-database
        image: cbd-database:latest
        ports:
        - containerPort: 4180
        envFrom:
        - configMapRef:
            name: cbd-config
        - secretRef:
            name: cbd-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4180
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4180
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: data-volume
          mountPath: /app/data
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: cbd-data-pvc
`;

    await fs.writeFile(path.join(k8sDir, '04-deployment.yaml'), deployment.trim());

    // Service
    const service = `
apiVersion: v1
kind: Service
metadata:
  name: cbd-database-service
  namespace: codai
  labels:
    app: cbd-database
spec:
  selector:
    app: cbd-database
  ports:
  - protocol: TCP
    port: 4180
    targetPort: 4180
  type: ClusterIP
`;

    await fs.writeFile(path.join(k8sDir, '05-service.yaml'), service.trim());

    // Ingress
    const ingress = `
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cbd-database-ingress
  namespace: codai
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.yourapp.com
    secretName: cbd-tls
  rules:
  - host: api.yourapp.com
    http:
      paths:
      - path: /api/cbd
        pathType: Prefix
        backend:
          service:
            name: cbd-database-service
            port:
              number: 4180
`;

    await fs.writeFile(path.join(k8sDir, '06-ingress.yaml'), ingress.trim());

    // PersistentVolumeClaim
    const pvc = `
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cbd-data-pvc
  namespace: codai
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
`;

    await fs.writeFile(path.join(k8sDir, '07-pvc.yaml'), pvc.trim());

    // HorizontalPodAutoscaler
    if (this.config.scaling.auto_scaling) {
      const hpa = `
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cbd-database-hpa
  namespace: codai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cbd-database
  minReplicas: ${this.config.scaling.replicas}
  maxReplicas: ${this.config.scaling.max_replicas}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: ${this.config.scaling.cpu_threshold}
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: ${this.config.scaling.memory_threshold}
`;

      await fs.writeFile(path.join(k8sDir, '08-hpa.yaml'), hpa.trim());
    }
  }

  /**
   * Generate deployment scripts
   */
  private async generateDeploymentScripts(): Promise<void> {
    console.log('📜 Generating deployment scripts...');

    const scriptsDir = path.join(this.deploymentPath, 'scripts');
    await fs.mkdir(scriptsDir, { recursive: true });

    // Build script
    const buildScript = `#!/bin/bash
set -e

echo "🔨 Building CBD Universal Database..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run tests
echo "🧪 Running tests..."
pnpm test

# Build application
echo "🏗️ Building application..."
pnpm build

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t cbd-database:latest -f deployment/Dockerfile .

echo "✅ Build completed successfully!"
`;

    await fs.writeFile(path.join(scriptsDir, 'build.sh'), buildScript.trim());

    // Deploy script
    const deployScript = `#!/bin/bash
set -e

ENVIRONMENT=\${1:-production}
NAMESPACE=\${2:-codai}

echo "🚀 Deploying CBD Universal Database to \$ENVIRONMENT..."

# Validate environment
if [[ "\$ENVIRONMENT" != "staging" && "\$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Apply Kubernetes manifests
echo "☸️ Applying Kubernetes manifests..."
kubectl apply -f deployment/k8s/

# Wait for deployment
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/cbd-database -n \$NAMESPACE --timeout=300s

# Verify deployment
echo "✅ Verifying deployment..."
kubectl get pods -n \$NAMESPACE -l app=cbd-database

# Run health check
echo "🏥 Running health check..."
kubectl port-forward -n \$NAMESPACE svc/cbd-database-service 4180:4180 &
PF_PID=\$!
sleep 5

if curl -f http://localhost:4180/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    kill \$PF_PID
    exit 1
fi

kill \$PF_PID
echo "🎉 Deployment completed successfully!"
`;

    await fs.writeFile(path.join(scriptsDir, 'deploy.sh'), deployScript.trim());

    // Rollback script
    const rollbackScript = `#!/bin/bash
set -e

NAMESPACE=\${1:-codai}

echo "🔄 Rolling back CBD Universal Database deployment..."

kubectl rollout undo deployment/cbd-database -n \$NAMESPACE

echo "⏳ Waiting for rollback to complete..."
kubectl rollout status deployment/cbd-database -n \$NAMESPACE --timeout=300s

echo "✅ Rollback completed successfully!"
`;

    await fs.writeFile(path.join(scriptsDir, 'rollback.sh'), rollbackScript.trim());

    // Make scripts executable
    const scripts = ['build.sh', 'deploy.sh', 'rollback.sh'];
    for (const script of scripts) {
      await fs.chmod(path.join(scriptsDir, script), 0o755);
    }
  }

  /**
   * Generate monitoring configuration
   */
  private async generateMonitoringConfig(): Promise<void> {
    console.log('📊 Generating monitoring configuration...');

    // Prometheus configuration
    const prometheusConfig = `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'cbd-database'
    static_configs:
      - targets: ['cbd-database-service:4180']
    metrics_path: '/metrics'
    scrape_interval: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
`;

    await fs.writeFile(
      path.join(this.deploymentPath, 'prometheus.yml'),
      prometheusConfig.trim()
    );

    // Alert rules
    const alertRules = `
groups:
  - name: cbd-database
    rules:
      - alert: CBDDatabaseDown
        expr: up{job="cbd-database"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CBD Database is down"
          description: "CBD Database has been down for more than 1 minute"

      - alert: CBDHighMemoryUsage
        expr: (cbd_memory_usage_bytes / cbd_memory_limit_bytes) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CBD Database high memory usage"
          description: "CBD Database memory usage is above 80%"

      - alert: CBDHighResponseTime
        expr: cbd_http_request_duration_seconds{quantile="0.95"} > 1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "CBD Database high response time"
          description: "95th percentile response time is above 1 second"
`;

    await fs.writeFile(
      path.join(this.deploymentPath, 'alert_rules.yml'),
      alertRules.trim()
    );

    // Grafana dashboard
    const grafanaDashboard = {
      dashboard: {
        id: null,
        title: "CBD Universal Database",
        tags: ["database", "cbd"],
        timezone: "browser",
        panels: [
          {
            title: "Request Rate",
            type: "graph",
            targets: [
              {
                expr: "rate(cbd_http_requests_total[5m])",
                legendFormat: "{{method}} {{status}}"
              }
            ]
          },
          {
            title: "Response Time",
            type: "graph",
            targets: [
              {
                expr: "cbd_http_request_duration_seconds{quantile=\"0.95\"}",
                legendFormat: "95th percentile"
              }
            ]
          },
          {
            title: "Memory Usage",
            type: "graph",
            targets: [
              {
                expr: "cbd_memory_usage_bytes",
                legendFormat: "Memory Usage"
              }
            ]
          }
        ],
        time: {
          from: "now-1h",
          to: "now"
        },
        refresh: "5s"
      }
    };

    await fs.writeFile(
      path.join(this.deploymentPath, 'grafana-dashboard.json'),
      JSON.stringify(grafanaDashboard, null, 2)
    );
  }

  /**
   * Validate deployment configuration
   */
  async validateDeployment(): Promise<boolean> {
    console.log('✅ Validating deployment configuration...');

    try {
      // Check required files exist
      const requiredFiles = [
        '.env.production',
        'config.json',
        'Dockerfile',
        'docker-compose.yml',
        'k8s/01-namespace.yaml',
        'scripts/build.sh',
        'prometheus.yml'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(this.deploymentPath, file);
        await fs.access(filePath);
      }

      // Validate configuration values
      if (!process.env.OPENAI_API_KEY && this.config.environment === 'production') {
        console.warn('⚠️ OPENAI_API_KEY not set in production environment');
      }

      console.log('✅ Deployment configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Deployment validation failed:', error);
      return false;
    }
  }

  /**
   * Generate deployment summary
   */
  generateDeploymentSummary(): void {
    console.log('\n🚀 Deployment Summary:');
    console.log('========================');
    console.log(`Environment: ${this.config.environment}`);
    console.log(`Replicas: ${this.config.scaling.replicas}`);
    console.log(`Auto-scaling: ${this.config.scaling.auto_scaling ? 'Enabled' : 'Disabled'}`);
    console.log(`SSL/TLS: ${this.config.database.ssl ? 'Enabled' : 'Disabled'}`);
    console.log(`Monitoring: ${this.config.monitoring.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`Rate Limiting: ${this.config.security.rate_limit.max_requests} requests per ${this.config.security.rate_limit.window_ms / 60000} minutes`);
    console.log('\n📂 Generated Files:');
    console.log('  - Environment configuration (.env.production)');
    console.log('  - Docker files (Dockerfile, docker-compose.yml)');
    console.log('  - Kubernetes manifests (k8s/*.yaml)');
    console.log('  - Deployment scripts (scripts/*.sh)');
    console.log('  - Monitoring configuration (prometheus.yml, grafana-dashboard.json)');
    console.log('\n🔧 Next Steps:');
    console.log('  1. Review and customize configuration files');
    console.log('  2. Set environment variables (especially OPENAI_API_KEY)');
    console.log('  3. Run: ./scripts/build.sh');
    console.log('  4. Run: ./scripts/deploy.sh production');
    console.log('  5. Verify deployment health');
    console.log('\n📖 Documentation: See deployment/README.md for detailed instructions\n');
  }
}

// CLI interface
if (require.main === module) {
  const environment = process.argv[2] as 'development' | 'staging' | 'production' || 'production';

  const deploymentManager = new DeploymentManager(environment);

  deploymentManager.prepareDeployment()
    .then(() => deploymentManager.validateDeployment())
    .then((isValid) => {
      if (isValid) {
        deploymentManager.generateDeploymentSummary();
        process.exit(0);
      } else {
        console.error('❌ Deployment preparation failed validation');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Deployment preparation failed:', error);
      process.exit(1);
    });
}
