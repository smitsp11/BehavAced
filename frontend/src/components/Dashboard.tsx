'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import QuestionAsker from '@/components/QuestionAsker'
import StoryBank from '@/components/StoryBank'
import PracticeMode from '@/components/PracticeMode'
import { BookOpen, MessageSquare, Mic, Trophy, Save, Download, Trash2 } from 'lucide-react'
import { saveCachedProfile, loadCachedProfile, clearCache, getCacheStatus } from '@/lib/api'

interface DashboardProps {
  userId: string
}

export default function Dashboard({ userId }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'ask' | 'stories' | 'practice' | 'stats'>('ask')
  const [cacheStatus, setCacheStatus] = useState<any>(null)
  const [devLoading, setDevLoading] = useState(false)
  const isDev = process.env.NODE_ENV === 'development'

  // Check cache status on mount (dev only)
  useEffect(() => {
    if (isDev) {
      checkCacheStatus()
    }
  }, [isDev])

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

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">BehavAced Dashboard</h1>
            {isDev && (
              <div className="flex items-center gap-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                🧪 DEV MODE
              </div>
            )}
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
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stats')}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Progress
          </Button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'ask' && <QuestionAsker userId={userId} />}
          {activeTab === 'stories' && <StoryBank userId={userId} />}
          {activeTab === 'practice' && <PracticeMode userId={userId} />}
          {activeTab === 'stats' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Track your improvement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-16 h-16 mx-auto mb-4" />
                  <p>Stats and analytics coming soon!</p>
                  <p className="text-sm mt-2">
                    Keep practicing to see your progress here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

