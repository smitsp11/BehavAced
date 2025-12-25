'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import DashboardLayout, { ViewType } from '@/components/DashboardLayout'
import StoryBank from '@/components/StoryBank'
import PracticeMode from '@/components/PracticeMode'
import PracticePlan from '@/components/PracticePlan'
import { 
  Sparkles, 
  Search,
  Zap,
  Target,
  Brain,
  History,
  Settings,
  ChevronRight,
  Star,
  TrendingUp,
  Lightbulb,
  Video,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react'
import { getProfile } from '@/lib/api'

interface DashboardProps {
  userId: string
}

// Extended mock data for Story Matcher
const allStories = [
  {
    id: 1,
    title: "Led Cross-Functional Team Migration",
    category: "Leadership",
    keywords: ["leadership", "team", "lead", "manage", "cross-functional", "migration"],
    strength: 95,
    preview: "Successfully led a team of 8 engineers to migrate legacy systems to cloud infrastructure, reducing costs by 40%.",
    situation: "Legacy monolith causing scaling issues",
    task: "Lead migration to microservices",
    action: "Coordinated 8 engineers across 3 teams",
    result: "40% cost reduction, 99.9% uptime"
  },
  {
    id: 2,
    title: "Resolved Critical Production Outage",
    category: "Problem Solving",
    keywords: ["problem", "solve", "crisis", "pressure", "outage", "critical", "debug", "fix"],
    strength: 88,
    preview: "Diagnosed and fixed a cascading failure affecting 2M users within 45 minutes during peak hours.",
    situation: "Database cascade failure at 2AM",
    task: "Restore service for 2M users",
    action: "Root cause analysis, hotfix deployment",
    result: "Resolved in 45 min, created runbook"
  },
  {
    id: 3,
    title: "Mentored Junior Engineers",
    category: "Mentorship",
    keywords: ["mentor", "teach", "junior", "develop", "grow", "coach", "training"],
    strength: 82,
    preview: "Established a mentorship program that improved retention by 40% and promoted 3 engineers.",
    situation: "High junior engineer turnover",
    task: "Create sustainable mentorship program",
    action: "Weekly 1:1s, code reviews, career planning",
    result: "40% retention improvement, 3 promotions"
  },
  {
    id: 4,
    title: "Navigated Team Conflict Resolution",
    category: "Conflict",
    keywords: ["conflict", "disagree", "difficult", "challenge", "resolve", "mediate", "tension"],
    strength: 78,
    preview: "Mediated a heated disagreement between design and engineering teams that was blocking product launch.",
    situation: "Design vs Engineering deadlock",
    task: "Unblock product launch",
    action: "Facilitated joint workshop, found compromise",
    result: "Launched on time, improved collaboration"
  },
  {
    id: 5,
    title: "Recovered from Failed Product Launch",
    category: "Failure",
    keywords: ["fail", "failure", "mistake", "learn", "wrong", "setback", "recover"],
    strength: 75,
    preview: "Owned responsibility for a failed feature launch and led the pivot that turned it into our most successful product.",
    situation: "Feature launch with 5% adoption",
    task: "Decide: kill or pivot",
    action: "User research, complete redesign",
    result: "Pivoted to 85% adoption rate"
  },
  {
    id: 6,
    title: "Delivered Under Tight Deadline",
    category: "Time Management",
    keywords: ["deadline", "time", "pressure", "urgent", "fast", "quick", "prioritize"],
    strength: 85,
    preview: "Shipped a critical feature in 2 weeks instead of the estimated 6 weeks to meet a major client deadline.",
    situation: "Client ultimatum: deliver or lose contract",
    task: "Ship 6-week feature in 2 weeks",
    action: "Scope reduction, parallel workstreams",
    result: "Delivered on time, saved $2M contract"
  },
  {
    id: 7,
    title: "Built Successful Cross-Team Partnership",
    category: "Collaboration",
    keywords: ["collaborate", "team", "partner", "together", "cross", "stakeholder", "teamwork"],
    strength: 90,
    preview: "Established a partnership between engineering and sales that increased deal close rate by 25%.",
    situation: "Sales struggling with technical objections",
    task: "Bridge engineering-sales gap",
    action: "Created technical enablement program",
    result: "25% increase in close rate"
  }
]

const mockFeedback = [
  { metric: "Clarity", score: 85, trend: "up" },
  { metric: "Structure", score: 78, trend: "up" },
  { metric: "Impact", score: 92, trend: "stable" }
]

type Mode = 'brainstorm' | 'simulation'

export default function Dashboard({ userId }: DashboardProps) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [profileData, setProfileData] = useState<{ name?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  
  // Mode Toggle State
  const [mode, setMode] = useState<Mode>('brainstorm')
  
  // Simulation Mode State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Story Matcher
  const matchedStories = useMemo(() => {
    if (!searchQuery.trim()) return allStories.slice(0, 3)
    
    const query = searchQuery.toLowerCase()
    const scored = allStories.map(story => {
      let score = 0
      story.keywords.forEach(keyword => {
        if (query.includes(keyword)) score += 10
      })
      if (query.includes(story.category.toLowerCase())) score += 15
      if (story.title.toLowerCase().includes(query)) score += 5
      
      return { ...story, matchScore: score }
    })
    
    return scored
      .filter(s => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
  }, [searchQuery])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

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
      const questions = [
        "Tell me about a time you showed leadership",
        "Describe a conflict you resolved",
        "Tell me about a time you failed",
        "Describe your biggest achievement"
      ]
      setSearchQuery(questions[Math.floor(Math.random() * questions.length)])
    } else if (action === 'weakness') {
      setSearchQuery("Tell me about a time you failed or made a mistake")
    } else if (action === 'review') {
      setActiveView('practice')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startSimulation = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setShowAnswer(false)
  }

  const stopSimulation = () => {
    setIsRecording(false)
  }

  const resetSimulation = () => {
    setIsRecording(false)
    setRecordingTime(0)
    setShowAnswer(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-emerald-200 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-t-2 border-emerald-500 rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-emerald-600" />
          </div>
          <p className="mt-4 text-stone-500 font-medium">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      profileData={profileData}
      storiesCount={allStories.length}
    >
      {activeView === 'dashboard' ? (
        <div className="flex h-full">
          {/* Main Stage */}
          <div className="flex-1 p-8 lg:p-12">
            {/* Mode Toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-white rounded-full p-1.5 shadow-lg shadow-stone-200/50 border border-stone-100">
                <button
                  onClick={() => setMode('brainstorm')}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                    ${mode === 'brainstorm' 
                      ? 'bg-stone-900 text-white shadow-md' 
                      : 'text-stone-500 hover:text-stone-900'
                    }
                  `}
                >
                  <Brain className="w-5 h-5" />
                  Brainstorm
                </button>
                <button
                  onClick={() => setMode('simulation')}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                    ${mode === 'simulation' 
                      ? 'bg-stone-900 text-white shadow-md' 
                      : 'text-stone-500 hover:text-stone-900'
                    }
                  `}
                >
                  <Video className="w-5 h-5" />
                  Simulation
                </button>
              </div>
            </div>

            {mode === 'brainstorm' ? (
              <BrainstormView 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchFocused={searchFocused}
                setSearchFocused={setSearchFocused}
                onQuickAction={handleQuickAction}
              />
            ) : (
              <SimulationView
                searchQuery={searchQuery}
                isRecording={isRecording}
                recordingTime={recordingTime}
                showAnswer={showAnswer}
                setShowAnswer={setShowAnswer}
                formatTime={formatTime}
                startSimulation={startSimulation}
                stopSimulation={stopSimulation}
                resetSimulation={resetSimulation}
              />
            )}
          </div>

          {/* Right Context Panel */}
          <aside className="w-[360px] bg-white/60 backdrop-blur-sm border-l border-stone-200 p-6 overflow-y-auto">
            {mode === 'brainstorm' ? (
              <BrainstormPanel 
                searchQuery={searchQuery}
                matchedStories={matchedStories}
                mockFeedback={mockFeedback}
                onViewStories={() => setActiveView('stories')}
              />
            ) : (
              <SimulationPanel onSwitchMode={() => setMode('brainstorm')} />
            )}
          </aside>
        </div>
      ) : (
        <div className="p-8 lg:p-12">
          {activeView === 'stories' && <StoryBank userId={userId} />}
          {activeView === 'practice' && <PracticeMode userId={userId} />}
          {activeView === 'plan' && <PracticePlan userId={userId} />}
          {activeView === 'history' && (
            <div className="text-center text-stone-500 py-20">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>History coming soon...</p>
            </div>
          )}
          {activeView === 'settings' && (
            <div className="text-center text-stone-500 py-20">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Settings coming soon...</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}

// ============================================
// Brainstorm Mode Components
// ============================================

function BrainstormView({ 
  searchQuery, 
  setSearchQuery, 
  searchFocused, 
  setSearchFocused,
  onQuickAction 
}: {
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchFocused: boolean
  setSearchFocused: (f: boolean) => void
  onQuickAction: (action: string) => void
}) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Heading */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-5xl font-semibold mb-4 text-stone-900">
          What are you preparing for?
        </h1>
        <p className="text-lg text-stone-500">
          Type a question and see matching stories instantly.
        </p>
      </div>

      {/* Floating Search Bar */}
      <div className="relative group mb-12">
        {/* Gradient glow behind input */}
        <div className={`
          absolute -inset-1 bg-gradient-to-r from-emerald-100 via-amber-50 to-rose-100 
          rounded-full blur opacity-60 transition-opacity duration-500
          ${searchFocused ? 'opacity-100' : 'group-hover:opacity-80'}
        `} />
        
        <div className="relative flex items-center">
          <Search className={`absolute left-6 w-5 h-5 transition-colors ${
            searchFocused ? 'text-emerald-600' : 'text-stone-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="e.g., Tell me about a time you led a team..."
            className="
              w-full bg-white text-lg text-stone-800 placeholder:text-stone-400 
              py-5 pl-14 pr-40 rounded-full 
              shadow-xl shadow-stone-200/50 border border-stone-100 
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 
              transition-all
            "
          />
          <button 
            className="
              absolute right-3 bg-stone-900 hover:bg-stone-800 
              text-white px-6 py-2.5 rounded-full font-medium 
              transition-all active:scale-95 shadow-lg
            "
          >
            Generate
          </button>
        </div>
      </div>

      {/* Quick Suggestion Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {['Leadership', 'Conflict', 'Failure', 'Success', 'Teamwork'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSearchQuery(`Tell me about a time you demonstrated ${tag.toLowerCase()}`)}
            className="
              px-5 py-2 rounded-full text-sm font-medium
              bg-white text-stone-600 border border-stone-200
              hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50
              shadow-sm transition-all
            "
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Tips Section (shows when searching) */}
      {searchQuery && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Pro Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Use the <strong>STAR method</strong>: Situation, Task, Action, Result</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Quantify your impact with <strong>numbers and percentages</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Focus on <strong>your specific contributions</strong>, not just the team</span>
            </li>
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <QuickActionCard
          icon={<Zap className="w-6 h-6" />}
          title="Surprise Me"
          description="Random question"
          color="amber"
          onClick={() => onQuickAction('surprise')}
        />
        <QuickActionCard
          icon={<History className="w-6 h-6" />}
          title="Review Last"
          description="Continue practicing"
          color="purple"
          onClick={() => onQuickAction('review')}
        />
        <QuickActionCard
          icon={<Target className="w-6 h-6" />}
          title="Weakness Drill"
          description="Practice weak areas"
          color="rose"
          onClick={() => onQuickAction('weakness')}
        />
      </div>
    </div>
  )
}

function BrainstormPanel({ 
  searchQuery, 
  matchedStories, 
  mockFeedback,
  onViewStories 
}: {
  searchQuery: string
  matchedStories: typeof allStories
  mockFeedback: typeof mockFeedback
  onViewStories: () => void
}) {
  return (
    <>
      {/* Story Matcher */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            {searchQuery ? 'Matching Stories' : 'Your Top Stories'}
          </h3>
          <button 
            onClick={onViewStories}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {searchQuery && (
          <div className="mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-stone-500">
              Found {matchedStories.length} matching {matchedStories.length === 1 ? 'story' : 'stories'}
            </span>
          </div>
        )}
        
        <div className="space-y-3">
          {matchedStories.length > 0 ? (
            matchedStories.map((story) => (
              <StoryCard key={story.id} story={story} isMatched={!!searchQuery} />
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <p className="text-stone-500 text-sm">No matching stories found</p>
              <p className="text-xs text-stone-400 mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      </section>

      {/* Performance Stats */}
      <section>
        <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">
          Recent Performance
        </h3>
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="space-y-4">
            {mockFeedback.map((item) => (
              <div key={item.metric} className="flex items-center justify-between">
                <span className="text-sm text-stone-600">{item.metric}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.score >= 90 ? 'bg-emerald-500' :
                        item.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-stone-900 w-8">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="text-2xl font-bold text-stone-900">12</div>
            <div className="text-xs text-stone-500">Questions Practiced</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">2.5h</div>
            <div className="text-xs text-stone-500">Total Practice Time</div>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// Simulation Mode Components
// ============================================

function SimulationView({
  searchQuery,
  isRecording,
  recordingTime,
  showAnswer,
  setShowAnswer,
  formatTime,
  startSimulation,
  stopSimulation,
  resetSimulation
}: {
  searchQuery: string
  isRecording: boolean
  recordingTime: number
  showAnswer: boolean
  setShowAnswer: (show: boolean) => void
  formatTime: (seconds: number) => string
  startSimulation: () => void
  stopSimulation: () => void
  resetSimulation: () => void
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-serif text-5xl font-semibold mb-4 text-stone-900">
          Simulation Mode
        </h1>
        <p className="text-lg text-stone-500">
          No hints. No cheating. Just you and the question.
        </p>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-lg mb-8">
        <p className="text-xl text-center text-stone-800 font-medium">
          {searchQuery || "Tell me about a time you demonstrated leadership"}
        </p>
      </div>

      {/* Recording Area */}
      <div className="aspect-video max-w-2xl mx-auto rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {!isRecording ? (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center shadow-lg">
                <Video className="w-10 h-10 text-stone-400" />
              </div>
              <p className="text-stone-500 mb-6">Ready to record your answer</p>
              <button 
                onClick={startSimulation}
                className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-full font-medium shadow-lg transition-all active:scale-95"
              >
                <Play className="w-5 h-5 inline mr-2" />
                Start Recording
              </button>
            </div>
          ) : (
            <div className="text-center">
              {/* Audio Wave Visualization */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 60 + 20}px`,
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.3 + Math.random() * 0.3}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="text-5xl font-mono text-stone-900 mb-6 font-bold">
                {formatTime(recordingTime)}
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-rose-600 font-medium">Recording</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={stopSimulation}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full font-medium transition-all"
                >
                  <Pause className="w-5 h-5 inline mr-2" />
                  Stop
                </button>
                <button 
                  onClick={resetSimulation}
                  className="bg-white hover:bg-stone-50 text-stone-600 px-6 py-3 rounded-full font-medium border border-stone-200 transition-all"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="absolute inset-0 border-4 border-rose-400 rounded-2xl animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Post-Recording Actions */}
      {!isRecording && recordingTime > 0 && (
        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={() => setShowAnswer(!showAnswer)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium transition-all"
          >
            {showAnswer ? 'Hide' : 'Show'} Suggested Answer
          </button>
          <button 
            onClick={resetSimulation}
            className="bg-white hover:bg-stone-50 text-stone-600 px-6 py-3 rounded-full font-medium border border-stone-200 transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

function SimulationPanel({ onSwitchMode }: { onSwitchMode: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
        <Video className="w-8 h-8 text-rose-400" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">Focus Mode</h3>
      <p className="text-sm text-stone-500 max-w-[200px] mb-6">
        Stories and hints are hidden. Answer naturally like in a real interview.
      </p>
      <button
        onClick={onSwitchMode}
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
      >
        Switch to Brainstorm <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ============================================
// Shared Components
// ============================================

function QuickActionCard({ 
  icon, 
  title, 
  description, 
  color,
  onClick 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  color: 'amber' | 'purple' | 'rose'
  onClick: () => void
}) {
  const colorClasses = {
    amber: 'bg-amber-50 border-amber-100 hover:border-amber-200 text-amber-600',
    purple: 'bg-purple-50 border-purple-100 hover:border-purple-200 text-purple-600',
    rose: 'bg-rose-50 border-rose-100 hover:border-rose-200 text-rose-600'
  }

  return (
    <button
      onClick={onClick}
      className={`
        p-6 rounded-2xl border transition-all text-left group
        hover:shadow-md hover:-translate-y-0.5
        ${colorClasses[color]}
      `}
    >
      <div className="mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="font-semibold text-stone-900 mb-1">{title}</h4>
      <p className="text-xs text-stone-500">{description}</p>
    </button>
  )
}

function StoryCard({ story, isMatched }: { story: typeof allStories[0], isMatched: boolean }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className={`
        group bg-white rounded-2xl p-5 border transition-all cursor-pointer
        ${isMatched 
          ? 'border-emerald-200 shadow-md shadow-emerald-100/50' 
          : 'border-stone-100 shadow-sm hover:shadow-md hover:border-emerald-100'
        }
      `}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          {story.category}
        </span>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="font-medium">{story.strength}%</span>
        </div>
      </div>
      
      <h4 className="font-serif text-lg font-semibold text-stone-900 mb-2 group-hover:text-emerald-700 transition-colors">
        {story.title}
      </h4>
      
      <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{story.preview}</p>
      
      {/* Expanded STAR View */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
          <div className="text-sm">
            <span className="text-emerald-600 font-semibold">S:</span>
            <span className="text-stone-600 ml-2">{story.situation}</span>
          </div>
          <div className="text-sm">
            <span className="text-emerald-600 font-semibold">T:</span>
            <span className="text-stone-600 ml-2">{story.task}</span>
          </div>
          <div className="text-sm">
            <span className="text-emerald-600 font-semibold">A:</span>
            <span className="text-stone-600 ml-2">{story.action}</span>
          </div>
          <div className="text-sm">
            <span className="text-emerald-600 font-semibold">R:</span>
            <span className="text-stone-600 ml-2">{story.result}</span>
          </div>
        </div>
      )}
      
      {/* Read More Arrow */}
      <div className={`
        mt-3 flex items-center text-emerald-600 text-sm font-medium 
        transition-all transform
        ${expanded ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'}
      `}>
        Read story <ArrowUpRight className="w-4 h-4 ml-1" />
      </div>
      
      {isMatched && !expanded && (
        <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle className="w-3 h-3" />
          <span>Great match!</span>
        </div>
      )}
    </div>
  )
}
