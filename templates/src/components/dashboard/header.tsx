interface DashboardHeaderProps {
    title: string
    description: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {title.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Service Online
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    • Last updated: {new Date().toLocaleTimeString()}
                </span>
            </div>
        </div>
    )
}
