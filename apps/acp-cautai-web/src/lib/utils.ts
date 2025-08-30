import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }
  
  const seconds = Math.floor(milliseconds / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export function getSystemStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'online':
    case 'active':
      return 'text-success-600 bg-success-50 border-success-200'
    case 'warning':
    case 'degraded':
      return 'text-warning-600 bg-warning-50 border-warning-200'
    case 'critical':
    case 'error':
    case 'offline':
      return 'text-danger-600 bg-danger-50 border-danger-200'
    default:
      return 'text-muted-foreground bg-muted border-border'
  }
}

export function isMasterAdmin(email: string | null | undefined): boolean {
  const masterAdminEmail = process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL || 'vladulescu.catalin@gmail.com'
  return email === masterAdminEmail
}