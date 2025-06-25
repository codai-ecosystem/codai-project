#!/usr/bin/env node

/**
 * CI/CD Pipeline Generator
 * Creates comprehensive CI/CD pipelines for all services
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
  `${colors.cyan}${colors.bright}🔄 Codai CI/CD Pipeline Generator${colors.reset}`
);
console.log(
  `${colors.blue}Milestone 2: Enterprise Production Excellence${colors.reset}\n`
);

/**
 * Generate GitHub Actions workflow for a service
 */
function generateGitHubWorkflow(serviceName, serviceType = 'app') {
  const isApp = serviceType === 'app';
  const workingDirectory = isApp
    ? `apps/${serviceName}`
    : `services/${serviceName}`;

  return {
    name: `${serviceName} CI/CD`,

    on: {
      push: {
        branches: ['main', 'develop'],
        paths: [`${workingDirectory}/**`],
      },
      pull_request: {
        branches: ['main', 'develop'],
        paths: [`${workingDirectory}/**`],
      },
      workflow_dispatch: {},
    },

    env: {
      SERVICE_NAME: serviceName,
      WORKING_DIRECTORY: workingDirectory,
      REGISTRY: 'ghcr.io',
      IMAGE_NAME: `codai/${serviceName}`,
    },

    jobs: {
      'code-quality': {
        name: 'Code Quality & Security',
        'runs-on': 'ubuntu-latest',
        defaults: {
          run: {
            'working-directory': `$\{{ env.WORKING_DIRECTORY }}`,
          },
        },
        steps: [
          {
            name: 'Checkout code',
            uses: 'actions/checkout@v4',
          },
          {
            name: 'Setup Node.js',
            uses: 'actions/setup-node@v4',
            with: {
              'node-version': '20',
              cache: 'pnpm',
              'cache-dependency-path': 'pnpm-lock.yaml',
            },
          },
          {
            name: 'Install dependencies',
            run: 'pnpm install --frozen-lockfile',
          },
          {
            name: 'Lint code',
            run: 'pnpm run lint',
          },
          {
            name: 'Type check',
            run: 'pnpm run type-check',
          },
          {
            name: 'Security audit',
            run: 'pnpm audit --audit-level moderate',
          },
          {
            name: 'CodeQL Analysis',
            uses: 'github/codeql-action/analyze@v2',
            with: {
              languages: 'javascript',
            },
          },
          {
            name: 'SAST Scan',
            uses: 'securecodewarrior/github-action-add-sarif@v1',
            with: {
              'sarif-file': 'sast-results.sarif',
            },
          },
        ],
      },

      test: {
        name: 'Tests & Coverage',
        'runs-on': 'ubuntu-latest',
        defaults: {
          run: {
            'working-directory': `$\{{ env.WORKING_DIRECTORY }}`,
          },
        },
        strategy: {
          matrix: {
            'node-version': ['18', '20'],
          },
        },
        steps: [
          {
            name: 'Checkout code',
            uses: 'actions/checkout@v4',
          },
          {
            name: `Setup Node.js $\{{ matrix.node-version }}`,
            uses: 'actions/setup-node@v4',
            with: {
              'node-version': `$\{{ matrix.node-version }}`,
              cache: 'pnpm',
            },
          },
          {
            name: 'Install dependencies',
            run: 'pnpm install --frozen-lockfile',
          },
          {
            name: 'Run unit tests',
            run: 'pnpm run test:unit --coverage',
          },
          {
            name: 'Run integration tests',
            run: 'pnpm run test:integration',
          },
          {
            name: 'Run E2E tests',
            run: 'pnpm run test:e2e',
          },
          {
            name: 'Upload coverage reports',
            uses: 'codecov/codecov-action@v3',
            with: {
              file: './coverage/lcov.info',
              'working-directory': `$\{{ env.WORKING_DIRECTORY }}`,
            },
          },
        ],
      },

      build: {
        name: 'Build & Package',
        'runs-on': 'ubuntu-latest',
        needs: ['code-quality', 'test'],
        outputs: {
          'image-digest': `$\{{ steps.build.outputs.digest }}`,
          'image-tag': `$\{{ steps.meta.outputs.tags }}`,
        },
        steps: [
          {
            name: 'Checkout code',
            uses: 'actions/checkout@v4',
          },
          {
            name: 'Setup Docker Buildx',
            uses: 'docker/setup-buildx-action@v3',
          },
          {
            name: 'Login to Container Registry',
            uses: 'docker/login-action@v3',
            with: {
              registry: `$\{{ env.REGISTRY }}`,
              username: `$\{{ github.actor }}`,
              password: `$\{{ secrets.GITHUB_TOKEN }}`,
            },
          },
          {
            name: 'Extract metadata',
            id: 'meta',
            uses: 'docker/metadata-action@v5',
            with: {
              images: `$\{{ env.REGISTRY }}/$\{{ env.IMAGE_NAME }}`,
              tags: [
                'type=ref,event=branch',
                'type=ref,event=pr',
                'type=semver,pattern={{version}}',
                'type=sha',
              ],
            },
          },
          {
            name: 'Build and push Docker image',
            id: 'build',
            uses: 'docker/build-push-action@v5',
            with: {
              context: `$\{{ env.WORKING_DIRECTORY }}`,
              push: true,
              tags: `$\{{ steps.meta.outputs.tags }}`,
              labels: `$\{{ steps.meta.outputs.labels }}`,
              cache: {
                from: 'type=gha',
                to: 'type=gha,mode=max',
              },
              provenance: false,
            },
          },
          {
            name: 'Generate SBOM',
            uses: 'anchore/sbom-action@v0',
            with: {
              image: `$\{{ env.REGISTRY }}/$\{{ env.IMAGE_NAME }}@$\{{ steps.build.outputs.digest }}`,
              format: 'spdx-json',
            },
          },
          {
            name: 'Container Security Scan',
            uses: 'aquasecurity/trivy-action@master',
            with: {
              'image-ref': `$\{{ env.REGISTRY }}/$\{{ env.IMAGE_NAME }}@$\{{ steps.build.outputs.digest }}`,
              format: 'sarif',
              output: 'trivy-results.sarif',
            },
          },
        ],
      },

      deploy: {
        name: 'Deploy to Kubernetes',
        'runs-on': 'ubuntu-latest',
        needs: ['build'],
        if: "github.ref == 'refs/heads/main'",
        environment: {
          name: 'production',
          url: `https://${serviceName}.codai.dev`,
        },
        steps: [
          {
            name: 'Checkout code',
            uses: 'actions/checkout@v4',
          },
          {
            name: 'Setup kubectl',
            uses: 'azure/setup-kubectl@v3',
            with: {
              version: 'v1.28.0',
            },
          },
          {
            name: 'Setup Helm',
            uses: 'azure/setup-helm@v3',
            with: {
              version: 'v3.12.0',
            },
          },
          {
            name: 'Configure kubectl',
            run: [
              'mkdir -p $HOME/.kube',
              'echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config',
              'kubectl config current-context',
            ].join('\n'),
          },
          {
            name: 'Deploy to Kubernetes',
            run: [
              `kubectl set image deployment/${serviceName} ${serviceName}=$\{{ needs.build.outputs.image-tag }} -n codai-production`,
              `kubectl rollout status deployment/${serviceName} -n codai-production --timeout=300s`,
            ].join('\n'),
          },
          {
            name: 'Verify deployment',
            run: [
              `kubectl get pods -n codai-production -l app=${serviceName}`,
              `kubectl get service -n codai-production ${serviceName}`,
            ].join('\n'),
          },
          {
            name: 'Health check',
            run: `curl -f https://${serviceName}.codai.dev/health || exit 1`,
          },
        ],
      },
    },
  };
}

/**
 * Generate Dockerfile for a service
 */
function generateDockerfile(serviceName, serviceType = 'app') {
  const isNextJs = [
    'codai',
    'memorai',
    'logai',
    'bancai',
    'wallet',
    'fabricai',
  ].includes(serviceName);

  if (isNextJs) {
    return `# Multi-stage build for ${serviceName}
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ARG NEXT_PUBLIC_APP_URL
ARG DATABASE_URL
ARG NEXTAUTH_SECRET

# Generate Prisma client if needed
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Build the application
RUN corepack enable pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
`;
  }

  return `# Multi-stage build for ${serviceName}
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json

USER appuser

EXPOSE ${getDefaultPort(serviceName)}

ENV PORT=${getDefaultPort(serviceName)}
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${getDefaultPort(serviceName)}/health || exit 1

CMD ["node", "dist/index.js"]
`;
}

/**
 * Generate Docker Compose for local development
 */
function generateDockerCompose(services) {
  const compose = {
    version: '3.8',
    services: {},
    networks: {
      codai: {
        driver: 'bridge',
      },
    },
    volumes: {
      postgres_data: {},
      redis_data: {},
      mongodb_data: {},
    },
  };

  // Add infrastructure services
  compose.services.postgres = {
    image: 'postgres:15-alpine',
    environment: {
      POSTGRES_DB: 'codai',
      POSTGRES_USER: 'codai',
      POSTGRES_PASSWORD: 'codai_dev_password',
    },
    ports: ['5432:5432'],
    volumes: ['postgres_data:/var/lib/postgresql/data'],
    networks: ['codai'],
    healthcheck: {
      test: ['CMD-SHELL', 'pg_isready -U codai'],
      interval: '10s',
      timeout: '5s',
      retries: 5,
    },
  };

  compose.services.redis = {
    image: 'redis:7-alpine',
    ports: ['6379:6379'],
    volumes: ['redis_data:/data'],
    networks: ['codai'],
    healthcheck: {
      test: ['CMD', 'redis-cli', 'ping'],
      interval: '10s',
      timeout: '3s',
      retries: 5,
    },
  };

  compose.services.mongodb = {
    image: 'mongo:7',
    environment: {
      MONGO_INITDB_ROOT_USERNAME: 'codai',
      MONGO_INITDB_ROOT_PASSWORD: 'codai_dev_password',
    },
    ports: ['27017:27017'],
    volumes: ['mongodb_data:/data/db'],
    networks: ['codai'],
  };

  // Add application services
  services.forEach(serviceName => {
    const port = getDefaultPort(serviceName);
    compose.services[serviceName] = {
      build: {
        context: `../${isApp(serviceName) ? 'apps' : 'services'}/${serviceName}`,
        dockerfile: 'Dockerfile',
      },
      ports: [`${port}:${port}`],
      environment: {
        NODE_ENV: 'development',
        PORT: port.toString(),
        DATABASE_URL:
          'postgresql://codai:codai_dev_password@postgres:5432/codai',
        REDIS_URL: 'redis://redis:6379',
        MONGODB_URL: 'mongodb://codai:codai_dev_password@mongodb:27017/codai',
      },
      depends_on: {
        postgres: { condition: 'service_healthy' },
        redis: { condition: 'service_healthy' },
        mongodb: { condition: 'service_started' },
      },
      networks: ['codai'],
      volumes: [
        `../${isApp(serviceName) ? 'apps' : 'services'}/${serviceName}:/app`,
        '/app/node_modules',
      ],
    };
  });

  return compose;
}

/**
 * Helper functions
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

function isApp(serviceName) {
  const apps = [
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
  ];
  return apps.includes(serviceName);
}

/**
 * Main CI/CD generation function
 */
async function generateCICD() {
  console.log(
    `${colors.yellow}🔄 Generating CI/CD pipelines...${colors.reset}`
  );

  // Load project configuration
  const projectsIndexPath = path.join(__dirname, '../projects.index.json');
  const projectsIndex = JSON.parse(fs.readFileSync(projectsIndexPath, 'utf8'));

  // Create CI/CD directory structure
  const cicdDir = path.join(__dirname, '../.github/workflows');
  const dockerDir = path.join(__dirname, '../docker');

  [cicdDir, dockerDir].forEach(dir => {
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
    `\n${colors.cyan}🔄 Generating CI/CD for ${allServices.length} services...${colors.reset}`
  );

  // Generate individual service workflows
  for (const serviceName of allServices) {
    try {
      const serviceType = isApp(serviceName) ? 'app' : 'service';
      const workflow = generateGitHubWorkflow(serviceName, serviceType);

      // Write GitHub Actions workflow
      const workflowPath = path.join(cicdDir, `${serviceName}.yml`);
      fs.writeFileSync(
        workflowPath,
        `# Auto-generated CI/CD pipeline for ${serviceName}
# Milestone 2: Enterprise Production Excellence
# Generated: ${new Date().toISOString()}

${JSON.stringify(workflow, null, 2).replace(/"/g, '"')}`
      );
      generatedFiles.push(workflowPath);

      // Generate Dockerfile for each service
      const dockerfile = generateDockerfile(serviceName, serviceType);
      const serviceDir = path.join(
        __dirname,
        `../${serviceType}s`,
        serviceName
      );

      if (fs.existsSync(serviceDir)) {
        const dockerfilePath = path.join(serviceDir, 'Dockerfile');
        fs.writeFileSync(dockerfilePath, dockerfile);
        generatedFiles.push(dockerfilePath);
      }

      processedCount++;
      console.log(
        `   ${colors.green}✅${colors.reset} ${serviceName} - CI/CD pipeline + Dockerfile`
      );
    } catch (error) {
      console.error(
        `   ${colors.red}❌${colors.reset} ${serviceName} - ${error.message}`
      );
    }
  }

  // Generate Docker Compose for local development
  const dockerCompose = generateDockerCompose(allServices);
  const dockerComposePath = path.join(dockerDir, 'docker-compose.yml');
  fs.writeFileSync(
    dockerComposePath,
    `# Auto-generated Docker Compose for Codai Ecosystem
# Milestone 2: Enterprise Production Excellence  
# Generated: ${new Date().toISOString()}

${JSON.stringify(dockerCompose, null, 2).replace(/"/g, '"')}`
  );
  generatedFiles.push(dockerComposePath);

  console.log(`\n${colors.magenta}🎯 CI/CD Generation Summary:${colors.reset}`);
  console.log(
    `${colors.green}✅ Services processed: ${processedCount}/${allServices.length}${colors.reset}`
  );
  console.log(
    `${colors.green}✅ Files generated: ${generatedFiles.length}${colors.reset}`
  );
  console.log(
    `${colors.cyan}📁 Workflows directory: ${cicdDir}${colors.reset}`
  );
  console.log(`${colors.cyan}🐳 Docker directory: ${dockerDir}${colors.reset}`);

  return {
    success: processedCount === allServices.length,
    processedCount,
    totalServices: allServices.length,
    generatedFiles: generatedFiles.length,
    cicdDir,
    dockerDir,
  };
}

// Execute main function
generateCICD()
  .then(result => {
    if (result.success) {
      console.log(
        `\n${colors.bright}${colors.green}🚀 CI/CD pipelines complete!${colors.reset}`
      );
      console.log(
        `${colors.green}Ready for next phase of Milestone 2${colors.reset}`
      );
      process.exit(0);
    } else {
      console.error(`\n${colors.red}❌ CI/CD generation failed${colors.reset}`);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`\n${colors.red}❌ Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
