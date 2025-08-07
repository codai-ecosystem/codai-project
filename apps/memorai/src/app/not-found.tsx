import React from 'react'
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-md mx-auto text-center p-8">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-slate-700 mb-2">Page Not Found</h2>
                    <p className="text-slate-600">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Go to Homepage
                    </Link>

                    <div className="text-sm text-slate-500">
                        <Link
                            href="/auth/signin"
                            className="text-blue-600 hover:text-blue-700 underline"
                        >
                            Sign In
                        </Link>
                        {' • '}
                        <Link
                            href="/contact"
                            className="text-blue-600 hover:text-blue-700 underline"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

