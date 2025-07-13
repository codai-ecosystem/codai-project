#!/usr/bin/env node

/**
 * Monitoring & Observability Generator
 * Creates comprehensive monitoring, logging, and observability stack
 * Part of Milestone 2: Enterprise Production Excellence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(
  `${colors.cyan}${colors.bright}📊 Codai Monitoring & Observability Generator${colors.reset}`
);
console.log(
  `${colors.blue}Milestone 2: Enterprise Production Excellence${colors.reset}\n`
);

/**
 * Generate Prometheus configuration
 */
function generatePrometheusConfig(services) {
  return `# Prometheus Configuration for Codai Ecosystem
# Milestone 2: Enterprise Production Excellence
# Generated: ${new Date().toISOString()}

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'codai-production'
    environment: 'production'

rule_files:
  - "alerts/*.yml"
  - "recording_rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
      - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)

${services
  .map(
    service => `
  - job_name: '${service}'
    kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
            - codai-production
    relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: ${service}
      - source_labels: [__meta_kubernetes_endpoint_port_name]
        action: keep
        regex: http
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_service_name]
        target_label: kubernetes_name
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: kubernetes_pod_name
    metrics_path: /metrics
    scrape_interval: 30s`
  )
  .join('')}

  - job_name: 'blackbox'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
${services
  .filter(s => needsExternalMonitoring(s))
  .map(s => `          - https://${s}.codai.dev`)
  .join('\n')}
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115

remote_write:
  - url: https://prometheus-remote-write.grafana.net/api/prom/push
    basic_auth:
      username: !ENV GRAFANA_CLOUD_USER
      password: !ENV GRAFANA_CLOUD_KEY
`;
}

/**
 * Generate Grafana dashboards
 */
function generateGrafanaDashboard(serviceName) {
  return {
    dashboard: {
      id: null,
      title: `${serviceName.toUpperCase()} Service Dashboard`,
      tags: ['codai', serviceName, 'microservice'],
      timezone: 'browser',
      refresh: '30s',
      time: {
        from: 'now-1h',
        to: 'now',
      },
      panels: [
        {
          id: 1,
          title: 'Request Rate',
          type: 'stat',
          targets: [
            {
              expr: `sum(rate(http_requests_total{service="${serviceName}"}[5m]))`,
              legendFormat: 'RPS',
            },
          ],
          fieldConfig: {
            defaults: {
              color: { mode: 'thresholds' },
              thresholds: {
                steps: [
                  { color: 'green', value: null },
                  { color: 'red', value: 1000 },
                ],
              },
              unit: 'reqps',
            },
          },
          gridPos: { h: 8, w: 6, x: 0, y: 0 },
        },
        {
          id: 2,
          title: 'Response Time',
          type: 'stat',
          targets: [
            {
              expr: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="${serviceName}"}[5m])) by (le))`,
              legendFormat: 'P95',
            },
          ],
          fieldConfig: {
            defaults: {
              color: { mode: 'thresholds' },
              thresholds: {
                steps: [
                  { color: 'green', value: null },
                  { color: 'yellow', value: 0.5 },
                  { color: 'red', value: 1 },
                ],
              },
              unit: 's',
            },
          },
          gridPos: { h: 8, w: 6, x: 6, y: 0 },
        },
        {
          id: 3,
          title: 'Error Rate',
          type: 'stat',
          targets: [
            {
              expr: `sum(rate(http_requests_total{service="${serviceName}",status=~"5.."}[5m])) / sum(rate(http_requests_total{service="${serviceName}"}[5m])) * 100`,
              legendFormat: 'Error %',
            },
          ],
          fieldConfig: {
            defaults: {
              color: { mode: 'thresholds' },
              thresholds: {
                steps: [
                  { color: 'green', value: null },
                  { color: 'yellow', value: 1 },
                  { color: 'red', value: 5 },
                ],
              },
              unit: 'percent',
            },
          },
          gridPos: { h: 8, w: 6, x: 12, y: 0 },
        },
        {
          id: 4,
          title: 'Active Instances',
          type: 'stat',
          targets: [
            {
              expr: `count(up{service="${serviceName}"} == 1)`,
              legendFormat: 'Instances',
            },
          ],
          fieldConfig: {
            defaults: {
              color: { mode: 'thresholds' },
              thresholds: {
                steps: [
                  { color: 'red', value: null },
                  { color: 'yellow', value: 1 },
                  { color: 'green', value: 2 },
                ],
              },
              unit: 'short',
            },
          },
          gridPos: { h: 8, w: 6, x: 18, y: 0 },
        },
        {
          id: 5,
          title: 'Request Rate Over Time',
          type: 'timeseries',
          targets: [
            {
              expr: `sum by (status) (rate(http_requests_total{service="${serviceName}"}[5m]))`,
              legendFormat: '{{status}}',
            },
          ],
          fieldConfig: {
            defaults: {
              color: { mode: 'palette-classic' },
              unit: 'reqps',
            },
          },
          gridPos: { h: 8, w: 12, x: 0, y: 8 },
        },
        {
          id: 6,
          title: 'Response Time Percentiles',
          type: 'timeseries',
          targets: [
            {
              expr: `histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket{service="${serviceName}"}[5m])) by (le))`,
              legendFormat: 'P50',
            },
            {
              expr: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="${serviceName}"}[5m])) by (le))`,
              legendFormat: 'P95',
            },
            {
              expr: `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service="${serviceName}"}[5m])) by (le))`,
              legendFormat: 'P99',
            },
          ],
          fieldConfig: {
            defaults: {
              color: { mode: 'palette-classic' },
              unit: 's',
            },
          },
          gridPos: { h: 8, w: 12, x: 12, y: 8 },
        },
        {
          id: 7,
          title: 'Memory Usage',
          type: 'timeseries',
          targets: [
            {
              expr: `process_resident_memory_bytes{service="${serviceName}"}`,
              legendFormat: '{{instance}}',
            },
          ],
          fieldConfig: {
            defaults: {
              color: { mode: 'palette-classic' },
              unit: 'bytes',
            },
          },
          gridPos: { h: 8, w: 12, x: 0, y: 16 },
        },
        {
          id: 8,
          title: 'CPU Usage',
          type: 'timeseries',
          targets: [
            {
              expr: `rate(process_cpu_seconds_total{service="${serviceName}"}[5m]) * 100`,
              legendFormat: '{{instance}}',
            },
          ],
          fieldConfig: {
            defaults: {
              color: { mode: 'palette-classic' },
              unit: 'percent',
            },
          },
          gridPos: { h: 8, w: 12, x: 12, y: 16 },
        },
      ],
    },
  };
}

/**
 * Generate alerting rules
 */
function generateAlertingRules(services) {
  return `# Alerting Rules for Codai Ecosystem
# Milestone 2: Enterprise Production Excellence
# Generated: ${new Date().toISOString()}

groups:
${services
  .map(
    service => `
  - name: ${service}_alerts
    rules:
      - alert: ${service.toUpperCase()}_HighErrorRate
        expr: sum(rate(http_requests_total{service="${service}",status=~"5.."}[5m])) / sum(rate(http_requests_total{service="${service}"}[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
          service: ${service}
        annotations:
          summary: "High error rate for ${service}"
          description: "Error rate for ${service} is {{ $value | humanizePercentage }}"

      - alert: ${service.toUpperCase()}_HighLatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="${service}"}[5m])) by (le)) > 1
        for: 5m
        labels:
          severity: warning
          service: ${service}
        annotations:
          summary: "High latency for ${service}"
          description: "95th percentile latency for ${service} is {{ $value }}s"

      - alert: ${service.toUpperCase()}_ServiceDown
        expr: up{service="${service}"} == 0
        for: 1m
        labels:
          severity: critical
          service: ${service}
        annotations:
          summary: "${service} service is down"
          description: "${service} service has been down for more than 1 minute"

      - alert: ${service.toUpperCase()}_HighMemoryUsage
        expr: process_resident_memory_bytes{service="${service}"} / (1024*1024*1024) > 2
        for: 10m
        labels:
          severity: warning
          service: ${service}
        annotations:
          summary: "High memory usage for ${service}"
          description: "Memory usage for ${service} is {{ $value }}GB"

      - alert: ${service.toUpperCase()}_HighCPUUsage
        expr: rate(process_cpu_seconds_total{service="${service}"}[5m]) * 100 > 80
        for: 10m
        labels:
          severity: warning
          service: ${service}
        annotations:
          summary: "High CPU usage for ${service}"
          description: "CPU usage for ${service} is {{ $value }}%"`
  )
  .join('')}

  - name: infrastructure_alerts
    rules:
      - alert: KubernetesNodeDown
        expr: up{job="kubernetes-nodes"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Kubernetes node is down"
          description: "Kubernetes node {{ $labels.instance }} has been down for more than 5 minutes"

      - alert: KubernetesApiServerDown
        expr: up{job="kubernetes-apiservers"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Kubernetes API server is down"
          description: "Kubernetes API server has been down for more than 1 minute"

      - alert: PrometheusDown
        expr: up{job="prometheus"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Prometheus is down"
          description: "Prometheus has been down for more than 1 minute"
`;
}

/**
 * Generate Fluentd configuration
 */
function generateFluentdConfig() {
  return `# Fluentd Configuration for Codai Ecosystem
# Milestone 2: Enterprise Production Excellence
# Generated: ${new Date().toISOString()}

<source>
  @type tail
  @id in_tail_container_logs
  path /var/log/containers/*.log
  pos_file /var/log/fluentd-containers.log.pos
  tag raw.kubernetes.*
  read_from_head true
  <parse>
    @type multi_format
    <pattern>
      format json
      time_key time
      time_format %Y-%m-%dT%H:%M:%S.%NZ
    </pattern>
    <pattern>
      format /^(?<time>.+) (?<stream>stdout|stderr) [^ ]* (?<log>.*)$/
      time_format %Y-%m-%dT%H:%M:%S.%N%:z
    </pattern>
  </parse>
</source>

<source>
  @type tail
  @id in_tail_nginx_access_log
  path /var/log/nginx/access.log
  pos_file /var/log/fluentd-nginx-access.log.pos
  tag nginx.access
  <parse>
    @type nginx
  </parse>
</source>

<source>
  @type tail
  @id in_tail_nginx_error_log
  path /var/log/nginx/error.log
  pos_file /var/log/fluentd-nginx-error.log.pos
  tag nginx.error
  <parse>
    @type regexp
    expression /^(?<time>\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2}) \\[(?<log_level>\\w+)\\] (?<pid>\\d+).(?<tid>\\d+): (?<message>.*)$/
  </parse>
</source>

<filter raw.kubernetes.**>
  @type kubernetes_metadata
  @id filter_kube_metadata
  kubernetes_url "#{ENV['KUBERNETES_SERVICE_HOST']}:#{ENV['KUBERNETES_SERVICE_PORT_HTTPS']}"
  verify_ssl "#{ENV['KUBERNETES_VERIFY_SSL'] || true}"
  ca_file "#{ENV['KUBERNETES_CA_FILE']}"
  skip_labels false
  skip_container_metadata false
  skip_master_url false
  skip_namespace_metadata false
</filter>

<filter kubernetes.**>
  @type grep
  <regexp>
    key $.kubernetes.namespace_name
    pattern ^codai-
  </regexp>
</filter>

<filter kubernetes.**>
  @type record_transformer
  <record>
    service_name \${kubernetes.labels.app}
    environment production
    cluster codai-production
  </record>
</filter>

<filter kubernetes.**>
  @type parser
  key_name log
  reserve_data true
  remove_key_name_field true
  <parse>
    @type multi_format
    <pattern>
      format json
    </pattern>
    <pattern>
      format none
    </pattern>
  </parse>
</filter>

<match nginx.**>
  @type elasticsearch
  @id out_es_nginx
  @log_level info
  include_tag_key true
  host "#{ENV['ELASTICSEARCH_HOST'] || 'elasticsearch'}"
  port "#{ENV['ELASTICSEARCH_PORT'] || '9200'}"
  scheme "#{ENV['ELASTICSEARCH_SCHEME'] || 'http'}"
  ssl_verify "#{ENV['ELASTICSEARCH_SSL_VERIFY'] || 'true'}"
  user "#{ENV['ELASTICSEARCH_USER']}"
  password "#{ENV['ELASTICSEARCH_PASSWORD']}"
  index_name nginx-logs
  type_name _doc
  <buffer>
    @type file
    path /var/log/fluentd-buffers/nginx.buffer
    flush_mode interval
    retry_type exponential_backoff
    flush_thread_count 2
    flush_interval 5s
    retry_forever
    retry_max_interval 30
    chunk_limit_size 2M
    queue_limit_length 8
    overflow_action block
  </buffer>
</match>

<match kubernetes.**>
  @type elasticsearch
  @id out_es
  @log_level info
  include_tag_key true
  host "#{ENV['ELASTICSEARCH_HOST'] || 'elasticsearch'}"
  port "#{ENV['ELASTICSEARCH_PORT'] || '9200'}"
  scheme "#{ENV['ELASTICSEARCH_SCHEME'] || 'http'}"
  ssl_verify "#{ENV['ELASTICSEARCH_SSL_VERIFY'] || 'true'}"
  user "#{ENV['ELASTICSEARCH_USER']}"
  password "#{ENV['ELASTICSEARCH_PASSWORD']}"
  logstash_format true
  logstash_prefix codai-logs
  logstash_dateformat %Y.%m.%d
  include_timestamp true
  type_name _doc
  <buffer>
    @type file
    path /var/log/fluentd-buffers/kubernetes.system.buffer
    flush_mode interval
    retry_type exponential_backoff
    flush_thread_count 2
    flush_interval 5s
    retry_forever
    retry_max_interval 30
    chunk_limit_size 2M
    queue_limit_length 8
    overflow_action block
  </buffer>
</match>
`;
}

/**
 * Generate Jaeger configuration
 */
function generateJaegerConfig() {
  return {
    query: {
      'grpc-server': {
        'host-port': '0.0.0.0:16685',
      },
      'http-server': {
        'host-port': '0.0.0.0:16686',
      },
    },
    collector: {
      'grpc-server': {
        'host-port': '0.0.0.0:14250',
      },
      'http-server': {
        'host-port': '0.0.0.0:14268',
      },
      zipkin: {
        'host-port': '0.0.0.0:9411',
      },
    },
    agent: {
      'jaeger.tags': 'cluster=codai-production,environment=production',
    },
    storage: {
      type: 'elasticsearch',
      options: {
        primary: {
          'es.server-urls': 'http://elasticsearch:9200',
          'es.index-prefix': 'jaeger',
          'es.num-shards': 1,
          'es.num-replicas': 0,
        },
      },
    },
  };
}

/**
 * Helper functions
 */
function needsExternalMonitoring(serviceName) {
  const externalServices = [
    'codai',
    'memorai',
    'logai',
    'bancai',
    'wallet',
    'fabricai',
    'studiai',
    'sociai',
    'cumparai',
    'x',
    'publicai',
    'admin',
    'dash',
    'docs',
    'explorer',
    'hub',
    'id',
  ];
  return externalServices.includes(serviceName);
}

/**
 * Main monitoring generation function
 */
async function generateMonitoring() {
  console.log(
    `${colors.yellow}📊 Generating monitoring infrastructure...${colors.reset}`
  );

  // Load project configuration
  const projectsIndexPath = path.join(__dirname, '../projects.index.json');
  const projectsIndex = JSON.parse(fs.readFileSync(projectsIndexPath, 'utf8'));

  // Create monitoring directory structure
  const monitoringDir = path.join(__dirname, '../monitoring');
  const prometheusDir = path.join(monitoringDir, 'prometheus');
  const alertsDir = path.join(prometheusDir, 'alerts');
  const rulesDir = path.join(prometheusDir, 'recording_rules');
  const grafanaDir = path.join(monitoringDir, 'grafana', 'dashboards');
  const fluentdDir = path.join(monitoringDir, 'fluentd');
  const jaegerDir = path.join(monitoringDir, 'jaeger');

  [
    monitoringDir,
    prometheusDir,
    alertsDir,
    rulesDir,
    grafanaDir,
    fluentdDir,
    jaegerDir,
  ].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  let processedCount = 0;
  const generatedFiles = [];

  // Get all services
  const allServices = [
    ...(projectsIndex.apps || []).map(app => app.name),
    ...fs
      .readdirSync(path.join(__dirname, '../services'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name),
  ];

  console.log(
    `\n${colors.cyan}📊 Generating monitoring for ${allServices.length} services...${colors.reset}`
  );

  // Generate Prometheus configuration
  const prometheusConfig = generatePrometheusConfig(allServices);
  const prometheusConfigPath = path.join(prometheusDir, 'prometheus.yml');
  fs.writeFileSync(prometheusConfigPath, prometheusConfig);
  generatedFiles.push(prometheusConfigPath);

  // Generate alerting rules
  const alertingRules = generateAlertingRules(allServices);
  const alertingRulesPath = path.join(alertsDir, 'codai-alerts.yml');
  fs.writeFileSync(alertingRulesPath, alertingRules);
  generatedFiles.push(alertingRulesPath);

  // Generate Grafana dashboards for each service
  for (const serviceName of allServices) {
    try {
      const dashboard = generateGrafanaDashboard(serviceName);
      const dashboardPath = path.join(
        grafanaDir,
        `${serviceName}-dashboard.json`
      );
      fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
      generatedFiles.push(dashboardPath);

      processedCount++;
      console.log(
        `   ${colors.green}✅${colors.reset} ${serviceName} - Dashboard generated`
      );
    } catch (error) {
      console.error(
        `   ${colors.red}❌${colors.reset} ${serviceName} - ${error.message}`
      );
    }
  }

  // Generate Fluentd configuration
  console.log(
    `\n${colors.cyan}📋 Generating logging configuration...${colors.reset}`
  );
  const fluentdConfig = generateFluentdConfig();
  const fluentdConfigPath = path.join(fluentdDir, 'fluent.conf');
  fs.writeFileSync(fluentdConfigPath, fluentdConfig);
  generatedFiles.push(fluentdConfigPath);

  // Generate Jaeger configuration
  console.log(
    `\n${colors.cyan}🔍 Generating tracing configuration...${colors.reset}`
  );
  const jaegerConfig = generateJaegerConfig();
  const jaegerConfigPath = path.join(jaegerDir, 'jaeger.json');
  fs.writeFileSync(jaegerConfigPath, JSON.stringify(jaegerConfig, null, 2));
  generatedFiles.push(jaegerConfigPath);

  // Generate overview dashboard
  const overviewDashboard = {
    dashboard: {
      id: null,
      title: 'Codai Ecosystem Overview',
      tags: ['codai', 'overview', 'ecosystem'],
      timezone: 'browser',
      refresh: '30s',
      time: { from: 'now-1h', to: 'now' },
      panels: [
        {
          id: 1,
          title: 'Total Requests/sec',
          type: 'stat',
          targets: [
            {
              expr: 'sum(rate(http_requests_total[5m]))',
              legendFormat: 'Total RPS',
            },
          ],
          gridPos: { h: 8, w: 6, x: 0, y: 0 },
        },
        {
          id: 2,
          title: 'Services Health',
          type: 'stat',
          targets: [
            {
              expr: 'count(up == 1)',
              legendFormat: 'Healthy Services',
            },
          ],
          gridPos: { h: 8, w: 6, x: 6, y: 0 },
        },
        {
          id: 3,
          title: 'Average Response Time',
          type: 'stat',
          targets: [
            {
              expr: 'avg(rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m]))',
              legendFormat: 'Avg Response Time',
            },
          ],
          gridPos: { h: 8, w: 6, x: 12, y: 0 },
        },
        {
          id: 4,
          title: 'Error Rate',
          type: 'stat',
          targets: [
            {
              expr: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100',
              legendFormat: 'Error Rate',
            },
          ],
          gridPos: { h: 8, w: 6, x: 18, y: 0 },
        },
      ],
    },
  };

  const overviewDashboardPath = path.join(
    grafanaDir,
    'overview-dashboard.json'
  );
  fs.writeFileSync(
    overviewDashboardPath,
    JSON.stringify(overviewDashboard, null, 2)
  );
  generatedFiles.push(overviewDashboardPath);

  console.log(
    `\n${colors.magenta}🎯 Monitoring Generation Summary:${colors.reset}`
  );
  console.log(
    `${colors.green}✅ Services processed: ${processedCount}/${allServices.length}${colors.reset}`
  );
  console.log(
    `${colors.green}✅ Monitoring files generated: ${generatedFiles.length}${colors.reset}`
  );
  console.log(
    `${colors.cyan}📁 Monitoring directory: ${monitoringDir}${colors.reset}`
  );

  return {
    success: processedCount === allServices.length,
    processedCount,
    totalServices: allServices.length,
    generatedFiles: generatedFiles.length,
    monitoringDir,
  };
}

// Execute main function
generateMonitoring()
  .then(result => {
    if (result.success) {
      console.log(
        `\n${colors.bright}${colors.green}🚀 Monitoring infrastructure complete!${colors.reset}`
      );
      console.log(
        `${colors.green}Full observability stack ready for production${colors.reset}`
      );
      process.exit(0);
    } else {
      console.error(
        `\n${colors.red}❌ Monitoring generation failed${colors.reset}`
      );
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`\n${colors.red}❌ Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
