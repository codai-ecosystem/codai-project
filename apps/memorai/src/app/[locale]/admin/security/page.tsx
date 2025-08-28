import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { SecurityMonitoringDashboard } from '@/components/security/SecurityMonitoringDashboard'

export const metadata: Metadata = {
  title: 'Security Monitoring - MemorAI Admin',
  description: 'Real-time security monitoring and threat detection dashboard',
}

export default async function SecurityMonitoringPage() {
  const session = await getSession()
  
  // Check if user is authenticated and has admin role
  if (!session) {
    redirect('/auth/login')
  }
  
  // In a real application, you would check for admin role
  // For now, we'll allow any authenticated user to access the security dashboard
  // You can implement proper RBAC here based on your requirements
  
  return (
    <div className="min-h-screen bg-background">
      <SecurityMonitoringDashboard />
    </div>
  )
}