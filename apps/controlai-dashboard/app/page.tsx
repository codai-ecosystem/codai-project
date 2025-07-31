import { redirect } from 'next/navigation'

export default function HomePage() {
    // Redirect directly to dashboard since this is a dashboard app
    redirect('/dashboard')
}
