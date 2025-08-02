'use client'

import Link from 'next/link'
import { Shield, User, Lock, Zap } from 'lucide-react'

export default function IDHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Shield className="h-16 w-16 mx-auto mb-4 text-codai-600" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-codai-600 to-codai-400 bg-clip-text text-transparent mb-4">
              CODAI Identity
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Enterprise Identity & Authentication Platform
            </p>
            <p className="text-lg text-gray-500">
              Secure, scalable, and modern identity management for the CODAI ecosystem
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="bg-codai-600 hover:bg-codai-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
            >
              <User className="mr-2 h-5 w-5" />
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="border border-codai-600 text-codai-600 hover:bg-codai-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Platform Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <Lock className="h-12 w-12 text-codai-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Secure Authentication
              </h3>
              <p className="text-gray-600">
                Enterprise-grade security with multi-factor authentication and zero-trust architecture
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <Zap className="h-12 w-12 text-codai-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Modern Technology
              </h3>
              <p className="text-gray-600">
                Built with Next.js 15, TypeScript, and the latest web standards for optimal performance
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <Shield className="h-12 w-12 text-codai-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Scalable Architecture
              </h3>
              <p className="text-gray-600">
                Designed to scale from startup to enterprise with microservices architecture
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Status Dashboard */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Service Status
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="font-medium text-gray-800">Status</div>
              <div className="text-green-600 font-semibold">
                ✅ Online
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="font-medium text-gray-800">Authentication</div>
              <div className="text-blue-600 font-semibold">
                🔑 Ready
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="bg-codai-600 hover:bg-codai-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
            >
              Get Started
            </Link>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Phase 1 Implementation • Port 4004 • Version 1.0.0
          </p>
        </div>
      </section>
    </div>
  )
}