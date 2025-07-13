#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load project index to get all services
const projectsIndexPath = path.join(__dirname, '..', 'projects.index.json');
const projectsIndex = JSON.parse(fs.readFileSync(projectsIndexPath, 'utf8'));

// Also read services directory to get all services
const servicesDir = path.join(__dirname, '..', 'services');
const serviceNames = fs
  .readdirSync(servicesDir)
  .filter(name => fs.statSync(path.join(servicesDir, name)).isDirectory());

// Extract all services from the index
const services = [];

// Get apps (core services)
if (projectsIndex.apps && Array.isArray(projectsIndex.apps)) {
  projectsIndex.apps.forEach(app => {
    services.push({
      name: app.name,
      type: 'app',
      config: app,
    });
  });
}

// Get services from directory listing (since they're not in projects.index.json)
serviceNames.forEach(serviceName => {
  // Skip if already added as an app
  if (!services.find(s => s.name === serviceName)) {
    // Try to read service config if it exists
    const serviceConfigPath = path.join(
      servicesDir,
      serviceName,
      'package.json'
    );
    let serviceConfig = {
      name: serviceName,
      description: `${serviceName} service`,
    };

    if (fs.existsSync(serviceConfigPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(serviceConfigPath, 'utf8')
        );
        serviceConfig.description =
          packageJson.description || `${serviceName} service`;
      } catch (e) {
        // Use default config
      }
    }

    services.push({
      name: serviceName,
      type: 'service',
      config: serviceConfig,
    });
  }
});

console.log(
  `Found ${services.length} services/apps to generate Helm charts for:`
);
services.forEach(service => {
  console.log(`  - ${service.name} (${service.type})`);
});

// Base Helm chart directory
const helmChartsDir = path.join(
  __dirname,
  '..',
  'infrastructure',
  'helm',
  'charts'
);

// Ensure charts directory exists
if (!fs.existsSync(helmChartsDir)) {
  fs.mkdirSync(helmChartsDir, { recursive: true });
}

// Template for Chart.yaml
const chartYamlTemplate = (serviceName, description = '') => `apiVersion: v2
name: ${serviceName}
description: ${description || `Helm chart for ${serviceName} service`}
type: application
version: 0.1.0
appVersion: "1.0.0"
home: https://github.com/codai-project/${serviceName}
sources:
  - https://github.com/codai-project/${serviceName}
maintainers:
  - name: Codai Team
    email: team@codai.ai
    url: https://codai.ai
keywords:
  - ai
  - codai
  - microservice
  - kubernetes
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: "17.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
`;

// Template for values.yaml
const valuesYamlTemplate = serviceName => `# Default values for ${serviceName}
# This is a YAML-formatted file.

# Global configuration
global:
  namespace: codai
  environment: production
  
# Application configuration
replicaCount: 3

image:
  repository: codai/${serviceName}
  pullPolicy: IfNotPresent
  tag: "latest"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

# Service Account
serviceAccount:
  create: true
  automount: true
  annotations: {}
  name: ""

# Pod configuration
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "9090"
  prometheus.io/path: "/metrics"

podLabels:
  app.kubernetes.io/name: ${serviceName}
  app.kubernetes.io/part-of: codai

podSecurityContext:
  fsGroup: 2000
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault

securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000

# Service configuration
service:
  type: ClusterIP
  port: 80
  targetPort: 3000
  annotations: {}

# Ingress configuration
ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: ${serviceName}.codai.ai
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: ${serviceName}-tls
      hosts:
        - ${serviceName}.codai.ai

# Resource limits and requests
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 250m
    memory: 512Mi

# Health checks
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3

# Startup probe
startupProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 30

# Autoscaling
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

# Pod Disruption Budget
podDisruptionBudget:
  enabled: true
  minAvailable: 2

# Network Policy
networkPolicy:
  enabled: true
  egress:
    - to: []
      ports:
        - protocol: TCP
          port: 443
        - protocol: TCP
          port: 80
        - protocol: UDP
          port: 53

# Environment variables
env:
  nodeEnv: production
  logLevel: info
  port: 3000

# ConfigMap
configMap:
  enabled: true
  data:
    FEATURE_FLAGS: "true"
    METRICS_ENABLED: "true"

# Secrets
secrets:
  enabled: true
  database:
    username: ""
    password: ""
  api:
    key: ""
    secret: ""
  jwt:
    secret: ""
  external: {}
  custom: {}

# Database configuration
database:
  enabled: true
  host: postgresql
  port: 5432
  name: ${serviceName}

# Redis configuration  
redis:
  enabled: true
  host: redis
  port: 6379

# External dependencies
postgresql:
  enabled: false
  auth:
    postgresPassword: ""
    database: ${serviceName}

redis:
  enabled: false
  auth:
    enabled: true
    password: ""

# Monitoring
monitoring:
  enabled: true
  port: 9090
  serviceMonitor:
    enabled: true
    interval: 30s
    scrapeTimeout: 10s
    path: /metrics
    labels:
      release: prometheus

# API configuration
api:
  version: v1
  timeout: 30s

# Logging
logging:
  level: info
  format: json

# Testing
tests:
  enabled: true
  endpoints:
    - name: health-check
      path: /health
      method: GET
    - name: readiness-check
      path: /ready
      method: GET

# Node selection
nodeSelector: {}

# Tolerations
tolerations: []

# Affinity rules
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app.kubernetes.io/name
                operator: In
                values:
                  - ${serviceName}
          topologyKey: kubernetes.io/hostname

# Additional volumes
volumes: []

# Additional volume mounts
volumeMounts: []
`;

// Template for deployment.yaml
const deploymentTemplate = serviceName => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "${serviceName}.fullname" . }}
  labels:
    {{- include "${serviceName}.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "${serviceName}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        checksum/secret: {{ include (print $.Template.BasePath "/secret.yaml") . | sha256sum }}
        {{- with .Values.podAnnotations }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
      labels:
        {{- include "${serviceName}.labels" . | nindent 8 }}
        {{- with .Values.podLabels }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "${serviceName}.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort | default 3000 }}
              protocol: TCP
            {{- if .Values.monitoring.enabled }}
            - name: http-metrics
              containerPort: {{ .Values.monitoring.port | default 9090 }}
              protocol: TCP
            {{- end }}
          env:
            - name: NODE_ENV
              value: {{ .Values.env.nodeEnv | quote }}
            - name: PORT
              value: {{ .Values.service.targetPort | default 3000 | quote }}
            - name: LOG_LEVEL
              value: {{ .Values.logging.level | quote }}
            {{- if .Values.database.enabled }}
            - name: DATABASE_URL
              value: {{ printf "postgresql://$(DATABASE_USERNAME):$(DATABASE_PASSWORD)@%s:%s/%s" .Values.database.host (.Values.database.port | toString) .Values.database.name | quote }}
            - name: DATABASE_USERNAME
              valueFrom:
                secretKeyRef:
                  name: {{ include "${serviceName}.fullname" . }}-secret
                  key: DATABASE_USERNAME
            - name: DATABASE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: {{ include "${serviceName}.fullname" . }}-secret
                  key: DATABASE_PASSWORD
            {{- end }}
            {{- if .Values.redis.enabled }}
            - name: REDIS_URL
              value: {{ printf "redis://:%s@%s:%s" "$(REDIS_PASSWORD)" .Values.redis.host (.Values.redis.port | toString) | quote }}
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: {{ include "${serviceName}.fullname" . }}-secret
                  key: REDIS_PASSWORD
            {{- end }}
          envFrom:
            {{- if .Values.configMap.enabled }}
            - configMapRef:
                name: {{ include "${serviceName}.fullname" . }}-config
            {{- end }}
          {{- with .Values.livenessProbe }}
          livenessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.readinessProbe }}
          readinessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.startupProbe }}
          startupProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          {{- with .Values.volumeMounts }}
          volumeMounts:
            {{- toYaml . | nindent 12 }}
          {{- end }}
      {{- with .Values.volumes }}
      volumes:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
`;

// Template for _helpers.tpl
const helpersTemplate = serviceName => `{{/*
Expand the name of the chart.
*/}}
{{- define "${serviceName}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "${serviceName}.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "${serviceName}.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "${serviceName}.labels" -}}
helm.sh/chart: {{ include "${serviceName}.chart" . }}
{{ include "${serviceName}.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: codai
{{- end }}

{{/*
Selector labels
*/}}
{{- define "${serviceName}.selectorLabels" -}}
app.kubernetes.io/name: {{ include "${serviceName}.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "${serviceName}.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "${serviceName}.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the configmap
*/}}
{{- define "${serviceName}.configMapName" -}}
{{- printf "%s-config" (include "${serviceName}.fullname" .) }}
{{- end }}

{{/*
Create the name of the secret
*/}}
{{- define "${serviceName}.secretName" -}}
{{- printf "%s-secret" (include "${serviceName}.fullname" .) }}
{{- end }}

{{/*
Database URL helper
*/}}
{{- define "${serviceName}.databaseUrl" -}}
{{- if .Values.database.enabled }}
{{- printf "postgresql://$(DATABASE_USERNAME):$(DATABASE_PASSWORD)@%s:%s/%s" .Values.database.host (.Values.database.port | toString) .Values.database.name }}
{{- end }}
{{- end }}

{{/*
Redis URL helper
*/}}
{{- define "${serviceName}.redisUrl" -}}
{{- if .Values.redis.enabled }}
{{- printf "redis://:%s@%s:%s" "$(REDIS_PASSWORD)" .Values.redis.host (.Values.redis.port | toString) }}
{{- end }}
{{- end }}

{{/*
Resource management helpers
*/}}
{{- define "${serviceName}.resources" -}}
{{- if .Values.resources }}
resources:
  {{- if .Values.resources.limits }}
  limits:
    {{- if .Values.resources.limits.cpu }}
    cpu: {{ .Values.resources.limits.cpu }}
    {{- end }}
    {{- if .Values.resources.limits.memory }}
    memory: {{ .Values.resources.limits.memory }}
    {{- end }}
  {{- end }}
  {{- if .Values.resources.requests }}
  requests:
    {{- if .Values.resources.requests.cpu }}
    cpu: {{ .Values.resources.requests.cpu }}
    {{- end }}
    {{- if .Values.resources.requests.memory }}
    memory: {{ .Values.resources.requests.memory }}
    {{- end }}
  {{- end }}
{{- end }}
{{- end }}

{{/*
Security context helpers
*/}}
{{- define "${serviceName}.securityContext" -}}
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: {{ .Values.securityContext.runAsUser | default 1000 }}
{{- end }}

{{/*
Pod security context helpers
*/}}
{{- define "${serviceName}.podSecurityContext" -}}
securityContext:
  fsGroup: {{ .Values.podSecurityContext.fsGroup | default 2000 }}
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault
{{- end }}
`;

// Function to copy template files from codai to new service
function copyTemplateFiles(serviceDir, serviceName) {
  const codaiTemplatesDir = path.join(helmChartsDir, 'codai', 'templates');
  const serviceTemplatesDir = path.join(serviceDir, 'templates');

  if (!fs.existsSync(serviceTemplatesDir)) {
    fs.mkdirSync(serviceTemplatesDir, { recursive: true });
  }

  // Create tests directory
  const testsDir = path.join(serviceTemplatesDir, 'tests');
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
  }

  // Template files to copy and customize
  const templateFiles = [
    'service.yaml',
    'ingress.yaml',
    'serviceaccount.yaml',
    'hpa.yaml',
    'configmap.yaml',
    'secret.yaml',
    'networkpolicy.yaml',
    'poddisruptionbudget.yaml',
    'servicemonitor.yaml',
    'tests/test-connection.yaml',
  ];

  templateFiles.forEach(templateFile => {
    const sourceFile = path.join(codaiTemplatesDir, templateFile);
    const targetFile = path.join(serviceTemplatesDir, templateFile);

    if (fs.existsSync(sourceFile)) {
      let content = fs.readFileSync(sourceFile, 'utf8');
      // Replace "codai" references with the new service name
      content = content.replace(/codai/g, serviceName);

      // Ensure target directory exists
      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      fs.writeFileSync(targetFile, content);
    }
  });

  // Create NOTES.txt
  const notesContent = `1. Get the application URL by running these commands:
{{- if .Values.ingress.enabled }}
{{- range $host := .Values.ingress.hosts }}
  {{- range .paths }}
  http{{ if $.Values.ingress.tls }}s{{ end }}://{{ $host.host }}{{ .path }}
  {{- end }}
{{- end }}
{{- else if contains "NodePort" .Values.service.type }}
  export NODE_PORT=$(kubectl get --namespace {{ .Release.Namespace }} -o jsonpath="{.spec.ports[0].nodePort}" services {{ include "${serviceName}.fullname" . }})
  export NODE_IP=$(kubectl get nodes --namespace {{ .Release.Namespace }} -o jsonpath="{.items[0].status.addresses[0].address}")
  echo http://$NODE_IP:$NODE_PORT
{{- else if contains "LoadBalancer" .Values.service.type }}
     NOTE: It may take a few minutes for the LoadBalancer IP to be available.
           You can watch the status of by running 'kubectl get --namespace {{ .Release.Namespace }} svc -w {{ include "${serviceName}.fullname" . }}'
  export SERVICE_IP=$(kubectl get svc --namespace {{ .Release.Namespace }} {{ include "${serviceName}.fullname" . }} --template "{{"{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}"}}")
  echo http://$SERVICE_IP:{{ .Values.service.port }}
{{- else if contains "ClusterIP" .Values.service.type }}
  export POD_NAME=$(kubectl get pods --namespace {{ .Release.Namespace }} -l "{{ include "${serviceName}.selectorLabels" . }}" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace {{ .Release.Namespace }} $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace {{ .Release.Namespace }} port-forward $POD_NAME 8080:$CONTAINER_PORT
{{- end }}

2. Check the deployment status:
   kubectl get pods -l "{{ include "${serviceName}.selectorLabels" . }}" -n {{ .Release.Namespace }}

3. View logs:
   kubectl logs -l "{{ include "${serviceName}.selectorLabels" . }}" -n {{ .Release.Namespace }}

4. Run tests:
   helm test {{ .Release.Name }} -n {{ .Release.Namespace }}

{{- if .Values.monitoring.enabled }}
5. Access metrics endpoint:
   kubectl port-forward svc/{{ include "${serviceName}.fullname" . }} {{ .Values.monitoring.port | default 9090 }}:{{ .Values.monitoring.port | default 9090 }} -n {{ .Release.Namespace }}
   Then visit http://localhost:{{ .Values.monitoring.port | default 9090 }}/metrics
{{- end }}

Thank you for using ${serviceName}! 🚀`;

  fs.writeFileSync(path.join(serviceTemplatesDir, 'NOTES.txt'), notesContent);
}

// Generate Helm chart for each service
let generated = 0;
let skipped = 0;

services.forEach(service => {
  const serviceName = service.name;
  const serviceDir = path.join(helmChartsDir, serviceName);

  // Check if chart already exists
  if (fs.existsSync(serviceDir)) {
    console.log(`⚠️  Skipping ${serviceName} - chart already exists`);
    skipped++;
    return;
  }

  console.log(`🚀 Generating Helm chart for ${serviceName}...`);

  // Create service directory
  fs.mkdirSync(serviceDir, { recursive: true });

  // Get description from config if available
  const description =
    service.config?.description || `Helm chart for ${serviceName} service`;

  // Generate Chart.yaml
  fs.writeFileSync(
    path.join(serviceDir, 'Chart.yaml'),
    chartYamlTemplate(serviceName, description)
  );

  // Generate values.yaml
  fs.writeFileSync(
    path.join(serviceDir, 'values.yaml'),
    valuesYamlTemplate(serviceName)
  );

  // Create templates directory
  const templatesDir = path.join(serviceDir, 'templates');
  fs.mkdirSync(templatesDir, { recursive: true });

  // Generate _helpers.tpl
  fs.writeFileSync(
    path.join(templatesDir, '_helpers.tpl'),
    helpersTemplate(serviceName)
  );

  // Generate deployment.yaml
  fs.writeFileSync(
    path.join(templatesDir, 'deployment.yaml'),
    deploymentTemplate(serviceName)
  );

  // Copy and customize other template files from codai chart
  copyTemplateFiles(serviceDir, serviceName);

  generated++;
  console.log(`✅ Generated Helm chart for ${serviceName}`);
});

console.log(`\\n🎉 Helm chart generation complete!`);
console.log(`📊 Summary:`);
console.log(`   - Generated: ${generated} charts`);
console.log(`   - Skipped: ${skipped} charts (already exist)`);
console.log(`   - Total services: ${services.length}`);

if (generated > 0) {
  console.log(`\\n📁 Charts generated in: infrastructure/helm/charts/`);
  console.log(`\\n🔧 Next steps:`);
  console.log(`   1. Review and customize values.yaml files for each service`);
  console.log(`   2. Update Chart.yaml dependencies as needed`);
  console.log(
    `   3. Test charts with: helm template <chart-name> infrastructure/helm/charts/<chart-name>`
  );
  console.log(
    `   4. Deploy with: helm install <release-name> infrastructure/helm/charts/<chart-name>`
  );
}
