'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingFlow from '@/components/OnboardingFlow'
import { getCacheStatus } from '@/lib/api'

const STORAGE_KEY_USER_ID = 'behavaced_user_id'
const STORAGE_KEY_ONBOARDED = 'behavaced_onboarded'

export default function OnboardingPage() {
  const router = useRouter()

  // TEMPORARILY DISABLED: Persistence for design testing - always start fresh
  // Check if user is already onboarded and redirect to dashboard
  // useEffect(() => {
  //   const checkOnboardingStatus = async () => {
  //     const storedUserId = localStorage.getItem(STORAGE_KEY_USER_ID)
  //     const storedOnboarded = localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true'

  //     if (storedUserId && storedOnboarded) {
  //       // In dev mode, try to load cached profile from backend
  //       if (process.env.NODE_ENV === 'development') {
  //         try {
  //           const cacheStatus = await getCacheStatus()
  //           if (cacheStatus.exists && cacheStatus.user_id) {
  //             router.push('/dashboard')
  //             return
  //           }
  //         } catch (error) {
  //           console.log('No cached profile found')
  //         }
  //       }

  //       // If onboarded, redirect to dashboard
  //       router.push('/dashboard')
  //     }
  //   }

  //   checkOnboardingStatus()
  // }, [router])

  const handleOnboardingComplete = (newUserId: string) => {
    // TEMPORARILY DISABLED: Persistence for design testing
    // Save to localStorage
    // localStorage.setItem(STORAGE_KEY_USER_ID, newUserId)
    // localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true')
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </main>
  )
}

