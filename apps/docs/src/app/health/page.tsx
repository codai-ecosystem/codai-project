import React from 'react'
import { HealthStatus } from '@/components/health/health-status'

export default function HealthPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <HealthStatus 
        serviceName="${APP_NAME}"
        port="${PORT}"
      />
    </main>
  )
}

