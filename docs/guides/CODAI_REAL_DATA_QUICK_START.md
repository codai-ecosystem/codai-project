# 🚀 CODAI Real Data Migration - Quick Start Guide

## Immediate Actions (Next 24 Hours)

### 1. Install Required Dependencies
```bash
cd apps/codai
pnpm add prisma @prisma/client pg @types/pg systeminformation pidusage node-cron
```

### 2. Create Real System Monitor
```typescript
// lib/monitoring/SystemMonitor.ts
import { performance } from 'perf_hooks'
import * as si from 'systeminformation'
import { execSync } from 'child_process'

export class SystemMonitor {
  async getActiveUsers(): Promise<number> {
    try {
      // Count unique active sessions from the last 15 minutes
      // For now, use a simple heuristic based on process count
      const users = await si.users()
      return users.length || 1 // At least the current user
    } catch (error) {
      console.error('Error getting active users:', error)
      return 1
    }
  }

  async getCPUUsage(): Promise<number> {
    try {
      const cpu = await si.currentLoad()
      return Math.round(cpu.currentload)
    } catch (error) {
      console.error('Error getting CPU usage:', error)
      return 0
    }
  }

  async getMemoryUsage(): Promise<number> {
    try {
      const mem = await si.mem()
      return Math.round((mem.used / mem.total) * 100)
    } catch (error) {
      console.error('Error getting memory usage:', error)
      return 0
    }
  }

  async getDiskUsage(): Promise<number> {
    try {
      const disks = await si.fsSize()
      if (disks.length > 0) {
        const mainDisk = disks[0]
        return Math.round((mainDisk.used / mainDisk.size) * 100)
      }
      return 0
    } catch (error) {
      console.error('Error getting disk usage:', error)
      return 0
    }
  }

  async getNetworkActivity(): Promise<number> {
    try {
      const networkStats = await si.networkStats()
      if (networkStats.length > 0) {
        const totalBytes = networkStats.reduce((sum, iface) => 
          sum + iface.rx_bytes + iface.tx_bytes, 0
        )
        // Convert to MB/s (simplified)
        return Math.round(totalBytes / (1024 * 1024))
      }
      return 0
    } catch (error) {
      console.error('Error getting network activity:', error)
      return 0
    }
  }

  async getSystemUptime(): Promise<number> {
    try {
      const time = await si.time()
      return time.uptime
    } catch (error) {
      console.error('Error getting system uptime:', error)
      return 0
    }
  }
}
```

### 3. Create Real Service Monitor
```typescript
// lib/monitoring/ServiceMonitor.ts
import { createConnection } from 'net'
import { execSync } from 'child_process'

export class ServiceMonitor {
  async checkServiceHealth(port: number): Promise<'running' | 'stopped' | 'error'> {
    return new Promise((resolve) => {
      const socket = createConnection(port, 'localhost')
      
      const timeout = setTimeout(() => {
        socket.destroy()
        resolve('stopped')
      }, 3000)
      
      socket.on('connect', () => {
        clearTimeout(timeout)
        socket.destroy()
        resolve('running')
      })
      
      socket.on('error', () => {
        clearTimeout(timeout)
        resolve('stopped')
      })
    })
  }

  async getServiceUptime(port: number): Promise<string> {
    try {
      // Try to get process info for the port
      const command = process.platform === 'win32' 
        ? `netstat -ano | findstr :${port}`
        : `lsof -ti :${port}`
      
      const result = execSync(command, { encoding: 'utf8', timeout: 5000 })
      
      if (result.trim()) {
        // If process is found, return active status
        return 'Active'
      }
    } catch (error) {
      // Process not found or error occurred
    }
    
    return 'Unknown'
  }
}
```

### 4. Replace System Metrics API (Immediate)
```typescript
// app/api/system-metrics/route.ts - REPLACE ENTIRELY
import { NextResponse } from 'next/server'
import { SystemMonitor } from '../../../lib/monitoring/SystemMonitor'
import { ServiceMonitor } from '../../../lib/monitoring/ServiceMonitor'

export interface SystemMetrics {
  activeUsers: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkActivity: number
  systemUptime: number
  serviceStatus: {
    name: string
    status: 'running' | 'stopped' | 'error'
    port: number
    uptime: string
  }[]
}

const systemMonitor = new SystemMonitor()
const serviceMonitor = new ServiceMonitor()

export async function GET() {
  try {
    // Collect real system metrics
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

    // Check real service status
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

    const metrics: SystemMetrics = {
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

## Priority Implementation Order

### Week 1: Core Infrastructure
1. ✅ **System Monitoring** (Above implementation)
2. **Project Discovery Service**
3. **Database Schema Setup**

### Week 2: API Replacements
1. **Replace System Metrics API** ⬆️ (Ready to implement above)
2. **Replace Projects API with real file system scanning**
3. **Add real-time service health monitoring**

### Week 3: Frontend Integration
1. **Update dashboard with real data hooks**
2. **Remove all hardcoded values from components**
3. **Add proper error handling and loading states**

### Week 4: Testing & Validation
1. **Comprehensive testing of real data flows**
2. **Performance optimization**
3. **Documentation updates**

## Quick Wins (Next 2 Hours)

### 1. Create Monitoring Directory
```bash
mkdir -p apps/codai/lib/monitoring
```

### 2. Install System Information Package
```bash
cd apps/codai && pnpm add systeminformation
```

### 3. Replace System Metrics API
- Copy the SystemMonitor and ServiceMonitor classes above
- Replace the existing `/api/system-metrics/route.ts` with real implementation
- Test immediately to see real system data

### 4. Immediate Validation
```bash
# Test the new API
curl http://localhost:4030/api/system-metrics

# Should return real system metrics instead of random numbers
```

## Environment Variables Needed
```bash
# Add to .env.local
DATABASE_URL="postgresql://localhost:5432/codai"
MONITORING_INTERVAL=30000
SERVICE_DISCOVERY_ENABLED=true
SERVICE_PORTS="4030,4031,4033,4065,4081"
WORKSPACE_ROOT="/path/to/your/workspace"
```

## Testing Real Data
```typescript
// Quick test script - save as test-real-data.js
const fetch = require('node-fetch')

async function testRealData() {
  try {
    const response = await fetch('http://localhost:4030/api/system-metrics')
    const data = await response.json()
    
    console.log('Real System Metrics:')
    console.log(`CPU Usage: ${data.cpuUsage}%`)
    console.log(`Memory Usage: ${data.memoryUsage}%`)
    console.log(`Active Users: ${data.activeUsers}`)
    console.log(`Services: ${data.serviceStatus.length} monitored`)
    
    // Verify it's not random data by calling twice
    const response2 = await fetch('http://localhost:4030/api/system-metrics')
    const data2 = await response2.json()
    
    console.log('\nValidation - values should be similar:')
    console.log(`CPU: ${data.cpuUsage}% vs ${data2.cpuUsage}%`)
    console.log(`Memory: ${data.memoryUsage}% vs ${data2.memoryUsage}%`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testRealData()
```

Start with the SystemMonitor implementation above - it will immediately replace all the `Math.random()` calls with real system data! 🚀
