import { useEffect, useState } from 'react';

interface BackendStatusProps {
    className?: string;
}

interface StatusData {
    status: string;
    message: string;
}

export function BackendStatus({ className }: BackendStatusProps) {
    const [status, setStatus] = useState<StatusData>({
        status: 'healthy',
        message: 'All systems operational'
    });

    useEffect(() => {
        // Mock status check
        const checkStatus = () => {
            const isHealthy = Math.random() > 0.1;
            setStatus({
                status: isHealthy ? 'healthy' : 'degraded',
                message: isHealthy ? 'All systems operational' : 'Some services experiencing issues'
            });
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`rounded-md border p-4 ${className}`}>
            <h3 className="mb-2 font-medium">Backend Status</h3>
            <div className="flex items-center gap-2">
                <div
                    className={`h-3 w-3 rounded-full ${status.status === 'healthy'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                />
                <span>
                    {status.status === 'healthy' ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
                {status.message}
            </div>
        </div>
    );
}
