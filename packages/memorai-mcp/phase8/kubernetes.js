/**
 * ☸️ MemorAI MCP Phase 8: Kubernetes Deployment & Orchestration
 * 
 * Kubernetes manifests and deployment management
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const CONFIG = require('./config');

class KubernetesManager {
    constructor() {
        this.namespace = CONFIG.K8S.NAMESPACE;
        this.serviceName = CONFIG.K8S.SERVICE_NAME;
        this.deploymentName = CONFIG.K8S.DEPLOYMENT_NAME;
        this.replicas = CONFIG.K8S.REPLICAS;
    }

    async generateNamespace() {
        const manifest = `# ☸️ MemorAI MCP Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: ${this.namespace}
  labels:
    app: memorai-mcp
    environment: production
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'namespace.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes namespace manifest generated');
    }

    async generateConfigMap() {
        const manifest = `# ☸️ MemorAI MCP ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: memorai-config
  namespace: ${this.namespace}
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  MEMORAI_PROD_PORT: "${CONFIG.PORT}"
  HEALTH_CHECK_INTERVAL: "${CONFIG.HEALTH_CHECK_INTERVAL}"
  CLUSTER_SIZE: "${CONFIG.CLUSTER_SIZE}"
  RATE_LIMIT: "${CONFIG.SECURITY.RATE_LIMIT}"
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'configmap.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes ConfigMap generated');
    }

    async generateSecret() {
        const manifest = `# ☸️ MemorAI MCP Secret
apiVersion: v1
kind: Secret
metadata:
  name: memorai-secrets
  namespace: ${this.namespace}
type: Opaque
data:
  # Base64 encoded values (replace with actual encoded secrets)
  memorai-api-key: bWVtb3JhaS1wcm9kLWtleS0yMDI1  # memorai-prod-key-2025
  jwt-secret: bWVtb3JhaS1qd3Qtc2VjcmV0LTIwMjU=     # memorai-jwt-secret-2025
  postgres-password: cG9zdGdyZXNfcGFzc3dvcmQ=        # postgres_password
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'secret.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes Secret generated');
    }

    async generateDeployment() {
        const manifest = `# ☸️ MemorAI MCP Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${this.deploymentName}
  namespace: ${this.namespace}
  labels:
    app: memorai-mcp
    version: v1
spec:
  replicas: ${this.replicas}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: memorai-mcp
  template:
    metadata:
      labels:
        app: memorai-mcp
        version: v1
    spec:
      containers:
      - name: memorai-mcp
        image: ${CONFIG.DOCKER.REGISTRY}/${CONFIG.DOCKER.IMAGE_NAME}:${CONFIG.DOCKER.TAG}
        ports:
        - containerPort: ${CONFIG.PORT}
          name: http
        env:
        - name: MEMORAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: memorai-secrets
              key: memorai-api-key
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: memorai-secrets
              key: jwt-secret
        envFrom:
        - configMapRef:
            name: memorai-config
        resources:
          limits:
            cpu: ${CONFIG.K8S.CPU_LIMIT}
            memory: ${CONFIG.K8S.MEMORY_LIMIT}
          requests:
            cpu: "500m"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        volumeMounts:
        - name: data-storage
          mountPath: /app/data
        - name: logs-storage
          mountPath: /app/logs
      volumes:
      - name: data-storage
        persistentVolumeClaim:
          claimName: memorai-data-pvc
      - name: logs-storage
        emptyDir: {}
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'deployment.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes Deployment generated');
    }

    async generateService() {
        const manifest = `# ☸️ MemorAI MCP Service
apiVersion: v1
kind: Service
metadata:
  name: ${this.serviceName}
  namespace: ${this.namespace}
  labels:
    app: memorai-mcp
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: ${CONFIG.PORT}
    protocol: TCP
    name: http
  selector:
    app: memorai-mcp
---
# ☸️ MemorAI MCP LoadBalancer Service
apiVersion: v1
kind: Service
metadata:
  name: memorai-mcp-lb
  namespace: ${this.namespace}
  labels:
    app: memorai-mcp
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: ${CONFIG.PORT}
    protocol: TCP
    name: http
  - port: 443
    targetPort: ${CONFIG.PORT}
    protocol: TCP
    name: https
  selector:
    app: memorai-mcp
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'service.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes Service generated');
    }

    async generateIngress() {
        const manifest = `# ☸️ MemorAI MCP Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: memorai-mcp-ingress
  namespace: ${this.namespace}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - memorai.production.com
    secretName: memorai-tls
  rules:
  - host: memorai.production.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${this.serviceName}
            port:
              number: 80
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'ingress.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes Ingress generated');
    }

    async generatePVC() {
        const manifest = `# ☸️ MemorAI MCP Persistent Volume Claim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: memorai-data-pvc
  namespace: ${this.namespace}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'pvc.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes PVC generated');
    }

    async generateHPA() {
        const manifest = `# ☸️ MemorAI MCP Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memorai-mcp-hpa
  namespace: ${this.namespace}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${this.deploymentName}
  minReplicas: ${this.replicas}
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'hpa.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes HPA generated');
    }

    async generateKustomization() {
        const manifest = `# ☸️ MemorAI MCP Kustomization
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: ${this.namespace}

resources:
- namespace.yaml
- configmap.yaml
- secret.yaml
- pvc.yaml
- deployment.yaml
- service.yaml
- ingress.yaml
- hpa.yaml

commonLabels:
  app: memorai-mcp
  environment: production

images:
- name: ${CONFIG.DOCKER.REGISTRY}/${CONFIG.DOCKER.IMAGE_NAME}
  newTag: ${CONFIG.DOCKER.TAG}

patchesStrategicMerge:
- deployment-patch.yaml

configMapGenerator:
- name: memorai-version-config
  literals:
  - VERSION=${CONFIG.DOCKER.TAG}
  - BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
`;

        await fs.writeFile(path.join(__dirname, 'k8s', 'kustomization.yaml'), manifest, 'utf8');
        console.log('✅ Kubernetes Kustomization generated');
    }

    async ensureDirectories() {
        const k8sDir = path.join(__dirname, 'k8s');
        await fs.mkdir(k8sDir, { recursive: true });
    }

    async generateAllManifests() {
        console.log('📦 Generating Kubernetes manifests...');

        await this.ensureDirectories();
        await this.generateNamespace();
        await this.generateConfigMap();
        await this.generateSecret();
        await this.generatePVC();
        await this.generateDeployment();
        await this.generateService();
        await this.generateIngress();
        await this.generateHPA();
        await this.generateKustomization();

        console.log('✅ All Kubernetes manifests generated');
    }

    async deployToCluster() {
        console.log('🚀 Deploying to Kubernetes cluster...');

        try {
            const applyCommand = `kubectl apply -k ${path.join(__dirname, 'k8s')}`;
            execSync(applyCommand, { stdio: 'inherit' });
            console.log('✅ Deployment to Kubernetes successful');
        } catch (error) {
            console.error('❌ Kubernetes deployment failed:', error.message);
            throw error;
        }
    }

    async getStatus() {
        try {
            console.log('📊 Getting Kubernetes deployment status...');

            const statusCommands = [
                `kubectl get pods -n ${this.namespace}`,
                `kubectl get services -n ${this.namespace}`,
                `kubectl get ingress -n ${this.namespace}`,
                `kubectl get hpa -n ${this.namespace}`
            ];

            for (const command of statusCommands) {
                console.log(`\n🔍 ${command}`);
                execSync(command, { stdio: 'inherit' });
            }

        } catch (error) {
            console.error('❌ Failed to get status:', error.message);
        }
    }
}

module.exports = KubernetesManager;
