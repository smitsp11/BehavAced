'use client'

import { useState, useEffect } from 'react'
import TryMode from '@/components/TryMode'
import OnboardingFlow from '@/components/OnboardingFlow'
import Dashboard from '@/components/Dashboard'
import { loadCachedProfile, getCacheStatus } from '@/lib/api'

const STORAGE_KEY_USER_ID = 'behavaced_user_id'
const STORAGE_KEY_ONBOARDED = 'behavaced_onboarded'

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Load from localStorage and check for cached profile on mount
  useEffect(() => {
    const loadState = async () => {
      // First, try loading from localStorage
      const storedUserId = localStorage.getItem(STORAGE_KEY_USER_ID)
      const storedOnboarded = localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true'

      if (storedUserId && storedOnboarded) {
        // In dev mode, try to load cached profile from backend
        if (process.env.NODE_ENV === 'development') {
          try {
            const cacheStatus = await getCacheStatus()
            if (cacheStatus.exists && cacheStatus.user_id) {
              // Use cached profile if available
              setUserId(cacheStatus.user_id)
              setIsOnboarded(true)
              setIsLoading(false)
              return
            }
          } catch (error) {
            console.log('No cached profile found, using localStorage')
          }
        }

        // Fallback to localStorage
        setUserId(storedUserId)
        setIsOnboarded(storedOnboarded)
      }
      
      setIsLoading(false)
    }

    loadState()
  }, [])

  const handleOnboardingComplete = (newUserId: string) => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_USER_ID, newUserId)
    localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true')
    
    setUserId(newUserId)
    setIsOnboarded(true)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  // Always show TryMode first (it's the landing page)
  // Users can try the demo, then choose to start onboarding
  if (!showOnboarding) {
    return <TryMode onStartOnboarding={() => setShowOnboarding(true)} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!isOnboarded ? (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      ) : (
        <Dashboard userId={userId!} />
      )}
    </main>
  )
}

