'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useAuth } from '@/components/auth/AuthProvider'

export default function SignUpPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="py-6 px-8">
        <Link href="/" className="font-serif text-2xl text-stone-900 hover:text-emerald-600 transition-colors">
          BehavAced
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12">
        <SignUpForm />
      </main>
    </div>
  )
}

