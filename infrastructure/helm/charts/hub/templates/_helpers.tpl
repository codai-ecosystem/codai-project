{{/*
Expand the name of the chart.
*/}}
{{- define "hub.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "hub.fullname" -}}
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
{{- define "hub.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "hub.labels" -}}
helm.sh/chart: {{ include "hub.chart" . }}
{{ include "hub.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: codai
{{- end }}

{{/*
Selector labels
*/}}
{{- define "hub.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hub.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "hub.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "hub.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the configmap
*/}}
{{- define "hub.configMapName" -}}
{{- printf "%s-config" (include "hub.fullname" .) }}
{{- end }}

{{/*
Create the name of the secret
*/}}
{{- define "hub.secretName" -}}
{{- printf "%s-secret" (include "hub.fullname" .) }}
{{- end }}

{{/*
Database URL helper
*/}}
{{- define "hub.databaseUrl" -}}
{{- if .Values.database.enabled }}
{{- printf "postgresql://$(DATABASE_USERNAME):$(DATABASE_PASSWORD)@%s:%s/%s" .Values.database.host (.Values.database.port | toString) .Values.database.name }}
{{- end }}
{{- end }}

{{/*
Redis URL helper
*/}}
{{- define "hub.redisUrl" -}}
{{- if .Values.redis.enabled }}
{{- printf "redis://:%s@%s:%s" "$(REDIS_PASSWORD)" .Values.redis.host (.Values.redis.port | toString) }}
{{- end }}
{{- end }}

{{/*
Resource management helpers
*/}}
{{- define "hub.resources" -}}
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
{{- define "hub.securityContext" -}}
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
{{- define "hub.podSecurityContext" -}}
securityContext:
  fsGroup: {{ .Values.podSecurityContext.fsGroup | default 2000 }}
  runAsNonRoot: true
  seccompProfile:
    type: RuntimeDefault
{{- end }}
