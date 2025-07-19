'use client'

import { GuestRoute } from '@codai/shared-ui'
import { LoginForm } from '@codai/shared-ui'

export default function LoginPage() {
    return (
        <GuestRoute>
            <LoginForm />
        </GuestRoute>
    )
}
