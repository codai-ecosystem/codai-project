import React from 'react'
/**
 * Loading State Component - Real AGI Connection
 */

interface LoadingStateProps {
    message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Establishing real AGI connection...
                </p>
            </div>
        </div>
    );
}

