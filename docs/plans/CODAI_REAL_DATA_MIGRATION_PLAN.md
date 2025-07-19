# 🔄 CODAI Real Data Migration Plan

## Executive Summary

This comprehensive plan details the replacement of all mock data, placeholders, and hardcoded values in the CODAI platform with real data sources and connections. The migration will transform CODAI from a demo application to a fully functional production system.

## 📊 Current Mock Data Audit

### 1. **API Endpoints with Mock Data**

#### System Metrics API (`/api/system-metrics`)
**Current Issues:**
- Random number generation for all metrics
- Hardcoded service list
- Fake uptime calculations
- No real system monitoring

**Mock Data Found:**
```typescript
// Random generation examples
Math.floor(Math.random() * 50) + 10  // Active users
Math.floor(Math.random() * 30) + 10  // CPU usage
Math.floor(Math.random() * 40) + 30  // Memory usage
86400 + Math.floor(Math.random() * 3600)  // Uptime
```

#### Projects API (`/api/projects`)
**Current Issues:**
- Static hardcoded project array
- Fixed project metadata
- No real file system integration
- Fake timestamps

**Mock Data Found:**
```typescript
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'CODAI Platform',
    type: 'app',
    language: 'TypeScript',
    framework: 'Next.js',
    status: 'active',
    lastModified: new Date(),
    size: '25.4 MB',
    description: 'AI-powered development platform'
  }
  // ... more hardcoded entries
]
```

### 2. **Frontend Components with Mock Data**

#### Main Dashboard (`app/page.tsx`)
- Static ecosystem stats
- Hardcoded feature cards
- Fixed metric calculations
- Placeholder timestamps

#### Service Classes (`lib/services/CodaiService.ts`)
```typescript
// Mock performance data
totalRequests: Math.floor(Math.random() * 1000) + 100,
averageResponseTime: Math.floor(Math.random() * 500) + 50,
successRate: 0.95 + Math.random() * 0.05
```

### 3. **Test Files with Production Leakage**
- Mock data patterns used in actual components
- Hardcoded values in production code
- Placeholder text in UI components

## 🎯 Migration Strategy

### Phase 1: Infrastructure Setup (Week 1-2)

#### 1.1 Database Integration
```typescript
// Create real database schemas
interface SystemMetricsSchema {
  id: string
  timestamp: Date
  activeUsers: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkActivity: number
  systemUptime: number
  collectedAt: Date
}

interface ProjectSchema {
  id: string
  name: string
  path: string
  type: 'app' | 'package'
  language: string
  framework: string
  status: 'active' | 'maintenance' | 'archived'
  createdAt: Date
  lastModified: Date
  size: number // in bytes
  gitUrl?: string
  gitBranch?: string
  gitCommits?: number
  dependencies: string[]
  devDependencies: string[]
  scripts: Record<string, string>
  author?: string
  version?: string
  description?: string
}
```

#### 1.2 System Monitoring Setup
```typescript
// Real system metrics collection
import { performance } from 'perf_hooks'
import { cpuUsage, memoryUsage } from 'process'
import { execSync } from 'child_process'
import { statSync } from 'fs'

class SystemMonitor {
  async getActiveUsers(): Promise<number> {
    // Real implementation: Check active sessions, connections, or auth tokens
    const activeSessionsQuery = `
      SELECT COUNT(DISTINCT user_id) 
      FROM active_sessions 
      WHERE last_seen > NOW() - INTERVAL 15 MINUTE
    `
    return await db.query(activeSessionsQuery)
  }

  async getCPUUsage(): Promise<number> {
    // Real implementation using Node.js process metrics
    const usage = process.cpuUsage()
    return (usage.user + usage.system) / 1000000 // Convert to percentage
  }

  async getMemoryUsage(): Promise<number> {
    // Real implementation
    const used = process.memoryUsage()
    return (used.heapUsed / used.heapTotal) * 100
  }

  async getDiskUsage(): Promise<number> {
    // Real implementation using system commands
    const stats = execSync('df -h /', { encoding: 'utf8' })
    // Parse actual disk usage from df command
    return parseFloat(stats.split('\n')[1].split(/\s+/)[4])
  }

  async getNetworkActivity(): Promise<number> {
    // Real implementation: Monitor network interfaces
    const stats = execSync('cat /proc/net/dev', { encoding: 'utf8' })
    // Parse network statistics
    return this.parseNetworkStats(stats)
  }

  async getSystemUptime(): Promise<number> {
    // Real implementation
    const uptime = execSync('uptime -s', { encoding: 'utf8' })
    return Math.floor((Date.now() - new Date(uptime).getTime()) / 1000)
  }
}
```

### Phase 2: Real Data Integration (Week 3-4)

#### 2.1 File System Project Discovery
```typescript
// Real project detection and analysis
import { readdirSync, statSync, readFileSync } from 'fs'
import { join } from 'path'

class ProjectDiscovery {
  async scanWorkspace(basePath: string): Promise<Project[]> {
    const projects: Project[] = []
    const workspaceDirs = ['apps', 'packages', 'libs', 'services']
    
    for (const dir of workspaceDirs) {
      const dirPath = join(basePath, dir)
      if (existsSync(dirPath)) {
        const items = readdirSync(dirPath)
        
        for (const item of items) {
          const itemPath = join(dirPath, item)
          const stats = statSync(itemPath)
          
          if (stats.isDirectory()) {
            const project = await this.analyzeProject(itemPath)
            if (project) projects.push(project)
          }
        }
      }
    }
    
    return projects
  }

  async analyzeProject(projectPath: string): Promise<Project | null> {
    const packageJsonPath = join(projectPath, 'package.json')
    
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      
      return {
        id: this.generateProjectId(projectPath),
        name: packageJson.name || basename(projectPath),
        path: projectPath,
        type: this.detectProjectType(packageJson),
        language: this.detectLanguage(projectPath),
        framework: this.detectFramework(packageJson),
        status: this.determineStatus(projectPath),
        createdAt: this.getProjectCreationDate(projectPath),
        lastModified: statSync(projectPath).mtime,
        size: await this.calculateProjectSize(projectPath),
        gitUrl: packageJson.repository?.url,
        gitBranch: await this.getCurrentGitBranch(projectPath),
        gitCommits: await this.getGitCommitCount(projectPath),
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        scripts: packageJson.scripts || {},
        author: packageJson.author,
        version: packageJson.version,
        description: packageJson.description
      }
    }
    
    return null
  }

  private detectProjectType(packageJson: any): 'app' | 'package' {
    // Real detection logic
    if (packageJson.scripts?.dev || packageJson.scripts?.start) return 'app'
    if (packageJson.main || packageJson.exports) return 'package'
    return 'package'
  }

  private detectLanguage(projectPath: string): string {
    // Real language detection
    const tsConfigExists = existsSync(join(projectPath, 'tsconfig.json'))
    const hasTypescript = readdirSync(projectPath).some(file => 
      file.endsWith('.ts') || file.endsWith('.tsx')
    )
    
    if (tsConfigExists || hasTypescript) return 'TypeScript'
    
    const hasJavaScript = readdirSync(projectPath).some(file => 
      file.endsWith('.js') || file.endsWith('.jsx')
    )
    
    if (hasJavaScript) return 'JavaScript'
    
    return 'Unknown'
  }

  private detectFramework(packageJson: any): string {
    // Real framework detection
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    if (dependencies.next) return 'Next.js'
    if (dependencies.react) return 'React'
    if (dependencies.vue) return 'Vue.js'
    if (dependencies.angular) return 'Angular'
    if (dependencies.express) return 'Express'
    if (dependencies.fastify) return 'Fastify'
    
    return 'Node.js'
  }
}
```

#### 2.2 Real-time Service Monitoring
```typescript
// Real service health checking
import { createConnection } from 'net'

class ServiceMonitor {
  async checkServiceHealth(port: number): Promise<'running' | 'stopped' | 'error'> {
    return new Promise((resolve) => {
      const socket = createConnection(port, 'localhost')
      
      socket.on('connect', () => {
        socket.destroy()
        resolve('running')
      })
      
      socket.on('error', () => {
        resolve('stopped')
      })
      
      socket.setTimeout(5000, () => {
        socket.destroy()
        resolve('error')
      })
    })
  }

  async getServiceUptime(port: number): Promise<string> {
    // Real uptime calculation based on process monitoring
    try {
      const pm2List = execSync('pm2 jlist', { encoding: 'utf8' })
      const processes = JSON.parse(pm2List)
      const service = processes.find(p => p.pm2_env?.PORT === port)
      
      if (service && service.pm2_env?.created_at) {
        const uptime = Date.now() - service.pm2_env.created_at
        return this.formatUptime(uptime)
      }
    } catch (error) {
      console.error('Error getting service uptime:', error)
    }
    
    return 'Unknown'
  }

  private formatUptime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }
}
```

### Phase 3: API Endpoint Replacement (Week 5-6)

#### 3.1 Updated System Metrics API
```typescript
// Replace: app/api/system-metrics/route.ts
import { NextResponse } from 'next/server'
import { SystemMonitor } from '../../../lib/monitoring/SystemMonitor'
import { ServiceMonitor } from '../../../lib/monitoring/ServiceMonitor'

const systemMonitor = new SystemMonitor()
const serviceMonitor = new ServiceMonitor()

export async function GET() {
  try {
    // Real data collection
    const [
      activeUsers,
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkActivity,
      systemUptime
    ] = await Promise.all([
      systemMonitor.getActiveUsers(),
      systemMonitor.getCPUUsage(),
      systemMonitor.getMemoryUsage(),
      systemMonitor.getDiskUsage(),
      systemMonitor.getNetworkActivity(),
      systemMonitor.getSystemUptime()
    ])

    // Real service monitoring
    const services = [
      { name: 'CODAI Platform', port: 4030 },
      { name: 'MEMORAI Core', port: 4031 },
      { name: 'BANCAI Service', port: 4033 },
      { name: 'STOCAI Engine', port: 4065 },
      { name: 'PREZENTAI Service', port: 4081 }
    ]

    const serviceStatuses = await Promise.all(
      services.map(async (service) => ({
        name: service.name,
        status: await serviceMonitor.checkServiceHealth(service.port),
        port: service.port,
        uptime: await serviceMonitor.getServiceUptime(service.port)
      }))
    )

    const metrics = {
      activeUsers,
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkActivity,
      systemUptime,
      serviceStatus: serviceStatuses
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error getting system metrics:', error)
    return NextResponse.json(
      { error: 'Failed to get system metrics' },
      { status: 500 }
    )
  }
}
```

#### 3.2 Updated Projects API
```typescript
// Replace: app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { ProjectDiscovery } from '../../../lib/discovery/ProjectDiscovery'
import { GitManager } from '../../../lib/git/GitManager'

const projectDiscovery = new ProjectDiscovery()
const gitManager = new GitManager()

export async function GET() {
  try {
    const workspacePath = process.cwd()
    const projects = await projectDiscovery.scanWorkspace(workspacePath)
    
    // Enrich with Git information
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => ({
        ...project,
        gitBranch: await gitManager.getCurrentBranch(project.path),
        gitCommits: await gitManager.getCommitCount(project.path),
        gitStatus: await gitManager.getStatus(project.path)
      }))
    )

    const activeProjects = enrichedProjects.filter(p => p.status === 'active')

    return NextResponse.json({
      projects: enrichedProjects,
      totalProjects: enrichedProjects.length,
      activeProjects: activeProjects.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting projects:', error)
    return NextResponse.json(
      { error: 'Failed to get projects' },
      { status: 500 }
    )
  }
}
```

### Phase 4: Configuration and Environment Setup (Week 7)

#### 4.1 Environment Configuration
```typescript
// lib/config/environment.ts
export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/codai',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20')
  },
  monitoring: {
    interval: parseInt(process.env.MONITORING_INTERVAL || '30000'), // 30 seconds
    retention: parseInt(process.env.METRICS_RETENTION_DAYS || '30')
  },
  services: {
    discovery: {
      enabled: process.env.SERVICE_DISCOVERY_ENABLED === 'true',
      ports: process.env.SERVICE_PORTS?.split(',').map(Number) || [4030, 4031, 4033, 4065, 4081]
    }
  },
  workspace: {
    root: process.env.WORKSPACE_ROOT || process.cwd(),
    excludeDirs: process.env.EXCLUDE_DIRS?.split(',') || ['node_modules', '.git', 'dist', 'build']
  }
}
```

#### 4.2 Database Schema Setup
```sql
-- Database migrations for real data storage
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active_users INTEGER NOT NULL,
  cpu_usage DECIMAL(5,2) NOT NULL,
  memory_usage DECIMAL(5,2) NOT NULL,
  disk_usage DECIMAL(5,2) NOT NULL,
  network_activity DECIMAL(10,2) NOT NULL,
  system_uptime BIGINT NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('app', 'package')),
  language VARCHAR(100),
  framework VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE,
  size_bytes BIGINT,
  git_url TEXT,
  git_branch VARCHAR(255),
  git_commits INTEGER,
  dependencies JSONB DEFAULT '[]',
  dev_dependencies JSONB DEFAULT '[]',
  scripts JSONB DEFAULT '{}',
  author VARCHAR(255),
  version VARCHAR(50),
  description TEXT
);

CREATE TABLE service_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'stopped', 'error')),
  uptime_start TIMESTAMP WITH TIME ZONE,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_time DECIMAL(8,2)
);

-- Indexes for performance
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_service_status_port ON service_status(port);
```

### Phase 5: Frontend Real Data Integration (Week 8)

#### 5.1 Dashboard Real Data Hooks
```typescript
// hooks/useRealTimeMetrics.ts
import { useState, useEffect } from 'react'

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/system-metrics')
        if (!response.ok) throw new Error('Failed to fetch metrics')
        const data = await response.json()
        setMetrics(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchMetrics()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)

    return () => clearInterval(interval)
  }, [])

  return { metrics, loading, error }
}
```

#### 5.2 Project Real Data Integration
```typescript
// hooks/useProjects.ts
import { useState, useEffect } from 'react'
import { Project } from '../types/project'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    packages: 0,
    apps: 0
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()
        
        setProjects(data.projects)
        setStats({
          total: data.totalProjects,
          active: data.activeProjects,
          packages: data.projects.filter(p => p.type === 'package').length,
          apps: data.projects.filter(p => p.type === 'app').length
        })
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }

    fetchProjects()
  }, [])

  return { projects, stats }
}
```

## 🔧 Implementation Steps

### Step 1: Backup and Preparation
```bash
# Create backup of current mock implementations
mkdir -p backup/mock-implementations
cp apps/codai/app/api/system-metrics/route.ts backup/mock-implementations/
cp apps/codai/app/api/projects/route.ts backup/mock-implementations/
cp apps/codai/lib/services/CodaiService.ts backup/mock-implementations/
```

### Step 2: Database Setup
```bash
# Install database dependencies
pnpm add prisma @prisma/client pg @types/pg

# Initialize Prisma
npx prisma init

# Create and run migrations
npx prisma migrate dev --name initial-schema
```

### Step 3: Monitoring Infrastructure
```bash
# Install monitoring dependencies
pnpm add node-cron systeminformation pidusage

# Create monitoring services
mkdir -p apps/codai/lib/monitoring
```

### Step 4: Replace Mock APIs
```bash
# Systematically replace each API endpoint
# Test each replacement thoroughly
# Maintain backward compatibility during transition
```

### Step 5: Frontend Integration
```bash
# Update React components to use real data
# Remove hardcoded values
# Add proper loading and error states
```

## 📈 Testing Strategy

### Unit Tests
```typescript
// tests/monitoring/SystemMonitor.test.ts
describe('SystemMonitor', () => {
  test('should return real CPU usage', async () => {
    const monitor = new SystemMonitor()
    const cpuUsage = await monitor.getCPUUsage()
    
    expect(cpuUsage).toBeGreaterThanOrEqual(0)
    expect(cpuUsage).toBeLessThanOrEqual(100)
    expect(typeof cpuUsage).toBe('number')
  })
})
```

### Integration Tests
```typescript
// tests/api/system-metrics.test.ts
describe('/api/system-metrics', () => {
  test('should return real system data', async () => {
    const response = await fetch('/api/system-metrics')
    const data = await response.json()
    
    expect(data.activeUsers).toBeGreaterThanOrEqual(0)
    expect(data.cpuUsage).toBeGreaterThanOrEqual(0)
    expect(data.serviceStatus).toBeInstanceOf(Array)
  })
})
```

## 🚀 Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Monitoring services deployed
- [ ] Real APIs tested and validated
- [ ] Frontend components updated
- [ ] Error handling implemented
- [ ] Performance monitoring added
- [ ] Documentation updated
- [ ] Team training completed

## 🔍 Validation Criteria

### Data Accuracy
- System metrics reflect actual server state
- Project data matches file system reality
- Service status shows real service health

### Performance
- API response times under 500ms
- Real-time updates working smoothly
- Database queries optimized

### Reliability
- Graceful handling of service failures
- Proper error reporting and logging
- Fallback mechanisms for critical data

## 📚 Documentation Updates

1. **API Documentation**: Update all endpoint documentation with real data schemas
2. **Configuration Guide**: Create comprehensive environment setup guide
3. **Monitoring Guide**: Document system monitoring and alerting setup
4. **Developer Guide**: Update development workflow with real data considerations

## 🎯 Success Metrics

- **Zero Mock Data**: No Math.random(), hardcoded arrays, or placeholder values in production code
- **Real-time Accuracy**: System metrics within 5% of actual values
- **Performance**: 99.9% API uptime with sub-500ms response times
- **Developer Experience**: Seamless development workflow with real data

This migration plan transforms CODAI from a demonstration platform to a production-ready development environment with real data integration, proper monitoring, and scalable architecture.
