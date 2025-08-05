/**
 * MemorAI Test Dashboard Page
 * Simple test page to demonstrate notifications
 */

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { useNotificationContext } from '@/components/notifications';

export default function TestPage() {
  const notifications = useNotificationContext();
  const [counter, setCounter] = useState(0);

  const handleSuccessNotification = () => {
    notifications.success(
      `Success notification #${counter + 1}. This is a test success message.`,
      'Success Test',
      {
        duration: 5000,
        action: {
          label: 'View Details',
          onClick: () => alert('Success action clicked!')
        }
      }
    );
    setCounter(counter + 1);
  };

  const handleErrorNotification = () => {
    notifications.error(
      `Error notification #${counter + 1}. This is a test error message with more details.`,
      'Error Test'
    );
    setCounter(counter + 1);
  };

  const handleWarningNotification = () => {
    notifications.warning(
      `Warning notification #${counter + 1}. This is a test warning message.`,
      'Warning Test'
    );
    setCounter(counter + 1);
  };

  const handleInfoNotification = () => {
    notifications.info(
      `Info notification #${counter + 1}. This is a test info message.`,
      'Info Test'
    );
    setCounter(counter + 1);
  };

  const handleClearAll = () => {
    notifications.clear();
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notification System Test
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test the MemorAI notification system
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Notification Types
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleSuccessNotification}
                className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                ✅ Success Notification
              </button>

              <button
                onClick={handleErrorNotification}
                className="px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                ❌ Error Notification
              </button>

              <button
                onClick={handleWarningNotification}
                className="px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                ⚠️ Warning Notification
              </button>

              <button
                onClick={handleInfoNotification}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                ℹ️ Info Notification
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClearAll}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                🗑️ Clear All Notifications
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Counter:</strong> {counter} notifications created
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Notifications appear in the top-right corner with animations
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
