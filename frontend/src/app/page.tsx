'use client'

import { useState } from 'react'
import OnboardingFlow from '@/components/OnboardingFlow'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)

  const handleOnboardingComplete = (newUserId: string) => {
    setUserId(newUserId)
    setIsOnboarded(true)
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

