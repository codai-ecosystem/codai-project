'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StudiAIPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return null
}
