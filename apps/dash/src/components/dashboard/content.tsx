import React from 'react'
export function DashboardContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main Content Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  {item}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Activity Item {item}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.floor(Math.random() * 60)} minutes ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          System Status
        </h3>
        <div className="space-y-3">
          {[
            { name: "API Gateway", status: "Operational" },
            { name: "Database", status: "Operational" },
            { name: "Cache Layer", status: "Operational" },
            { name: "Background Jobs", status: "Operational" }
          ].map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {service.name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

