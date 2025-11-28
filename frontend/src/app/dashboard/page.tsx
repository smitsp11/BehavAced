'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/Dashboard'
import { getCacheStatus } from '@/lib/api'

const STORAGE_KEY_USER_ID = 'behavaced_user_id'
const STORAGE_KEY_ONBOARDED = 'behavaced_onboarded'

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
              setUserId(cacheStatus.user_id)
              setIsLoading(false)
              return
            }
          } catch (error) {
            console.log('No cached profile found, using localStorage')
          }
        }

        // Fallback to localStorage
        setUserId(storedUserId)
        setIsLoading(false)
      } else {
        // Not onboarded, redirect to onboarding
        router.push('/onboarding')
      }
    }

    loadState()
  }, [router])

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

  if (!userId) {
    return null // Will redirect
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Dashboard userId={userId} />
    </main>
  )
}

