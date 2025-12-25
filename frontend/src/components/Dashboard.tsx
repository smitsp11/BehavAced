'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import QuestionAsker from '@/components/QuestionAsker'
import StoryBank from '@/components/StoryBank'
import PracticeMode from '@/components/PracticeMode'
import PracticePlan from '@/components/PracticePlan'
import { 
  BookOpen, 
  Mic, 
  Trophy, 
  Sparkles, 
  Loader2,
  Search,
  Zap,
  Target,
  Brain,
  History,
  Settings,
  ChevronRight,
  Star,
  TrendingUp,
  LayoutDashboard,
  Lightbulb,
  Video,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  Volume2
} from 'lucide-react'
import { getProfile } from '@/lib/api'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

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
  const [activeView, setActiveView] = useState<'dashboard' | 'stories' | 'practice' | 'plan' | 'settings'>('dashboard')
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  
  // Mode Toggle State
  const [mode, setMode] = useState<Mode>('brainstorm')
  
  // Simulation Mode State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Background processing state
  const { 
    isBackgroundProcessingComplete, 
    getBackgroundProcessingProgress,
    backgroundTasks 
  } = useOnboardingStore()
  
  const [processingComplete, setProcessingComplete] = useState(false)
  const [processingProgress, setProcessingProgress] = useState({ completed: 0, total: 4, percentage: 0 })

  // Story Matcher - filter stories based on search query
  const matchedStories = useMemo(() => {
    if (!searchQuery.trim()) return allStories.slice(0, 3) // Show top 3 by default
    
    const query = searchQuery.toLowerCase()
    const scored = allStories.map(story => {
      let score = 0
      // Check keywords
      story.keywords.forEach(keyword => {
        if (query.includes(keyword)) score += 10
      })
      // Check category
      if (query.includes(story.category.toLowerCase())) score += 15
      // Check title
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

  const profileStrength = 85

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
            badge={allStories.length}
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
              {/* Mode Toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
                  <button
                    onClick={() => setMode('brainstorm')}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                      ${mode === 'brainstorm' 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' 
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <Brain className="w-5 h-5" />
                    Brainstorm Mode
                  </button>
                  <button
                    onClick={() => setMode('simulation')}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                      ${mode === 'simulation' 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25' 
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <Video className="w-5 h-5" />
                    Simulation Mode
                  </button>
                </div>
              </div>

              {mode === 'brainstorm' ? (
                /* Brainstorm Mode Content */
                <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                      What are you prepping for?
                    </h1>
                    <p className="text-gray-500">Type your question and see matching stories instantly</p>
                  </div>

                  {/* Search Bar */}
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

                  {/* Brainstorm Tips Section */}
                  {searchQuery && (
                    <div className="w-full mt-8 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        <h3 className="font-semibold text-amber-400">Why This Works</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Use the STAR method: Situation, Task, Action, Result</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Quantify your impact whenever possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Focus on YOUR specific contributions</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-3 gap-4 mt-8 w-full">
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
              ) : (
                /* Simulation Mode Content */
                <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      Simulation Mode
                    </h1>
                    <p className="text-gray-500">No hints. No cheating. Just you and the question.</p>
                  </div>

                  {/* Question Display */}
                  <div className="w-full p-6 rounded-2xl bg-[#1a1a2e]/80 border border-white/10 mb-8">
                    <p className="text-xl text-center text-white">
                      {searchQuery || "Tell me about a time you demonstrated leadership"}
                    </p>
                  </div>

                  {/* Video/Audio Simulation Area */}
                  <div className="w-full aspect-video max-w-2xl rounded-2xl bg-[#0a0a0f] border border-white/10 overflow-hidden relative">
                    {/* Simulated Camera View */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {!isRecording ? (
                        <div className="text-center">
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center justify-center">
                            <Video className="w-10 h-10 text-red-400" />
                          </div>
                          <p className="text-gray-500 mb-6">Ready to record your answer</p>
                          <Button 
                            onClick={startSimulation}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-red-500/25"
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Start Recording
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          {/* Audio Visualization */}
                          <div className="flex items-center justify-center gap-1 mb-6">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-gradient-to-t from-red-500 to-pink-400 rounded-full animate-pulse"
                                style={{
                                  height: `${Math.random() * 60 + 20}px`,
                                  animationDelay: `${i * 0.05}s`,
                                  animationDuration: `${0.3 + Math.random() * 0.3}s`
                                }}
                              />
                            ))}
                          </div>
                          
                          {/* Timer */}
                          <div className="text-5xl font-mono text-white mb-6">
                            {formatTime(recordingTime)}
                          </div>
                          
                          {/* Recording Indicator */}
                          <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-400 font-medium">Recording</span>
                          </div>

                          <div className="flex items-center justify-center gap-4">
                            <Button 
                              onClick={stopSimulation}
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-3 rounded-xl"
                            >
                              <Pause className="w-5 h-5 mr-2" />
                              Stop
                            </Button>
                            <Button 
                              onClick={resetSimulation}
                              variant="outline"
                              className="border-white/20 text-gray-400 hover:bg-white/5 px-6 py-3 rounded-xl"
                            >
                              <RotateCcw className="w-5 h-5 mr-2" />
                              Reset
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recording Border Animation */}
                    {isRecording && (
                      <div className="absolute inset-0 border-2 border-red-500 rounded-2xl animate-pulse" />
                    )}
                  </div>

                  {/* Post-Recording Actions */}
                  {!isRecording && recordingTime > 0 && (
                    <div className="mt-8 flex items-center gap-4">
                      <Button 
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl"
                      >
                        {showAnswer ? 'Hide' : 'Show'} Suggested Answer
                      </Button>
                      <Button 
                        onClick={resetSimulation}
                        variant="outline"
                        className="border-white/20 text-gray-400 hover:bg-white/5 px-6 py-3 rounded-xl"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Context Panel */}
            <aside className="w-[340px] bg-[#0d0d14]/60 backdrop-blur-xl border-l border-white/5 p-6 relative z-10 overflow-y-auto">
              {mode === 'brainstorm' ? (
                <>
                  {/* Story Matcher - Dynamic Stories */}
                  <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        {searchQuery ? (
                          <>
                            <Zap className="w-4 h-4 text-cyan-400" />
                            Matching Stories
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 text-yellow-400" />
                            Your Top Stories
                          </>
                        )}
                      </h3>
                      <button 
                        onClick={() => setActiveView('stories')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Live Filtering Indicator */}
                    {searchQuery && (
                      <div className="mb-3 text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        Found {matchedStories.length} matching {matchedStories.length === 1 ? 'story' : 'stories'}
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {matchedStories.length > 0 ? (
                        matchedStories.map((story) => (
                          <StoryMatchCard key={story.id} story={story} isMatched={!!searchQuery} />
                        ))
                      ) : (
                        <div className="p-4 rounded-xl bg-[#1a1a2e]/50 border border-white/5 text-center">
                          <p className="text-gray-500 text-sm">No matching stories found</p>
                          <p className="text-xs text-gray-600 mt-1">Try different keywords</p>
                        </div>
                      )}
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
                </>
              ) : (
                /* Simulation Mode - Hidden Panel */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Focus Mode Active</h3>
                  <p className="text-sm text-gray-500 max-w-[200px]">
                    Stories and hints are hidden. Answer naturally as you would in a real interview.
                  </p>
                  <button
                    onClick={() => setMode('brainstorm')}
                    className="mt-6 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Switch to Brainstorm <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
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

// Story Match Card Component - Enhanced for Story Matcher
function StoryMatchCard({ story, isMatched }: { story: typeof allStories[0], isMatched: boolean }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className={`
        p-4 rounded-xl border transition-all cursor-pointer group
        ${isMatched 
          ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
          : 'bg-[#1a1a2e]/50 border-white/5 hover:border-cyan-500/30'
        }
      `}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isMatched ? 'bg-cyan-500/30 text-cyan-300' : 'bg-cyan-500/20 text-cyan-400'
        }`}>
          {story.category}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          {story.strength}%
        </div>
      </div>
      <h4 className={`font-medium text-sm mb-1 transition-colors ${
        isMatched ? 'text-cyan-300' : 'text-white group-hover:text-cyan-400'
      }`}>
        {story.title}
      </h4>
      <p className="text-xs text-gray-500 line-clamp-2">{story.preview}</p>
      
      {/* Expanded STAR View */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          <div className="text-xs">
            <span className="text-cyan-400 font-medium">S:</span>
            <span className="text-gray-400 ml-1">{story.situation}</span>
          </div>
          <div className="text-xs">
            <span className="text-cyan-400 font-medium">T:</span>
            <span className="text-gray-400 ml-1">{story.task}</span>
          </div>
          <div className="text-xs">
            <span className="text-cyan-400 font-medium">A:</span>
            <span className="text-gray-400 ml-1">{story.action}</span>
          </div>
          <div className="text-xs">
            <span className="text-cyan-400 font-medium">R:</span>
            <span className="text-gray-400 ml-1">{story.result}</span>
          </div>
        </div>
      )}
      
      {isMatched && (
        <div className="mt-2 flex items-center gap-1 text-xs text-cyan-400">
          <CheckCircle className="w-3 h-3" />
          <span>Great match for this question!</span>
        </div>
      )}
    </div>
  )
}
