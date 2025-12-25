'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Dashboard from '@/components/Dashboard'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { useAuth } from '@/components/auth/AuthProvider'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get userId from onboarding store (legacy support)
  const storeUserId = useOnboardingStore((state) => state.userId)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // If user is authenticated via Supabase, use their ID
    if (user) {
      setUserId(user.id)
      setIsLoading(false)
      return
    }

    // Fallback: Check for userId from URL params, sessionStorage, or store (legacy)
    const urlUserId = searchParams.get('userId')
    const sessionUserId = typeof window !== 'undefined' ? sessionStorage.getItem('behavaced_user_id') : null
    const finalUserId = urlUserId || sessionUserId || storeUserId

    if (finalUserId) {
      setUserId(finalUserId)
      setIsLoading(false)
    } else {
      // No userId found, redirect to login
      router.push('/login')
    }
  }, [router, searchParams, storeUserId, user, authLoading])

  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading...</p>
        </div>
      </main>
    )
  }

  if (!userId) {
    return null // Will redirect
  }

  return (
    <main className="min-h-screen">
      <Dashboard userId={userId} />
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading...</p>
        </div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  )
}

