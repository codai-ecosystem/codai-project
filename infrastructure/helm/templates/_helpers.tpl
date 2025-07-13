{{/*
Expand the name of the chart.
*/}}
{{- define "codai-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "codai-platform.fullname" -}}
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
{{- define "codai-platform.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "codai-platform.labels" -}}
helm.sh/chart: {{ include "codai-platform.chart" . }}
{{ include "codai-platform.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
codai.ai/platform: "true"
{{- end }}

{{/*
Selector labels
*/}}
{{- define "codai-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "codai-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "codai-platform.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "codai-platform.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Generate database connection string
*/}}
{{- define "codai-platform.databaseUrl" -}}
{{- if .Values.global.database.url -}}
{{- .Values.global.database.url }}
{{- else -}}
postgres://{{ .Values.global.database.username }}:{{ .Values.global.database.password }}@{{ .Values.global.database.host }}:{{ .Values.global.database.port }}/{{ .Values.global.database.database }}?sslmode={{ .Values.global.database.sslMode }}
{{- end -}}
{{- end }}

{{/*
Generate Redis connection string
*/}}
{{- define "codai-platform.redisUrl" -}}
{{- if .Values.global.redis.url -}}
{{- .Values.global.redis.url }}
{{- else -}}
redis://{{ .Values.global.redis.host }}:{{ .Values.global.redis.port }}/{{ .Values.global.redis.database }}
{{- end -}}
{{- end }}

{{/*
Generate image pull policy
*/}}
{{- define "codai-platform.imagePullPolicy" -}}
{{- if eq .Values.global.environment "development" -}}
Always
{{- else -}}
IfNotPresent
{{- end -}}
{{- end }}

{{/*
Generate resource limits for apps
*/}}
{{- define "codai-platform.appResources" -}}
{{- $resources := .Values.global.resources.apps -}}
{{- if .Values.resources -}}
{{- $resources = mergeOverwrite $resources .Values.resources -}}
{{- end -}}
resources:
  limits:
    cpu: {{ $resources.limits.cpu }}
    memory: {{ $resources.limits.memory }}
  requests:
    cpu: {{ $resources.requests.cpu }}
    memory: {{ $resources.requests.memory }}
{{- end }}

{{/*
Generate resource limits for services
*/}}
{{- define "codai-platform.serviceResources" -}}
{{- $resources := .Values.global.resources.services -}}
{{- if .Values.resources -}}
{{- $resources = mergeOverwrite $resources .Values.resources -}}
{{- end -}}
resources:
  limits:
    cpu: {{ $resources.limits.cpu }}
    memory: {{ $resources.limits.memory }}
  requests:
    cpu: {{ $resources.requests.cpu }}
    memory: {{ $resources.requests.memory }}
{{- end }}

{{/*
Generate security context
*/}}
{{- define "codai-platform.securityContext" -}}
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  fsGroup: 1001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
{{- end }}

{{/*
Generate pod security context
*/}}
{{- define "codai-platform.podSecurityContext" -}}
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  fsGroup: 1001
{{- end }}

{{/*
Generate health check probes
*/}}
{{- define "codai-platform.healthProbes" -}}
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
{{- end }}

{{/*
Generate startup probe
*/}}
{{- define "codai-platform.startupProbe" -}}
startupProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 30
{{- end }}

{{/*
Generate node selector
*/}}
{{- define "codai-platform.nodeSelector" -}}
{{- if .Values.global.nodeSelector }}
nodeSelector:
  {{- toYaml .Values.global.nodeSelector | nindent 2 }}
{{- end }}
{{- end }}

{{/*
Generate tolerations
*/}}
{{- define "codai-platform.tolerations" -}}
{{- if .Values.global.tolerations }}
tolerations:
  {{- toYaml .Values.global.tolerations | nindent 2 }}
{{- end }}
{{- end }}

{{/*
Generate affinity rules
*/}}
{{- define "codai-platform.affinity" -}}
{{- if .Values.global.affinity }}
affinity:
  {{- toYaml .Values.global.affinity | nindent 2 }}
{{- else }}
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
            - {{ include "codai-platform.name" . }}
        topologyKey: kubernetes.io/hostname
{{- end }}
{{- end }}

{{/*
Generate common environment variables
*/}}
{{- define "codai-platform.commonEnv" -}}
- name: NODE_ENV
  value: {{ .Values.global.environment }}
- name: LOG_LEVEL
  value: {{ .Values.global.logging.level }}
- name: PORT
  value: "3000"
- name: PLATFORM_VERSION
  value: {{ .Chart.AppVersion | quote }}
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: {{ include "codai-platform.fullname" . }}-global-secret
      key: DATABASE_URL
- name: REDIS_URL
  value: {{ include "codai-platform.redisUrl" . }}
- name: KAFKA_BROKERS
  value: {{ .Values.global.kafka.brokers }}
{{- if .Values.global.monitoring.enabled }}
- name: ENABLE_METRICS
  value: "true"
- name: METRICS_PORT
  value: "9090"
{{- end }}
{{- if .Values.global.tracing.enabled }}
- name: ENABLE_TRACING
  value: "true"
- name: JAEGER_ENDPOINT
  value: {{ .Values.global.tracing.jaegerEndpoint }}
{{- end }}
{{- range $key, $value := .Values.global.env }}
- name: {{ $key }}
  value: {{ $value | quote }}
{{- end }}
{{- end }}

{{/*
Generate service annotations
*/}}
{{- define "codai-platform.serviceAnnotations" -}}
{{- if .Values.global.monitoring.enabled }}
prometheus.io/scrape: "true"
prometheus.io/port: "9090"
prometheus.io/path: "/metrics"
{{- end }}
{{- if .Values.global.service.annotations }}
{{- toYaml .Values.global.service.annotations }}
{{- end }}
{{- end }}

{{/*
Generate ingress annotations
*/}}
{{- define "codai-platform.ingressAnnotations" -}}
kubernetes.io/ingress.class: {{ .Values.global.ingress.className }}
{{- if .Values.global.security.tls.enabled }}
cert-manager.io/cluster-issuer: {{ .Values.global.security.tls.clusterIssuer }}
{{- end }}
nginx.ingress.kubernetes.io/ssl-redirect: "true"
nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
nginx.ingress.kubernetes.io/proxy-body-size: "50m"
nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
{{- if .Values.global.ingress.annotations }}
{{- toYaml .Values.global.ingress.annotations }}
{{- end }}
{{- end }}
