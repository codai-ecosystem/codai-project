import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found | CODAI',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">
            404
          </h1>
          <h2 className="text-2xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Go back home
          </Link>
          
          <div className="text-sm text-muted-foreground">
            <Link 
              href="/dashboard" 
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            {' • '}
            <Link 
              href="/projects" 
              className="hover:text-foreground transition-colors"
            >
              Projects
            </Link>
            {' • '}
            <Link 
              href="/docs" 
              className="hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}