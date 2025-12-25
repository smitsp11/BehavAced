'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import QuestionAsker from '@/components/QuestionAsker'
import StoryBank from '@/components/StoryBank'
import PracticeMode from '@/components/PracticeMode'
import PracticePlan from '@/components/PracticePlan'
import { 
  BookOpen, 
  MessageSquare, 
  Mic, 
  Trophy, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  Search,
  Zap,
  Target,
  Brain,
  History,
  Settings,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  User,
  LayoutDashboard
} from 'lucide-react'
import { getProfile } from '@/lib/api'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

interface DashboardProps {
  userId: string
}

// Mock data for UI testing
const mockStories = [
  {
    id: 1,
    title: "Led Cross-Functional Team Migration",
    category: "Leadership",
    strength: 95,
    preview: "Successfully led a team of 8 engineers to migrate legacy systems..."
  },
  {
    id: 2,
    title: "Resolved Critical Production Outage",
    category: "Problem Solving",
    strength: 88,
    preview: "Diagnosed and fixed a cascading failure affecting 2M users..."
  },
  {
    id: 3,
    title: "Mentored Junior Engineers",
    category: "Mentorship",
    strength: 82,
    preview: "Established a mentorship program that improved retention by 40%..."
  }
]

const mockFeedback = [
  { metric: "Clarity", score: 85, trend: "up" },
  { metric: "Structure", score: 78, trend: "up" },
  { metric: "Impact", score: 92, trend: "stable" }
]

export default function Dashboard({ userId }: DashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'stories' | 'practice' | 'plan' | 'settings'>('dashboard')
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

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

    checkProcessing()
    const interval = setInterval(() => {
      checkProcessing()
      if (isBackgroundProcessingComplete()) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isBackgroundProcessingComplete, getBackgroundProcessingProgress])

  // Load profile data
  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    try {
      const response = await getProfile(userId)
      if (response.success) {
        setProfileData(response.profile)
      }
    } catch (error) {
      console.log('Profile API not available - continuing with mock data')
      setProfileData({ name: 'Smit Patel' })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    if (action === 'surprise') {
      setSearchQuery("Tell me about a time you showed leadership")
    } else if (action === 'weakness') {
      setSearchQuery("Tell me about a time you failed")
    } else if (action === 'review') {
      setActiveView('practice')
    }
  }

  const profileStrength = 85 // Mock value

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-cyan-500/30 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-t-2 border-cyan-400 rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-cyan-400" />
          </div>
          <p className="mt-4 text-gray-400 font-medium">Initializing Cognition Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/3 rounded-full blur-[150px]" />
      </div>

      {/* Left Sidebar */}
      <aside className="w-[280px] bg-[#0d0d14]/80 backdrop-blur-xl border-r border-white/5 flex flex-col relative z-10">
        {/* User Profile */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-lg font-bold">
                {profileData?.name?.charAt(0) || 'S'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0d0d14]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{profileData?.name || 'User'}</h3>
              <p className="text-xs text-gray-500">Interview Ready</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
          />
          <NavItem 
            icon={<BookOpen className="w-5 h-5" />} 
            label="Story Bank" 
            active={activeView === 'stories'}
            onClick={() => setActiveView('stories')}
            badge={mockStories.length}
          />
          <NavItem 
            icon={<Mic className="w-5 h-5" />} 
            label="Practice Mode" 
            active={activeView === 'practice'}
            onClick={() => setActiveView('practice')}
          />
          <NavItem 
            icon={<Trophy className="w-5 h-5" />} 
            label="Practice Plan" 
            active={activeView === 'plan'}
            onClick={() => setActiveView('plan')}
          />
          <NavItem 
            icon={<History className="w-5 h-5" />} 
            label="History" 
            active={false}
            onClick={() => {}}
          />
          
          <div className="pt-4 mt-4 border-t border-white/5">
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
          </div>
        </nav>

        {/* Profile Strength Widget */}
        <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-400">Profile Strength</span>
            <span className="text-lg font-bold text-cyan-400">{profileStrength}%</span>
          </div>
          <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${profileStrength}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Add more stories to boost your score</p>
          
          {/* Processing Status */}
          {!processingComplete && backgroundTasks.overall.status === 'processing' && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processing... {processingProgress.percentage}%</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex">
        {activeView === 'dashboard' ? (
          <>
            {/* Main Stage */}
            <div className="flex-1 p-8 flex flex-col relative z-10">
              {/* Hero Search Section */}
              <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                {/* Greeting */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    What are you prepping for?
                  </h1>
                  <p className="text-gray-500">Ask any behavioral interview question and get your personalized answer</p>
                </div>

                {/* Massive Search Bar */}
                <div className={`w-full relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
                  <div className={`
                    relative rounded-2xl overflow-hidden
                    ${searchFocused 
                      ? 'shadow-[0_0_60px_rgba(6,182,212,0.3)] ring-2 ring-cyan-500/50' 
                      : 'shadow-[0_0_40px_rgba(6,182,212,0.1)]'
                    }
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
                    <div className="relative bg-[#12121a]/90 backdrop-blur-xl border border-white/10 rounded-2xl">
                      <div className="flex items-center p-4">
                        <Search className={`w-6 h-6 mr-4 transition-colors ${searchFocused ? 'text-cyan-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => setSearchFocused(false)}
                          placeholder="Tell me about a time when you..."
                          className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 outline-none"
                        />
                        <Button 
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-cyan-500/25"
                          onClick={() => console.log('Search:', searchQuery)}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Suggestions */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['Leadership', 'Conflict', 'Failure', 'Success', 'Teamwork'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(`Tell me about a time you demonstrated ${tag.toLowerCase()}`)}
                        className="px-4 py-1.5 rounded-full text-sm bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 hover:border-white/10 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-3 gap-4 mt-12 w-full">
                  <QuickActionCard
                    icon={<Zap className="w-6 h-6" />}
                    title="Surprise Me"
                    description="Random behavioral question"
                    gradient="from-amber-500/20 to-orange-500/20"
                    iconColor="text-amber-400"
                    onClick={() => handleQuickAction('surprise')}
                  />
                  <QuickActionCard
                    icon={<History className="w-6 h-6" />}
                    title="Review Last"
                    description="Continue where you left off"
                    gradient="from-purple-500/20 to-pink-500/20"
                    iconColor="text-purple-400"
                    onClick={() => handleQuickAction('review')}
                  />
                  <QuickActionCard
                    icon={<Target className="w-6 h-6" />}
                    title="Weakness Drill"
                    description="Practice your weak areas"
                    gradient="from-red-500/20 to-rose-500/20"
                    iconColor="text-red-400"
                    onClick={() => handleQuickAction('weakness')}
                  />
                </div>
              </div>
            </div>

            {/* Right Context Panel */}
            <aside className="w-[340px] bg-[#0d0d14]/60 backdrop-blur-xl border-l border-white/5 p-6 relative z-10 overflow-y-auto">
              {/* Your Top Stories */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Your Top Stories
                  </h3>
                  <button 
                    onClick={() => setActiveView('stories')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {mockStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </section>

              {/* Recent Feedback */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Recent Performance
                  </h3>
                </div>
                <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-white/5">
                  <div className="space-y-4">
                    {mockFeedback.map((item) => (
                      <div key={item.metric} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.score >= 90 ? 'bg-green-500' :
                                item.score >= 70 ? 'bg-cyan-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-8">{item.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-500">
                      Based on your last 5 practice sessions
                    </p>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-white/5">
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-xs text-gray-500">Questions Practiced</div>
                  </div>
                  <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-white/5">
                    <div className="text-2xl font-bold text-cyan-400">2.5h</div>
                    <div className="text-xs text-gray-500">Total Practice Time</div>
                  </div>
                </div>
              </section>
            </aside>
          </>
        ) : (
          <div className="flex-1 p-8 relative z-10">
            {activeView === 'stories' && <StoryBank userId={userId} />}
            {activeView === 'practice' && <PracticeMode userId={userId} />}
            {activeView === 'plan' && <PracticePlan userId={userId} />}
            {activeView === 'settings' && (
              <div className="text-center text-gray-500 py-20">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Settings coming soon...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Navigation Item Component
function NavItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  badge 
}: { 
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${active 
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-500/30' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <span className={active ? 'text-cyan-400' : ''}>{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
          {badge}
        </span>
      )}
    </button>
  )
}

// Quick Action Card Component
function QuickActionCard({ 
  icon, 
  title, 
  description, 
  gradient, 
  iconColor,
  onClick 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  iconColor: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        p-6 rounded-2xl border border-white/5 
        bg-gradient-to-br ${gradient}
        hover:border-white/10 hover:scale-105 
        transition-all duration-300 text-left group
      `}
    >
      <div className={`${iconColor} mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </button>
  )
}

// Story Card Component
function StoryCard({ story }: { story: typeof mockStories[0] }) {
  return (
    <div className="p-4 rounded-xl bg-[#1a1a2e]/50 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
          {story.category}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          {story.strength}%
        </div>
      </div>
      <h4 className="font-medium text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors">
        {story.title}
      </h4>
      <p className="text-xs text-gray-500 line-clamp-2">{story.preview}</p>
    </div>
  )
}
