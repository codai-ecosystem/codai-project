import { useEffect, useState } from 'react';

import { ApiService } from '@/services/api';

interface BackendStatusProps {
  className?: string;
}

interface BackendHealthResponse {
  version?: string;
  environment?: string;
  status?: string;
  timestamp?: string;
  uptime?: number;
  memory?: {
    used: number;
    total: number;
  };
}

/**
 * BackendStatus component - Shows the status of the backend connection
 */
export function BackendStatus({ className }: BackendStatusProps): JSX.Element {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>(
    'loading'
  );
  const [details, setDetails] = useState<BackendHealthResponse | null>(null);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await ApiService.get('/health');

        if (response.error || !response.data) {
          setStatus('offline');
        } else {
          setStatus('online');
          setDetails(response.data);
        }
      } catch (error) {
        setStatus('offline');
      }
    };

    checkBackendStatus();
  }, []);

  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <h3 className="mb-2 font-medium">Backend Status</h3>
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            status === 'online'
              ? 'bg-green-500'
              : status === 'offline'
                ? 'bg-red-500'
                : 'bg-yellow-500'
          }`}
        />
        <span>
          {status === 'loading'
            ? 'Checking connection...'
            : status === 'online'
              ? 'Connected'
              : 'Disconnected'}
        </span>
      </div>

      {status === 'online' && details && (
        <div className="mt-3 text-sm">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-gray-600">Version:</span>{' '}
            <span>{details.version || 'N/A'}</span>
            <span className="text-gray-600">Environment:</span>
            <span>{details.environment || 'N/A'}</span>
            <span className="text-gray-600">Status:</span>
            <span>{details.status || 'N/A'}</span>
            <span className="text-gray-600">Timestamp:</span>
            <span>
              {details.timestamp
                ? new Date(details.timestamp).toLocaleString()
                : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
