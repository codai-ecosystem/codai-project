import { useState, useEffect } from 'react'

export function useApp() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize app
    setIsLoaded(true)
  }, [])

  return {
    isLoaded,
    error,
    setError
  }
}