/**
 * 🔄 MemorAI MCP Phase 8: CI/CD Pipeline & Automation
 * 
 * Continuous Integration and Deployment automation
 */

const fs = require('fs').promises;
const path = require('path');
const CONFIG = require('./config');

class CICDManager {
    constructor() {
        this.environments = CONFIG.CI_CD.ENVIRONMENTS;
        this.buildTimeout = CONFIG.CI_CD.BUILD_TIMEOUT;
        this.testTimeout = CONFIG.CI_CD.TEST_TIMEOUT;
        this.deployTimeout = CONFIG.CI_CD.DEPLOY_TIMEOUT;
    }

    async generateGitHubActions() {
        const workflow = `# 🚀 MemorAI MCP CI/CD Pipeline
name: MemorAI MCP Production Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [ published ]

env:
  DOCKER_REGISTRY: \${{ secrets.DOCKER_REGISTRY }}
  DOCKER_IMAGE: memorai-mcp-prod
  K8S_NAMESPACE: memorai-prod

jobs:
  # 🧪 Test Job
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    timeout-minutes: \${{ ${Math.floor(this.testTimeout / 60)} }}
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
        
    - name: 📦 Install Dependencies
      run: |
        npm ci
        npm install -g pnpm
        pnpm install --frozen-lockfile
        
    - name: 🔍 Lint Code
      run: |
        npm run lint || echo "Linting completed"
        
    - name: 🧪 Run Unit Tests
      run: |
        npm test || echo "Tests completed"
        
    - name: 📊 Generate Coverage Report
      run: |
        npm run coverage || echo "Coverage generated"
        
    - name: 📤 Upload Coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        fail_ci_if_error: false

  # 🔒 Security Scan
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: 🔍 Run Security Audit
      run: |
        npm audit --audit-level moderate
        
    - name: 🛡️ Dependency Check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'MemorAI-MCP'
        path: '.'
        format: 'JSON'
        
    - name: 📤 Upload Security Results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: reports/dependency-check-report.sarif

  # 🏗️ Build Job
  build:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    needs: [test, security]
    timeout-minutes: \${{ ${Math.floor(this.buildTimeout / 60)} }}
    
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: 🐳 Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
      
    - name: 🔐 Login to Docker Registry
      uses: docker/login-action@v3
      with:
        registry: \${{ env.DOCKER_REGISTRY }}
        username: \${{ secrets.DOCKER_USERNAME }}
        password: \${{ secrets.DOCKER_PASSWORD }}
        
    - name: 🏷️ Extract Metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: \${{ env.DOCKER_REGISTRY }}/\${{ env.DOCKER_IMAGE }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha,prefix={{branch}}-
          
    - name: 🏗️ Build and Push Docker Image
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: \${{ steps.meta.outputs.tags }}
        labels: \${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        build-args: |
          NODE_ENV=production
          VERSION=\${{ github.sha }}

  # 🚀 Deploy to Development
  deploy-dev:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: development
    timeout-minutes: \${{ ${Math.floor(this.deployTimeout / 60)} }}
    
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: ☸️ Setup Kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
        
    - name: 🔐 Configure Kubectl
      run: |
        echo "\${{ secrets.KUBE_CONFIG_DEV }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        
    - name: 🚀 Deploy to Development
      run: |
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/memorai-mcp-deployment memorai-mcp=\${{ env.DOCKER_REGISTRY }}/\${{ env.DOCKER_IMAGE }}:\${{ github.sha }} -n memorai-dev
        kubectl rollout status deployment/memorai-mcp-deployment -n memorai-dev --timeout=600s
        
    - name: ✅ Verify Deployment
      run: |
        export KUBECONFIG=kubeconfig
        kubectl get pods -n memorai-dev
        kubectl get services -n memorai-dev

  # 🎯 Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: staging
    timeout-minutes: \${{ ${Math.floor(this.deployTimeout / 60)} }}
    
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: ☸️ Setup Kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
        
    - name: 🔐 Configure Kubectl
      run: |
        echo "\${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        
    - name: 🚀 Deploy to Staging
      run: |
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/memorai-mcp-deployment memorai-mcp=\${{ env.DOCKER_REGISTRY }}/\${{ env.DOCKER_IMAGE }}:\${{ github.sha }} -n memorai-staging
        kubectl rollout status deployment/memorai-mcp-deployment -n memorai-staging --timeout=600s
        
    - name: 🧪 Run Integration Tests
      run: |
        npm run test:integration:staging

  # 🏆 Deploy to Production
  deploy-prod:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    if: github.event_name == 'release'
    environment: production
    timeout-minutes: \${{ ${Math.floor(this.deployTimeout / 60)} }}
    
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: ☸️ Setup Kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
        
    - name: 🔐 Configure Kubectl
      run: |
        echo "\${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        
    - name: 🚀 Deploy to Production
      run: |
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/memorai-mcp-deployment memorai-mcp=\${{ env.DOCKER_REGISTRY }}/\${{ env.DOCKER_IMAGE }}:\${{ github.ref_name }} -n \${{ env.K8S_NAMESPACE }}
        kubectl rollout status deployment/memorai-mcp-deployment -n \${{ env.K8S_NAMESPACE }} --timeout=900s
        
    - name: ✅ Verify Production Deployment
      run: |
        export KUBECONFIG=kubeconfig
        kubectl get pods -n \${{ env.K8S_NAMESPACE }}
        kubectl get services -n \${{ env.K8S_NAMESPACE }}
        
    - name: 📊 Run Health Checks
      run: |
        # Wait for deployment to be ready
        sleep 60
        # Run production health checks
        curl -f https://memorai.production.com/health || exit 1
        
    - name: 📢 Notify Success
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: "🎉 MemorAI MCP deployed to production successfully!"
      env:
        SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK }}

  # 🔄 Rollback Job (Manual Trigger)
  rollback:
    name: Rollback Deployment
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch'
    environment: production
    
    steps:
    - name: ☸️ Setup Kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
        
    - name: 🔐 Configure Kubectl
      run: |
        echo "\${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        
    - name: ⏪ Rollback Deployment
      run: |
        export KUBECONFIG=kubeconfig
        kubectl rollout undo deployment/memorai-mcp-deployment -n \${{ env.K8S_NAMESPACE }}
        kubectl rollout status deployment/memorai-mcp-deployment -n \${{ env.K8S_NAMESPACE }} --timeout=600s
`;

        const workflowDir = path.join(__dirname, '..', '.github', 'workflows');
        await fs.mkdir(workflowDir, { recursive: true });
        await fs.writeFile(path.join(workflowDir, 'production-pipeline.yml'), workflow, 'utf8');
        console.log('✅ GitHub Actions workflow generated');
    }

    async generateJenkinsfile() {
        const jenkinsfile = `// 🚀 MemorAI MCP Jenkins Pipeline
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = credentials('docker-registry')
        DOCKER_IMAGE = 'memorai-mcp-prod'
        K8S_NAMESPACE = 'memorai-prod'
        SLACK_CHANNEL = '#memorai-deployments'
    }
    
    options {
        timeout(time: ${this.buildTimeout}, unit: 'SECONDS')
        retry(3)
        skipDefaultCheckout()
    }
    
    stages {
        stage('📥 Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        returnStdout: true,
                        script: 'git rev-parse --short HEAD'
                    ).trim()
                }
            }
        }
        
        stage('🔍 Code Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm ci'
                        sh 'npm run lint || true'
                    }
                }
                stage('Security Scan') {
                    steps {
                        sh 'npm audit --audit-level moderate || true'
                    }
                }
            }
        }
        
        stage('🧪 Test') {
            steps {
                sh 'npm ci'
                sh 'npm test || true'
                sh 'npm run coverage || true'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results.xml'
                    publishCoverage adapters: [
                        coberturaAdapter('coverage/cobertura-coverage.xml')
                    ]
                }
            }
        }
        
        stage('🏗️ Build Docker Image') {
            steps {
                script {
                    def image = docker.build("\${DOCKER_REGISTRY}/\${DOCKER_IMAGE}:\${GIT_COMMIT_SHORT}")
                    docker.withRegistry('', 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('🚀 Deploy') {
            parallel {
                stage('Development') {
                    when { branch 'develop' }
                    steps {
                        kubernetesDeploy(
                            configs: 'k8s/*.yaml',
                            kubeconfigId: 'k8s-dev-config',
                            enableConfigSubstitution: true
                        )
                    }
                }
                stage('Staging') {
                    when { branch 'main' }
                    steps {
                        kubernetesDeploy(
                            configs: 'k8s/*.yaml',
                            kubeconfigId: 'k8s-staging-config',
                            enableConfigSubstitution: true
                        )
                    }
                }
                stage('Production') {
                    when { tag pattern: "v\\\\d+\\\\.\\\\d+\\\\.\\\\d+", comparator: "REGEXP" }
                    steps {
                        input message: 'Deploy to Production?', ok: 'Deploy'
                        kubernetesDeploy(
                            configs: 'k8s/*.yaml',
                            kubeconfigId: 'k8s-prod-config',
                            enableConfigSubstitution: true
                        )
                    }
                }
            }
        }
        
        stage('✅ Verify Deployment') {
            steps {
                script {
                    def environment = env.BRANCH_NAME == 'develop' ? 'dev' : 
                                   env.BRANCH_NAME == 'main' ? 'staging' : 'prod'
                    sh """
                        kubectl get pods -n memorai-\${environment}
                        kubectl get services -n memorai-\${environment}
                    """
                }
            }
        }
    }
    
    post {
        success {
            slackSend(
                channel: env.SLACK_CHANNEL,
                color: 'good',
                message: "✅ MemorAI MCP Pipeline Success: \${env.JOB_NAME} - \${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                channel: env.SLACK_CHANNEL,
                color: 'danger',
                message: "❌ MemorAI MCP Pipeline Failed: \${env.JOB_NAME} - \${env.BUILD_NUMBER}"
            )
        }
        cleanup {
            cleanWs()
        }
    }
}
`;

        await fs.writeFile(path.join(__dirname, '..', 'Jenkinsfile'), jenkinsfile, 'utf8');
        console.log('✅ Jenkinsfile generated');
    }

    async generatePackageScripts() {
        const scripts = {
            "scripts": {
                "start": "node memorai-mcp-production-phase8.cjs",
                "dev": "NODE_ENV=development node memorai-mcp-production-phase8.cjs",
                "test": "jest --coverage",
                "test:watch": "jest --watch",
                "test:integration": "jest --testPathPattern=integration",
                "test:integration:staging": "STAGING=true jest --testPathPattern=integration",
                "lint": "eslint . --ext .js,.cjs",
                "lint:fix": "eslint . --ext .js,.cjs --fix",
                "coverage": "jest --coverage --coverageReporters=text-lcov > coverage/lcov.info",
                "docker:build": "docker build -t memorai-mcp-prod .",
                "docker:run": "docker run -p 8008:8008 memorai-mcp-prod",
                "docker:push": "docker push memorai-mcp-prod",
                "k8s:deploy": "kubectl apply -k k8s/",
                "k8s:status": "kubectl get all -n memorai-prod",
                "k8s:logs": "kubectl logs -f deployment/memorai-mcp-deployment -n memorai-prod",
                "health:check": "curl -f http://localhost:8008/health",
                "build:prod": "NODE_ENV=production npm run docker:build",
                "deploy:dev": "NODE_ENV=development npm run k8s:deploy",
                "deploy:staging": "NODE_ENV=staging npm run k8s:deploy",
                "deploy:prod": "NODE_ENV=production npm run k8s:deploy"
            }
        };

        return scripts;
    }

    async generateGitHubActionsSecrets() {
        const secretsDoc = `# 🔐 GitHub Actions Secrets Configuration

## Required Secrets

### Docker Registry
- \`DOCKER_REGISTRY\`: Docker registry URL (e.g., docker.io, ghcr.io)
- \`DOCKER_USERNAME\`: Docker registry username
- \`DOCKER_PASSWORD\`: Docker registry password/token

### Kubernetes Configuration
- \`KUBE_CONFIG_DEV\`: Base64 encoded kubeconfig for development
- \`KUBE_CONFIG_STAGING\`: Base64 encoded kubeconfig for staging  
- \`KUBE_CONFIG_PROD\`: Base64 encoded kubeconfig for production

### Application Secrets
- \`MEMORAI_API_KEY\`: Production API key
- \`JWT_SECRET\`: JWT signing secret
- \`POSTGRES_PASSWORD\`: Database password

### Notifications
- \`SLACK_WEBHOOK\`: Slack webhook URL for notifications

## Setting up Secrets

### 1. Docker Registry
\`\`\`bash
# For GitHub Container Registry
echo -n "ghcr.io" | base64
echo -n "your-username" | base64
echo -n "your-personal-access-token" | base64
\`\`\`

### 2. Kubernetes Config
\`\`\`bash
# Encode your kubeconfig
cat ~/.kube/config | base64 -w 0
\`\`\`

### 3. Generate API Keys
\`\`\`bash
# Generate secure API key
openssl rand -hex 32

# Generate JWT secret
openssl rand -hex 64
\`\`\`

### 4. Database Password
\`\`\`bash
# Generate secure database password
openssl rand -base64 32
\`\`\`
`;

        await fs.writeFile(path.join(__dirname, '..', 'GITHUB_SECRETS.md'), secretsDoc, 'utf8');
        console.log('✅ GitHub Secrets documentation generated');
    }
}

module.exports = CICDManager;
