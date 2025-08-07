'use client'

import React from 'react'

import { GuestRoute } from '@codai/shared-ui'
import { SignupForm } from '@codai/shared-ui'

export default function SignupPage() {
    return (
        <GuestRoute>
            <SignupForm />
        </GuestRoute>
    )
}

