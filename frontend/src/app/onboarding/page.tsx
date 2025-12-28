'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingFlow from '@/components/OnboardingFlow'
import { useAuth } from '@/components/auth/AuthProvider'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Require authentication - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleOnboardingComplete = (userId: string) => {
    // Redirect to dashboard - userId is already the authenticated user's ID
    router.push('/dashboard')
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading...</p>
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

