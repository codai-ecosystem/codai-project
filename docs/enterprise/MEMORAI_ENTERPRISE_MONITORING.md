# MemorAI Enterprise Monitoring Dashboard

This document outlines the monitoring and observability strategy for the MemorAI enterprise deployment.

## Overview

The MemorAI enterprise deployment includes comprehensive monitoring using:

- **Prometheus** for metrics collection
- **Grafana** for visualization and alerting
- **ELK Stack** for log aggregation and analysis
- **Jaeger** for distributed tracing
- **Istio** for service mesh observability

## Monitoring Stack Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Applications  │    │   Service Mesh   │    │   Monitoring    │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ MemorAI MCP │ │◄───┤ │ Istio Proxy  │ │────┤ │ Prometheus  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ CBD Vector  │ │◄───┤ │ Istio Proxy  │ │────┤ │   Grafana   │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   Gateway   │ │◄───┤ │ Istio Proxy  │ │────┤ │   Jaeger    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                        ┌─────────────────┐
                        │   ELK Stack     │
                        │                 │
                        │ ┌─────────────┐ │
                        │ │Elasticsearch│ │
                        │ └─────────────┘ │
                        │ ┌─────────────┐ │
                        │ │   Logstash  │ │
                        │ └─────────────┘ │
                        │ ┌─────────────┐ │
                        │ │    Kibana   │ │
                        │ └─────────────┘ │
                        └─────────────────┘
```

## Key Metrics

### Application Metrics

- **Request Rate**: Requests per second across all services
- **Response Time**: P50, P95, P99 latencies for all endpoints
- **Error Rate**: 4xx and 5xx error percentages
- **Throughput**: Data processing rates for vector operations

### Infrastructure Metrics

- **CPU Usage**: Per node and per pod
- **Memory Usage**: Heap, non-heap, and system memory
- **Disk I/O**: Read/write operations and latency
- **Network**: Bandwidth utilization and packet loss

### Business Metrics

- **Vector Operations**: Embeddings created, searches performed
- **Memory Usage**: Knowledge graph operations and storage
- **User Sessions**: Active users and session duration
- **API Usage**: Rate limiting and quota utilization

## Dashboard Configuration

### Grafana Dashboards

#### 1. MemorAI Overview Dashboard

```json
{
  "dashboard": {
    "title": "MemorAI Enterprise Overview",
    "panels": [
      {
        "title": "Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~\"memorai-.*\"}"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

#### 2. CBD Vector Database Dashboard

```json
{
  "dashboard": {
    "title": "CBD Vector Database Performance",
    "panels": [
      {
        "title": "Vector Operations/sec",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cbd_vector_operations_total[5m])"
          }
        ]
      },
      {
        "title": "Index Size",
        "type": "stat",
        "targets": [
          {
            "expr": "cbd_index_size_bytes"
          }
        ]
      },
      {
        "title": "Search Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(cbd_search_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

## Alerting Rules

### Critical Alerts

```yaml
groups:
  - name: memorai.critical
    rules:
      - alert: ServiceDown
        expr: up{job=~"memorai-.*"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'MemorAI service {{ $labels.instance }} is down'

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'High error rate detected: {{ $value | humanizePercentage }}'

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: 'High latency detected: {{ $value }}s'
```

### Resource Alerts

```yaml
- name: memorai.resources
  rules:
    - alert: HighCPUUsage
      expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: 'High CPU usage: {{ $value | humanizePercentage }}'

    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: 'High memory usage: {{ $value | humanizePercentage }}'

    - alert: DiskSpaceLow
      expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes > 0.85
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: 'Disk space low: {{ $value | humanizePercentage }} used'
```

## Log Analysis

### Log Structure

All services emit structured JSON logs with the following format:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "service": "memorai-mcp",
  "trace_id": "abc123def456",
  "span_id": "789ghi012",
  "message": "Request processed successfully",
  "metadata": {
    "request_id": "req_123",
    "user_id": "user_456",
    "operation": "vector_search",
    "duration_ms": 45
  }
}
```

### Log Queries

#### Error Analysis

```
level:ERROR AND service:memorai-*
```

#### Performance Analysis

```
metadata.duration_ms:>1000 AND metadata.operation:vector_search
```

#### User Activity

```
metadata.user_id:* AND message:"Request processed"
```

## Distributed Tracing

### Jaeger Configuration

Traces capture the complete request flow through:

1. Gateway ingress
2. Service mesh routing
3. Application processing
4. Database operations
5. External API calls

### Key Trace Operations

- `http_request`: HTTP request handling
- `vector_search`: Vector similarity search
- `memory_store`: Knowledge graph storage
- `database_query`: Database operations

## Health Checks

### Endpoint Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

### Custom Health Checks

Services implement comprehensive health checks covering:

- Database connectivity
- External service availability
- Resource availability
- Configuration validity

## SLA Monitoring

### Service Level Objectives (SLOs)

- **Availability**: 99.9% uptime
- **Latency**: 95% of requests < 200ms
- **Throughput**: Support 10,000 requests/minute
- **Error Rate**: < 0.1% error rate

### SLA Dashboard

Real-time SLA compliance tracking with:

- Current availability percentage
- Latency percentile trends
- Error budget consumption
- Projected SLA compliance

## Runbook Integration

Each alert includes runbook links with:

- Problem diagnosis steps
- Resolution procedures
- Escalation paths
- Post-incident actions

## Security Monitoring

### Security Metrics

- Authentication failures
- Authorization denials
- Suspicious traffic patterns
- Certificate expiration

### Compliance Logging

Audit logs for compliance requirements:

- Data access logs
- Configuration changes
- Administrative actions
- Security events

## Performance Optimization

### Auto-scaling Metrics

HPA and VPA use metrics for automatic scaling:

```yaml
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
```

### Custom Metrics

Application-specific scaling metrics:

- Vector search queue length
- Memory graph complexity
- Active user sessions
- Processing backlog

## Maintenance and Updates

### Monitoring Stack Updates

- Regular Prometheus rule updates
- Dashboard version control
- Alert rule testing
- Performance baseline updates

### Capacity Planning

- Historical trend analysis
- Resource usage forecasting
- Scaling threshold optimization
- Cost optimization analysis

This monitoring strategy ensures comprehensive observability of the MemorAI enterprise deployment while maintaining high performance and reliability standards.
