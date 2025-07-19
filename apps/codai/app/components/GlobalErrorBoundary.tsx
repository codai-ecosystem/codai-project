'use client'

import { ReactNode, Component, ErrorInfo } from 'react'

interface GlobalErrorBoundaryProps {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, State> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application Error:', error, errorInfo)
    
    // In production, send to analytics/monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Analytics.track('error', { error: error.message, stack: error.stack })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-red-500/20 rounded-xl flex items-center justify-center mb-8 mx-auto">
              <span className="text-red-400 text-4xl">⚠</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Something went wrong!
            </h1>
            
            <p className="text-slate-400 mb-8 leading-relaxed">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8 text-left">
                <p className="text-red-400 font-mono text-sm break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}