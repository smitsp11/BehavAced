'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OnboardingFlow from '@/components/OnboardingFlow'
import { useAuth } from '@/components/auth/AuthProvider'

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  // Require authentication - redirect to login if not authenticated
  // Add retry logic for OAuth callback race condition
  useEffect(() => {
    // If still loading, wait
    if (authLoading) {
      return
    }

    // If user exists, we're good
    if (user) {
      return
    }

    // If no user and not loading, check if we should retry (for OAuth callback)
    if (retryCount < maxRetries) {
      // Wait a bit and retry (OAuth callback might still be processing)
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
      }, 500)
      return () => clearTimeout(timer)
    }

    // After max retries, redirect to login
    router.push('/login')
  }, [user, authLoading, router, retryCount])

  const handleOnboardingComplete = (userId: string) => {
    // Redirect to dashboard - userId is already the authenticated user's ID
    router.push('/dashboard')
  }

  // Show loading while checking auth or retrying
  if (authLoading || (retryCount < maxRetries && !user)) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading...</p>
          {retryCount > 0 && retryCount < maxRetries && (
            <p className="text-sm text-stone-400 mt-2">Setting up your account...</p>
          )}
        </div>
      </main>
    )
  }

  // Don't render onboarding if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </main>
  )
}

