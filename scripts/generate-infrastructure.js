#!/usr/bin/env node

/**
 * Infrastructure Foundation Generator
 * Creates Kubernetes manifests, Helm charts, and infrastructure as code
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
  `${colors.cyan}${colors.bright}🏗️  Codai Infrastructure Foundation Generator${colors.reset}`
);
console.log(
  `${colors.blue}Milestone 2: Enterprise Production Excellence${colors.reset}\n`
);

/**
 * Generate Kubernetes deployment manifest for a service
 */
function generateDeployment(serviceName, config = {}) {
  const {
    port = getDefaultPort(serviceName),
    replicas = getDefaultReplicas(serviceName),
    resources = getDefaultResources(serviceName),
    image = `codai/${serviceName}:latest`,
    healthCheck = '/health',
  } = config;

  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: serviceName,
      namespace: 'codai-production',
      labels: {
        app: serviceName,
        component: 'application',
        'app.kubernetes.io/name': serviceName,
        'app.kubernetes.io/component': 'application',
        'app.kubernetes.io/part-of': 'codai-ecosystem',
        'app.kubernetes.io/version': '2.0.0',
      },
    },
    spec: {
      replicas,
      selector: {
        matchLabels: {
          app: serviceName,
        },
      },
      template: {
        metadata: {
          labels: {
            app: serviceName,
            component: 'application',
            'app.kubernetes.io/name': serviceName,
            'app.kubernetes.io/component': 'application',
            'app.kubernetes.io/part-of': 'codai-ecosystem',
          },
        },
        spec: {
          containers: [
            {
              name: serviceName,
              image,
              ports: [
                {
                  containerPort: parseInt(port),
                  name: 'http',
                },
              ],
              env: [
                {
                  name: 'PORT',
                  value: port.toString(),
                },
                {
                  name: 'NODE_ENV',
                  value: 'production',
                },
                {
                  name: 'SERVICE_NAME',
                  value: serviceName,
                },
              ],
              envFrom: [
                {
                  secretRef: {
                    name: `${serviceName}-env`,
                  },
                },
              ],
              resources,
              livenessProbe: {
                httpGet: {
                  path: healthCheck,
                  port: parseInt(port),
                },
                initialDelaySeconds: 30,
                periodSeconds: 10,
                timeoutSeconds: 5,
                failureThreshold: 3,
              },
              readinessProbe: {
                httpGet: {
                  path: healthCheck,
                  port: parseInt(port),
                },
                initialDelaySeconds: 5,
                periodSeconds: 5,
                timeoutSeconds: 3,
                failureThreshold: 3,
              },
              securityContext: {
                allowPrivilegeEscalation: false,
                runAsNonRoot: true,
                runAsUser: 1001,
                capabilities: {
                  drop: ['ALL'],
                },
              },
            },
          ],
          securityContext: {
            fsGroup: 1001,
          },
          affinity: {
            podAntiAffinity: {
              preferredDuringSchedulingIgnoredDuringExecution: [
                {
                  weight: 100,
                  podAffinityTerm: {
                    labelSelector: {
                      matchExpressions: [
                        {
                          key: 'app',
                          operator: 'In',
                          values: [serviceName],
                        },
                      ],
                    },
                    topologyKey: 'kubernetes.io/hostname',
                  },
                },
              ],
            },
          },
        },
      },
    },
  };
}

/**
 * Generate Kubernetes service manifest
 */
function generateService(serviceName, config = {}) {
  const { port = getDefaultPort(serviceName), type = 'ClusterIP' } = config;

  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: serviceName,
      namespace: 'codai-production',
      labels: {
        app: serviceName,
        component: 'service',
        'app.kubernetes.io/name': serviceName,
        'app.kubernetes.io/component': 'service',
        'app.kubernetes.io/part-of': 'codai-ecosystem',
      },
    },
    spec: {
      type,
      ports: [
        {
          port: 80,
          targetPort: parseInt(port),
          protocol: 'TCP',
          name: 'http',
        },
      ],
      selector: {
        app: serviceName,
      },
    },
  };
}

/**
 * Generate Ingress manifest for external services
 */
function generateIngress(serviceName, config = {}) {
  const {
    host = `${serviceName}.codai.dev`,
    path = '/',
    tlsEnabled = true,
  } = config;

  const ingress = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: serviceName,
      namespace: 'codai-production',
      labels: {
        app: serviceName,
        component: 'ingress',
        'app.kubernetes.io/name': serviceName,
        'app.kubernetes.io/component': 'ingress',
        'app.kubernetes.io/part-of': 'codai-ecosystem',
      },
      annotations: {
        'kubernetes.io/ingress.class': 'nginx',
        'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
        'nginx.ingress.kubernetes.io/force-ssl-redirect': 'true',
        'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
        'nginx.ingress.kubernetes.io/rate-limit': '100',
        'nginx.ingress.kubernetes.io/rate-limit-window': '1m',
      },
    },
    spec: {
      rules: [
        {
          host,
          http: {
            paths: [
              {
                path,
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: serviceName,
                    port: {
                      number: 80,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  if (tlsEnabled) {
    ingress.spec.tls = [
      {
        hosts: [host],
        secretName: `${serviceName}-tls`,
      },
    ];
  }

  return ingress;
}

/**
 * Generate HorizontalPodAutoscaler manifest
 */
function generateHPA(serviceName, config = {}) {
  const {
    minReplicas = 2,
    maxReplicas = 10,
    targetCPU = 70,
    targetMemory = 80,
  } = config;

  return {
    apiVersion: 'autoscaling/v2',
    kind: 'HorizontalPodAutoscaler',
    metadata: {
      name: serviceName,
      namespace: 'codai-production',
      labels: {
        app: serviceName,
        component: 'autoscaler',
        'app.kubernetes.io/name': serviceName,
        'app.kubernetes.io/component': 'autoscaler',
        'app.kubernetes.io/part-of': 'codai-ecosystem',
      },
    },
    spec: {
      scaleTargetRef: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        name: serviceName,
      },
      minReplicas,
      maxReplicas,
      metrics: [
        {
          type: 'Resource',
          resource: {
            name: 'cpu',
            target: {
              type: 'Utilization',
              averageUtilization: targetCPU,
            },
          },
        },
        {
          type: 'Resource',
          resource: {
            name: 'memory',
            target: {
              type: 'Utilization',
              averageUtilization: targetMemory,
            },
          },
        },
      ],
    },
  };
}

/**
 * Generate ServiceMonitor for Prometheus
 */
function generateServiceMonitor(serviceName, config = {}) {
  const { port = getDefaultPort(serviceName), path = '/metrics' } = config;

  return {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'ServiceMonitor',
    metadata: {
      name: serviceName,
      namespace: 'codai-production',
      labels: {
        app: serviceName,
        component: 'monitoring',
        'app.kubernetes.io/name': serviceName,
        'app.kubernetes.io/component': 'monitoring',
        'app.kubernetes.io/part-of': 'codai-ecosystem',
      },
    },
    spec: {
      selector: {
        matchLabels: {
          app: serviceName,
        },
      },
      endpoints: [
        {
          port: 'http',
          path,
          interval: '30s',
        },
      ],
    },
  };
}

/**
 * Get default port for service
 */
function getDefaultPort(serviceName) {
  const portMap = {
    codai: 3000,
    memorai: 3001,
    logai: 3002,
    bancai: 3003,
    wallet: 3004,
    fabricai: 3005,
    studiai: 3006,
    sociai: 3007,
    cumparai: 3008,
    x: 3009,
    publicai: 3010,
    admin: 4000,
    AIDE: 4001,
    ajutai: 4002,
    analizai: 4003,
    dash: 4004,
    docs: 4005,
    explorer: 4006,
    hub: 4007,
    id: 4008,
    jucai: 4009,
    kodex: 4010,
    legalizai: 4011,
    marketai: 4012,
    metu: 4013,
    mod: 4014,
    stocai: 4015,
    templates: 4016,
    tools: 4017,
  };
  return portMap[serviceName] || 8080;
}

/**
 * Get default replicas for service
 */
function getDefaultReplicas(serviceName) {
  // Priority 1 services get more replicas
  const priority1 = ['codai', 'memorai', 'logai'];
  if (priority1.includes(serviceName)) return 3;

  // Priority 2 services
  const priority2 = ['bancai', 'wallet', 'fabricai', 'x'];
  if (priority2.includes(serviceName)) return 2;

  return 1;
}

/**
 * Get default resources for service
 */
function getDefaultResources(serviceName) {
  const priority1 = ['codai', 'memorai', 'logai'];
  const priority2 = ['bancai', 'wallet', 'fabricai', 'x'];

  if (priority1.includes(serviceName)) {
    return {
      requests: { cpu: '500m', memory: '1Gi' },
      limits: { cpu: '2000m', memory: '4Gi' },
    };
  } else if (priority2.includes(serviceName)) {
    return {
      requests: { cpu: '250m', memory: '512Mi' },
      limits: { cpu: '1000m', memory: '2Gi' },
    };
  } else {
    return {
      requests: { cpu: '100m', memory: '256Mi' },
      limits: { cpu: '500m', memory: '1Gi' },
    };
  }
}

/**
 * Check if service needs external access
 */
function needsIngress(serviceName) {
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
 * Main infrastructure generation function
 */
async function generateInfrastructure() {
  console.log(
    `${colors.yellow}🏗️  Generating Kubernetes infrastructure...${colors.reset}`
  );

  // Load project configuration
  const projectsIndexPath = path.join(__dirname, '../projects.index.json');
  const projectsIndex = JSON.parse(fs.readFileSync(projectsIndexPath, 'utf8'));

  // Create infrastructure directory structure
  const infraDir = path.join(__dirname, '../infrastructure');
  const manifestsDir = path.join(infraDir, 'manifests');
  const helmDir = path.join(infraDir, 'helm');
  const terraformDir = path.join(infraDir, 'terraform');

  [infraDir, manifestsDir, helmDir, terraformDir].forEach(dir => {
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
    `\n${colors.cyan}📦 Generating manifests for ${allServices.length} services...${colors.reset}`
  );

  for (const serviceName of allServices) {
    try {
      const serviceDir = path.join(manifestsDir, serviceName);
      if (!fs.existsSync(serviceDir)) {
        fs.mkdirSync(serviceDir, { recursive: true });
      }

      // Generate core manifests
      const deployment = generateDeployment(serviceName);
      const service = generateService(serviceName);
      const hpa = generateHPA(serviceName);
      const serviceMonitor = generateServiceMonitor(serviceName);

      // Write deployment
      const deploymentPath = path.join(serviceDir, 'deployment.yaml');
      fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
      generatedFiles.push(deploymentPath);

      // Write service
      const servicePath = path.join(serviceDir, 'service.yaml');
      fs.writeFileSync(servicePath, JSON.stringify(service, null, 2));
      generatedFiles.push(servicePath);

      // Write HPA
      const hpaPath = path.join(serviceDir, 'hpa.yaml');
      fs.writeFileSync(hpaPath, JSON.stringify(hpa, null, 2));
      generatedFiles.push(hpaPath);

      // Write ServiceMonitor
      const serviceMonitorPath = path.join(serviceDir, 'servicemonitor.yaml');
      fs.writeFileSync(
        serviceMonitorPath,
        JSON.stringify(serviceMonitor, null, 2)
      );
      generatedFiles.push(serviceMonitorPath);

      // Generate ingress for external services
      if (needsIngress(serviceName)) {
        const ingress = generateIngress(serviceName);
        const ingressPath = path.join(serviceDir, 'ingress.yaml');
        fs.writeFileSync(ingressPath, JSON.stringify(ingress, null, 2));
        generatedFiles.push(ingressPath);
      }

      processedCount++;
      console.log(
        `   ${colors.green}✅${colors.reset} ${serviceName} - ${generatedFiles.length - processedCount + 1} manifests`
      );
    } catch (error) {
      console.error(
        `   ${colors.red}❌${colors.reset} ${serviceName} - ${error.message}`
      );
    }
  }

  // Generate namespace manifest
  const namespace = {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name: 'codai-production',
      labels: {
        'app.kubernetes.io/name': 'codai-production',
        'app.kubernetes.io/part-of': 'codai-ecosystem',
      },
    },
  };

  const namespacePath = path.join(manifestsDir, 'namespace.yaml');
  fs.writeFileSync(namespacePath, JSON.stringify(namespace, null, 2));
  generatedFiles.push(namespacePath);

  console.log(
    `\n${colors.magenta}🎯 Infrastructure Generation Summary:${colors.reset}`
  );
  console.log(
    `${colors.green}✅ Services processed: ${processedCount}/${allServices.length}${colors.reset}`
  );
  console.log(
    `${colors.green}✅ Manifests generated: ${generatedFiles.length}${colors.reset}`
  );
  console.log(
    `${colors.cyan}📁 Infrastructure directory: ${infraDir}${colors.reset}`
  );

  return {
    success: processedCount === allServices.length,
    processedCount,
    totalServices: allServices.length,
    generatedFiles: generatedFiles.length,
    infraDir,
  };
}

// Execute main function
generateInfrastructure()
  .then(result => {
    if (result.success) {
      console.log(
        `\n${colors.bright}${colors.green}🚀 Infrastructure foundation complete!${colors.reset}`
      );
      console.log(
        `${colors.green}Ready for next phase of Milestone 2${colors.reset}`
      );
      process.exit(0);
    } else {
      console.error(
        `\n${colors.red}❌ Infrastructure generation failed${colors.reset}`
      );
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`\n${colors.red}❌ Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
