export function DashboardStats() {
    const stats = [
        {
            title: "Active Users",
            value: "1,234",
            change: "+12%",
            trend: "up"
        },
        {
            title: "System Health",
            value: "99.9%",
            change: "+0.1%",
            trend: "up"
        },
        {
            title: "Response Time",
            value: "45ms",
            change: "-5ms",
            trend: "up"
        },
        {
            title: "Success Rate",
            value: "98.7%",
            change: "+1.2%",
            trend: "up"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {stat.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stat.value}
                            </p>
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                            <span>↗</span>
                            <span>{stat.change}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
