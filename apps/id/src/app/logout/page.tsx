import { LogoutForm } from '@/components/auth/logout-form'
import { Suspense } from 'react'

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign Out
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign out from all CODAI applications
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <LogoutForm />
        </Suspense>
      </div>
    </div>
  )
}
