'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import QuestionAsker from '@/components/QuestionAsker'
import StoryBank from '@/components/StoryBank'
import PracticeMode from '@/components/PracticeMode'
import PracticePlan from '@/components/PracticePlan'
import { BookOpen, MessageSquare, Mic, Trophy, Save, Download, Trash2, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { saveCachedProfile, loadCachedProfile, clearCache, getCacheStatus, getProfile } from '@/lib/api'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

interface DashboardProps {
  userId: string
}

export default function Dashboard({ userId }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'ask' | 'stories' | 'practice' | 'plan'>('ask')
  const [cacheStatus, setCacheStatus] = useState<any>(null)
  const [devLoading, setDevLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const isDev = process.env.NODE_ENV === 'development'

  // Background processing state
  const { 
    isBackgroundProcessingComplete, 
    getBackgroundProcessingProgress,
    backgroundTasks 
  } = useOnboardingStore()
  
  const [processingComplete, setProcessingComplete] = useState(false)
  const [processingProgress, setProcessingProgress] = useState({ completed: 0, total: 4, percentage: 0 })

  // Poll for background processing status
  useEffect(() => {
    const checkProcessing = () => {
      const complete = isBackgroundProcessingComplete()
      const progress = getBackgroundProcessingProgress()
      setProcessingComplete(complete)
      setProcessingProgress(progress)
    }

    // Check immediately
    checkProcessing()

    // Poll every second until complete
    const interval = setInterval(() => {
      checkProcessing()
      if (isBackgroundProcessingComplete()) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isBackgroundProcessingComplete, getBackgroundProcessingProgress])

  // Load profile data and cache status on mount
  useEffect(() => {
    loadProfileData()
    if (isDev) {
      checkCacheStatus()
    }
  }, [userId, isDev])

  const loadProfileData = async () => {
    try {
      const response = await getProfile(userId)
      if (response.success) {
        setProfileData(response.profile)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkCacheStatus = async () => {
    if (!isDev) return
    
    try {
      const status = await getCacheStatus()
      setCacheStatus(status)
    } catch (error) {
      console.log('Cache status check failed:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!isDev) return
    
    setDevLoading(true)
    try {
      await saveCachedProfile(userId)
      await checkCacheStatus()
      alert('Profile saved to cache!')
    } catch (error: any) {
      alert(`Failed to save profile: ${error.message}`)
    } finally {
      setDevLoading(false)
    }
  }

  const handleLoadProfile = async () => {
    if (!isDev) return
    
    setDevLoading(true)
    try {
      const result = await loadCachedProfile()
      alert(`Cached profile loaded! User ID: ${result.user_id}`)
      await checkCacheStatus()
      // Optionally reload the page to use the cached profile
      window.location.reload()
    } catch (error: any) {
      alert(`Failed to load cached profile: ${error.message}`)
    } finally {
      setDevLoading(false)
    }
  }

  const handleClearCache = async () => {
    if (!isDev) return
    
    if (!confirm('Are you sure you want to clear the cached profile?')) {
      return
    }
    
    setDevLoading(true)
    try {
      await clearCache()
      setCacheStatus(null)
      alert('Cache cleared!')
    } catch (error: any) {
      alert(`Failed to clear cache: ${error.message}`)
    } finally {
      setDevLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">BehavAced Dashboard</h1>
            <div className="flex items-center gap-2">
              {/* Background Processing Indicator */}
              {!processingComplete && backgroundTasks.overall.status === 'processing' && (
                <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Setting up your profile... {processingProgress.percentage}%</span>
                </div>
              )}
              {processingComplete && backgroundTasks.overall.status === 'completed' && (
                <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile ready!</span>
                </div>
              )}
              {isDev && (
                <div className="flex items-center gap-2 text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  🧪 DEV MODE
                </div>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Your AI-powered behavioral interview coach
          </p>
          
          {/* Dev Tools (dev mode only) */}
          {isDev && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Dev Tools: Profile Cache</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={checkCacheStatus}
                  disabled={devLoading}
                >
                  Refresh
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveProfile}
                  disabled={devLoading}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLoadProfile}
                  disabled={devLoading || !cacheStatus?.exists}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Load Cached
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearCache}
                  disabled={devLoading || !cacheStatus?.exists}
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cache
                </Button>
              </div>
              {cacheStatus && (
                <div className="mt-2 text-xs text-gray-600">
                  {cacheStatus.exists ? (
                    <span>✅ Cached profile found (User ID: {cacheStatus.user_id || 'N/A'})</span>
                  ) : (
                    <span>❌ No cached profile</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'ask' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ask')}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Ask Question
          </Button>
          <Button
            variant={activeTab === 'stories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stories')}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Story Bank
          </Button>
          <Button
            variant={activeTab === 'practice' ? 'default' : 'outline'}
            onClick={() => setActiveTab('practice')}
            className="gap-2"
          >
            <Mic className="w-4 h-4" />
            Practice Mode
          </Button>
          <Button
            variant={activeTab === 'plan' ? 'default' : 'outline'}
            onClick={() => setActiveTab('plan')}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Practice Plan
          </Button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'ask' && <QuestionAsker userId={userId} />}
          {activeTab === 'stories' && <StoryBank userId={userId} />}
          {activeTab === 'practice' && <PracticeMode userId={userId} />}
          {activeTab === 'plan' && <PracticePlan userId={userId} />}
        </div>
      </div>
    </div>
  )
}

