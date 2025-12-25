'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Dashboard from '@/components/Dashboard'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get userId from onboarding store
  const storeUserId = useOnboardingStore((state) => state.userId)

  useEffect(() => {
    // Check for userId from URL params, sessionStorage, or store
    const urlUserId = searchParams.get('userId')
    const sessionUserId = typeof window !== 'undefined' ? sessionStorage.getItem('behavaced_user_id') : null
    const finalUserId = urlUserId || sessionUserId || storeUserId

    if (finalUserId) {
      setUserId(finalUserId)
      setIsLoading(false)
    } else {
      // No userId found, redirect to onboarding
      router.push('/onboarding')
    }
  }, [router, searchParams, storeUserId])

  if (isLoading) {
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

