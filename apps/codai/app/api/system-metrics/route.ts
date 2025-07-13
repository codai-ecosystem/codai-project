import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

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

function getActiveUsers(): number {
  try {
    // Get active network connections for our app ports
    const netstatOutput = execSync('netstat -an | findstr ":40"', { encoding: 'utf8' })
    const connections = netstatOutput.split('\n').filter(line =>
      line.includes('ESTABLISHED') && line.includes(':40')
    )
    return Math.max(1, connections.length)
  } catch {
    return 1
  }
}

function getSystemPerformance(): { cpu: number, memory: number, disk: number } {
  try {
    // Get CPU usage
    const cpuOutput = execSync('wmic cpu get loadpercentage /value', { encoding: 'utf8' })
    const cpuMatch = cpuOutput.match(/LoadPercentage=(\d+)/)
    const cpu = cpuMatch ? parseInt(cpuMatch[1]) : 0

    // Get memory usage
    const memOutput = execSync('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value', { encoding: 'utf8' })
    const totalMatch = memOutput.match(/TotalVisibleMemorySize=(\d+)/)
    const freeMatch = memOutput.match(/FreePhysicalMemory=(\d+)/)

    const total = totalMatch ? parseInt(totalMatch[1]) : 1
    const free = freeMatch ? parseInt(freeMatch[1]) : 0
    const memory = Math.round(((total - free) / total) * 100)

    // Get disk usage (C: drive)
    const diskOutput = execSync('wmic logicaldisk get size,freespace,caption /value | findstr "C:"', { encoding: 'utf8' })
    const diskSizeMatch = diskOutput.match(/Size=(\d+)/)
    const diskFreeMatch = diskOutput.match(/FreeSpace=(\d+)/)

    const diskTotal = diskSizeMatch ? parseInt(diskSizeMatch[1]) : 1
    const diskFree = diskFreeMatch ? parseInt(diskFreeMatch[1]) : 0
    const disk = Math.round(((diskTotal - diskFree) / diskTotal) * 100)

    return { cpu, memory, disk }
  } catch {
    return { cpu: 0, memory: 0, disk: 0 }
  }
}

function getNetworkActivity(): number {
  try {
    const netOutput = execSync('wmic path Win32_PerfRawData_Tcpip_NetworkInterface get BytesTotalPerSec /value', { encoding: 'utf8' })
    const matches = netOutput.match(/BytesTotalPerSec=(\d+)/g)
    if (matches && matches.length > 0) {
      const total = matches.reduce((sum, match) => {
        const value = match.split('=')[1]
        return sum + parseInt(value || '0')
      }, 0)
      return Math.round(total / 1024 / 1024) // Convert to MB/s
    }
    return 0
  } catch {
    return 0
  }
}

function getSystemUptime(): number {
  try {
    const uptimeOutput = execSync('wmic os get lastbootuptime /value', { encoding: 'utf8' })
    const match = uptimeOutput.match(/LastBootUpTime=(\d{14})/)
    if (match) {
      const bootTime = new Date(
        parseInt(match[1].substring(0, 4)), // year
        parseInt(match[1].substring(4, 6)) - 1, // month (0-indexed)
        parseInt(match[1].substring(6, 8)), // day
        parseInt(match[1].substring(8, 10)), // hour
        parseInt(match[1].substring(10, 12)), // minute
        parseInt(match[1].substring(12, 14)) // second
      )
      return Math.round((Date.now() - bootTime.getTime()) / 1000) // seconds
    }
    return 0
  } catch {
    return 0
  }
}

function checkServiceStatus(port: number): Promise<'running' | 'stopped' | 'error'> {
  return new Promise((resolve) => {
    try {
      const result = execSync(`netstat -an | findstr ":${port}"`, { encoding: 'utf8' })
      if (result.includes('LISTENING')) {
        resolve('running')
      } else {
        resolve('stopped')
      }
    } catch {
      resolve('error')
    }
  })
}

export async function GET() {
  try {
    const performance = getSystemPerformance()

    // Check status of key services
    const services = [
      { name: 'CODAI Platform', port: 4030 },
      { name: 'Identity Service', port: 4033 },
      { name: 'Memory Service', port: 4035 },
      { name: 'Development Tools', port: 4037 }
    ]

    const serviceStatuses = await Promise.all(
      services.map(async (service) => ({
        name: service.name,
        status: await checkServiceStatus(service.port),
        port: service.port,
        uptime: 'Active'
      }))
    )

    const metrics: SystemMetrics = {
      activeUsers: getActiveUsers(),
      cpuUsage: performance.cpu,
      memoryUsage: performance.memory,
      diskUsage: performance.disk,
      networkActivity: getNetworkActivity(),
      systemUptime: getSystemUptime(),
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
