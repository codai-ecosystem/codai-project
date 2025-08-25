'use client'

import React from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold">Something went wrong!</h2>
                        <button
                            onClick={() => reset()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}

