'use client'

import { useState } from 'react'
import { Shield, CheckCircle, XCircle, Key, User } from 'lucide-react'

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runAuthTests = async () => {
    setIsLoading(true)
    const results = []

    // Test 1: Valid admin login
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vladulescu.catalin@gmail.com',
          password: 'Admin123!'
        })
      })
      const data = await response.json()
      results.push({
        test: 'Admin Login Test',
        success: response.ok,
        message: response.ok ? `Login successful - Role: ${data.user?.role}` : data.error,
        details: data
      })
    } catch (error) {
      results.push({
        test: 'Admin Login Test',
        success: false,
        message: 'Network error',
        details: error
      })
    }

    // Test 2: Invalid credentials
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vladulescu.catalin@gmail.com',
          password: 'wrongpassword'
        })
      })
      const data = await response.json()
      results.push({
        test: 'Invalid Password Test',
        success: !response.ok,
        message: !response.ok ? 'Correctly rejected invalid password' : 'ERROR: Accepted invalid password',
        details: data
      })
    } catch (error) {
      results.push({
        test: 'Invalid Password Test',
        success: false,
        message: 'Network error',
        details: error
      })
    }

    // Test 3: Test AI admin user
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'codai-agent@codai.com',
          password: 'password'
        })
      })
      const data = await response.json()
      results.push({
        test: 'AI Admin Login Test',
        success: response.ok,
        message: response.ok ? `Login successful - Role: ${data.user?.role}` : data.error,
        details: data
      })
    } catch (error) {
      results.push({
        test: 'AI Admin Login Test',
        success: false,
        message: 'Network error',
        details: error
      })
    }

    // Test 4: Google OAuth route availability
    try {
      const response = await fetch('/api/auth/google', {
        method: 'GET',
        redirect: 'manual'
      })
      results.push({
        test: 'Google OAuth Route Test',
        success: response.status === 302 || response.status === 200,
        message: response.status === 302 ? 'OAuth redirect available' : 'OAuth route accessible',
        details: { status: response.status, headers: Object.fromEntries(response.headers.entries()) }
      })
    } catch (error) {
      results.push({
        test: 'Google OAuth Route Test',
        success: false,
        message: 'OAuth route error',
        details: error
      })
    }

    setTestResults(results)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-codai-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Authentication System Test</h1>
          </div>

          <div className="mb-6">
            <button
              onClick={runAuthTests}
              disabled={isLoading}
              className="bg-codai-600 hover:bg-codai-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Key className="h-5 w-5" />
              <span>{isLoading ? 'Running Tests...' : 'Run Authentication Tests'}</span>
            </button>
          </div>

          {/* Test Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Test Credentials</h2>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <strong>Master Admin:</strong> vladulescu.catalin@gmail.com / Admin123!
              </div>
              <div>
                <strong>AI Admin:</strong> codai-agent@codai.com / password
              </div>
              <div>
                <strong>Test User:</strong> e2e.test@codai.com / password
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                >
                  <div className="flex items-center mb-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                  </div>
                  <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">View Details</summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="/auth/signin"
                className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50"
              >
                Sign In Page
              </a>
              <a
                href="/dashboard"
                className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50"
              >
                Dashboard
              </a>
              <a
                href="/api/auth/google"
                className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50"
              >
                Google OAuth
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
