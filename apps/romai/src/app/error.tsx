'use client'

import React from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold">500</h1>
                <p className="mt-4 text-lg text-gray-600">Internal Server Error</p>
                <button
                    onClick={reset}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

