import React from 'react'
import { useEffect, useState } from 'react';

/**
 * DevStatusIndicator - A component to display the status of development services
 */
export function DevStatusIndicator() {
  const [statuses, setStatuses] = useState({
    backend: 'unknown',
    firebase: {
      auth: 'unknown',
      firestore: 'unknown',
      database: 'unknown',
      storage: 'unknown',
      functions: 'unknown',
      emulatorUi: 'unknown',
    },
  });

  useEffect(() => {
    async function checkServices() {
      // Check backend status
      try {
        const backendRes = await fetch('/api/health');
        if (backendRes.ok) {
          const backendData = await backendRes.json();
          setStatuses(s => ({
            ...s,
            backend: backendData.status === 'ready' ? 'online' : 'warning',
          }));
        } else {
          setStatuses(s => ({ ...s, backend: 'offline' }));
        }
      } catch {
        setStatuses(s => ({ ...s, backend: 'offline' }));
      }

      // Check Firebase emulator status
      const emulatorPorts = {
        auth: 9089,
        firestore: 8082,
        database: 9002,
        functions: 5005,
        storage: 9189,
        emulatorUi: 4002,
      }; // Use the Firebase emulator UI to check status
      try {
        await fetch(`http://localhost:${emulatorPorts.emulatorUi}`, {
          mode: 'no-cors', // CORS will block this, but we can detect if the request fails
        });
        setStatuses(s => ({
          ...s,
          firebase: {
            ...s.firebase,
            emulatorUi: 'online',
            // If UI is up, likely all other services are up
            auth: 'likely-online',
            firestore: 'likely-online',
            database: 'likely-online',
            storage: 'likely-online',
            functions: 'likely-online',
          },
        }));
      } catch {
        setStatuses(s => ({
          ...s,
          firebase: {
            ...s.firebase,
            emulatorUi: 'offline',
            // Can't determine individual service status
          },
        }));
      }
    }

    // Check on load and every 10 seconds
    checkServices();
    const interval = setInterval(checkServices, 10000);

    return () => clearInterval(interval);
  }, []);
  // Indicator style based on status
  const getStatusStyles = (status: string): string => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'likely-online':
        return 'bg-green-300';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 rounded-tl-lg border border-gray-200 bg-white p-4 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between border-b pb-1 font-semibold dark:border-gray-700">
          <span>Development Status</span>
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              statuses.backend === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusStyles(statuses.backend)}`}
            ></span>
            <span>Backend</span>
          </div>

          <div className="flex items-center">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusStyles(statuses.firebase.emulatorUi)}`}
            ></span>
            <span>Firebase UI</span>
          </div>

          <div className="flex items-center">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusStyles(statuses.firebase.auth)}`}
            ></span>
            <span>Auth</span>
          </div>

          <div className="flex items-center">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusStyles(statuses.firebase.firestore)}`}
            ></span>
            <span>Firestore</span>
          </div>

          <div className="flex items-center">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusStyles(statuses.firebase.database)}`}
            ></span>
            <span>Database</span>
          </div>

          <div className="flex items-center">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusStyles(statuses.firebase.storage)}`}
            ></span>
            <span>Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
}

