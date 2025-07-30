import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardStats } from '@/components/dashboard/stats'
import { DashboardContent } from '@/components/dashboard/content'

export default function Dashboard() {
    return (
        <main className="container mx-auto px-4 py-8">
            <DashboardHeader
                title="${APP_NAME}"
                description="${APP_DESCRIPTION}"
            />

            <div className="mt-8 space-y-6">
                <DashboardStats />
                <DashboardContent />
            </div>
        </main>
    )
}
