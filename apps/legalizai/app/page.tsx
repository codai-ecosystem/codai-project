'use client'

import { AppRouting } from '@codai/shared-ui'
import { Scale, FileText, Search, Shield, Gavel, BookOpen } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Scale className="w-8 h-8" />,
      title: 'Legal Compliance',
      description: 'AI-powered compliance monitoring and regulatory adherence',
      status: 'active' as const
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Document Analysis',
      description: 'Intelligent contract review and legal document processing',
      status: 'active' as const
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Legal Research',
      description: 'Comprehensive case law and regulation search capabilities',
      status: 'active' as const
    },
    {
      icon: <Gavel className="w-8 h-8" />,
      title: 'Risk Assessment',
      description: 'Automated legal risk evaluation and mitigation strategies',
      status: 'active' as const
    }
  ]

  return (
    <AppRouting
      appName="LEGALIZAI"
      appTagline="AI-Powered Legal Compliance Platform"
      appDescription="Transform your legal operations with intelligent compliance monitoring, document analysis, and automated risk assessment for comprehensive legal management."
      features={features}
      brandColor="slate"
    />
  )
}
