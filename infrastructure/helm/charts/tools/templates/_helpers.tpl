{{/*
Expand the name of the chart.
*/}}
{{- define "tools.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "tools.fullname" -}}
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
{{- define "tools.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "tools.labels" -}}
helm.sh/chart: {{ include "tools.chart" . }}
{{ include "tools.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: codai
{{- end }}

{{/*
Selector labels
*/}}
{{- define "tools.selectorLabels" -}}
app.kubernetes.io/name: {{ include "tools.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "tools.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "tools.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the configmap
*/}}
{{- define "tools.configMapName" -}}
{{- printf "%s-config" (include "tools.fullname" .) }}
{{- end }}

{{/*
Create the name of the secret
*/}}
{{- define "tools.secretName" -}}
{{- printf "%s-secret" (include "tools.fullname" .) }}
{{- end }}

{{/*
Database URL helper
*/}}
{{- define "tools.databaseUrl" -}}
{{- if .Values.database.enabled }}
{{- printf "postgresql://$(DATABASE_USERNAME):$(DATABASE_PASSWORD)@%s:%s/%s" .Values.database.host (.Values.database.port | toString) .Values.database.name }}
{{- end }}
{{- end }}

{{/*
Redis URL helper
*/}}
{{- define "tools.redisUrl" -}}
{{- if .Values.redis.enabled }}
{{- printf "redis://:%s@%s:%s" "$(REDIS_PASSWORD)" .Values.redis.host (.Values.redis.port | toString) }}
{{- end }}
{{- end }}

{{/*
Resource management helpers
*/}}
{{- define "tools.resources" -}}
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
{{- define "tools.securityContext" -}}
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
{{- define "tools.podSecurityContext" -}}
securityContext:
  fsGroup: {{ .Values.podSecurityContext.fsGroup | default 2000 }}
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault
{{- end }}
