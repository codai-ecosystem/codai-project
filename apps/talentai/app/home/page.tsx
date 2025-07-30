'use client'

import { ProtectedRoute } from '@codai/shared-ui'
import { HomePage } from '@codai/shared-ui'

export default function Home() {
    return (
        <ProtectedRoute>
            <HomePage
                appName="TALENTAI"
                brandColor="purple"
            />
        </ProtectedRoute>
    )
}
