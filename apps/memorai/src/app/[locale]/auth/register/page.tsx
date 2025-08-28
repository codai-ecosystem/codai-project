import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Create Account | MemorAI',
  description: 'Create your MemorAI account',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mb-4"></div>
              <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
            </div>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}