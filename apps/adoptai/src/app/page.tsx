import { redirect } from 'next/navigation'

// Redirect root to dashboard for pet adoption platform
export default function AdoptaiHome() {
    redirect('/dashboard')
}
