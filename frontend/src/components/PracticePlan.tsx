'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Zap,
  ChevronRight,
  Play,
  Lock,
  Sparkles,
  RotateCcw
} from 'lucide-react'
import { generatePlan, getPlan } from '@/lib/api'

interface PracticePlanProps {
  userId: string
}

interface DayTask {
  title: string
  description: string
  duration: number
  type: string
  completed?: boolean
}

interface PracticePlanData {
  plan_id: string
  user_id: string
  duration_days: number
  daily_tasks: { tasks: DayTask[] }[]
  focus_areas: string[]
  target_competencies: string[]
  stories_to_strengthen: string[]
  created_at: string
  current_day?: number
}

// Mock data for demo when API isn't available
const mockPlanData: PracticePlanData = {
  plan_id: 'mock-plan',
  user_id: 'mock-user',
  duration_days: 7,
  current_day: 3,
  daily_tasks: [
    { tasks: [{ title: 'The Foundation', description: 'Learn the STAR method basics', duration: 15, type: 'Learn', completed: true }] },
    { tasks: [{ title: 'Behavioral Basics', description: 'Structure your first story', duration: 20, type: 'Practice', completed: true }] },
    { tasks: [{ title: 'Mastering "Conflict"', description: 'Structure your story about a disagreement with a coworker', duration: 15, type: 'Practice', completed: false }] },
    { tasks: [{ title: 'Leadership Challenge', description: 'Practice leading without authority', duration: 20, type: 'Practice', completed: false }] },
    { tasks: [{ title: 'Failure & Growth', description: 'Turn setbacks into strengths', duration: 15, type: 'Practice', completed: false }] },
    { tasks: [{ title: 'Mock Interview #1', description: 'Full practice session with feedback', duration: 30, type: 'Simulation', completed: false }] },
    { tasks: [{ title: 'Final Review', description: 'Polish your top 3 stories', duration: 25, type: 'Review', completed: false }] },
  ],
  focus_areas: ['Leadership', 'Conflict Resolution', 'Problem Solving'],
  target_competencies: ['Communication', 'Adaptability', 'Decision Making'],
  stories_to_strengthen: ['Project X Migration', 'Team Conflict'],
  created_at: new Date().toISOString()
}

export default function PracticePlan({ userId }: PracticePlanProps) {
  const [plan, setPlan] = useState<PracticePlanData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [currentDay, setCurrentDay] = useState(3) // Demo: Day 3 is active

  useEffect(() => {
    loadExistingPlan()
  }, [userId])

  const loadExistingPlan = async () => {
    try {
      const response = await getPlan(userId)
      if (response.success && response.plan) {
        setPlan(response.plan)
      }
    } catch (error) {
      // No existing plan, that's fine
    }
  }

  const handleGeneratePlan = async (duration: number = 7) => {
    setGenerating(true)
    try {
      const response = await generatePlan(userId, duration)
      if (response.success) {
        setPlan(response.plan)
        setCurrentDay(1)
      }
    } catch (error: any) {
      // Use mock data for demo
      setPlan({ ...mockPlanData, duration_days: duration })
      setCurrentDay(1)
    } finally {
      setGenerating(false)
    }
  }

  const handleResetPlan = () => {
    setPlan(null)
  }

  // No plan selected - Show Commitment Contracts
  if (!plan) {
    return <PlanSelection onSelectPlan={handleGeneratePlan} generating={generating} />
  }

  // Plan selected - Show Timeline
  return (
    <PlanTimeline 
      plan={plan} 
      currentDay={currentDay} 
      onResetPlan={handleResetPlan}
      onStartSession={() => {}}
    />
  )
}

// ============================================
// Plan Selection View (Commitment Contracts)
// ============================================

function PlanSelection({ 
  onSelectPlan, 
  generating 
}: { 
  onSelectPlan: (days: number) => void
  generating: boolean 
}) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-emerald-100 blur-xl opacity-60" />
          <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-50 to-stone-100 border-2 border-stone-200 flex items-center justify-center">
            <Calendar className="w-9 h-9 text-emerald-600" />
          </div>
        </div>
        <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-3">
          Choose Your Commitment
        </h1>
        <p className="text-stone-500 text-lg max-w-md mx-auto">
          Pick a practice schedule and we'll create a personalized journey to interview mastery.
        </p>
      </div>

      {/* Commitment Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* 7-Day Sprint */}
        <CommitmentCard
          duration={7}
          title="The Sprint"
          subtitle="Quick preparation"
          icon={<Zap className="w-6 h-6" />}
          features={[
            "15 mins/day",
            "Core STAR stories",
            "Top 3 competencies"
          ]}
          recommended={false}
          onSelect={() => onSelectPlan(7)}
          generating={generating}
        />

        {/* 14-Day Intensive */}
        <CommitmentCard
          duration={14}
          title="The Intensive"
          subtitle="Comprehensive practice"
          icon={<Target className="w-6 h-6" />}
          features={[
            "20 mins/day",
            "Full story bank review",
            "Mock interviews included"
          ]}
          recommended={true}
          onSelect={() => onSelectPlan(14)}
          generating={generating}
        />

        {/* 30-Day Mastery */}
        <CommitmentCard
          duration={30}
          title="The Mastery"
          subtitle="Complete transformation"
          icon={<Trophy className="w-6 h-6" />}
          features={[
            "25 mins/day",
            "Deep competency work",
            "Weekly mock sessions"
          ]}
          recommended={false}
          onSelect={() => onSelectPlan(30)}
          generating={generating}
        />
      </div>

      {/* Trust Signal */}
      <div className="mt-12 text-center">
        <p className="text-stone-400 text-sm">
          Your plan adapts based on your progress. You can always adjust later.
        </p>
      </div>
    </div>
  )
}

function CommitmentCard({
  duration,
  title,
  subtitle,
  icon,
  features,
  recommended,
  onSelect,
  generating
}: {
  duration: number
  title: string
  subtitle: string
  icon: React.ReactNode
  features: string[]
  recommended: boolean
  onSelect: () => void
  generating: boolean
}) {
  return (
    <div className={`
      relative bg-white rounded-2xl p-6 border-2 transition-all hover:-translate-y-1
      ${recommended 
        ? 'border-emerald-300 shadow-xl shadow-emerald-100/50' 
        : 'border-stone-200 hover:border-emerald-200 hover:shadow-lg'
      }
    `}>
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Recommended
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={`
          w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4
          ${recommended ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}
        `}>
          {icon}
        </div>
        <div className="text-4xl font-bold text-stone-900 mb-1">{duration}</div>
        <div className="text-stone-400 text-sm uppercase tracking-wide">Days</div>
      </div>

      <h3 className="font-serif text-xl font-semibold text-stone-900 text-center mb-1">{title}</h3>
      <p className="text-stone-500 text-sm text-center mb-6">{subtitle}</p>

      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-stone-600">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={generating}
        className={`
          w-full py-3 rounded-full font-medium transition-all disabled:opacity-50
          ${recommended 
            ? 'bg-stone-900 text-white hover:bg-stone-800' 
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }
        `}
      >
        {generating ? 'Creating...' : 'Start This Plan'}
      </button>
    </div>
  )
}

// ============================================
// Timeline View (The Journey Map)
// ============================================

function PlanTimeline({ 
  plan, 
  currentDay,
  onResetPlan,
  onStartSession
}: { 
  plan: PracticePlanData
  currentDay: number
  onResetPlan: () => void
  onStartSession: () => void
}) {
  const completedDays = currentDay - 1

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl text-stone-900 mb-2">
          Your {plan.duration_days}-Day Journey
        </h2>
        <p className="text-stone-500">
          Day {currentDay} of {plan.duration_days} • Keep the momentum going
        </p>
        
        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-stone-400 mb-2">
            <span>{completedDays} completed</span>
            <span>{plan.duration_days - completedDays} remaining</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedDays / plan.duration_days) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6 pl-8 border-l-2 border-stone-100 ml-4">
        {plan.daily_tasks.map((day, index) => {
          const dayNumber = index + 1
          const isCompleted = dayNumber < currentDay
          const isActive = dayNumber === currentDay
          const isFuture = dayNumber > currentDay
          const task = day.tasks?.[0]

          return (
            <div key={index} className="relative">
              {/* Timeline Node */}
              <div className={`
                absolute -left-[41px] w-6 h-6 rounded-full border-4 border-white flex items-center justify-center
                ${isCompleted ? 'bg-emerald-500' : ''}
                ${isActive ? 'w-7 h-7 -left-[43px] bg-white border-emerald-500 shadow-sm' : ''}
                ${isFuture ? 'bg-stone-200' : ''}
              `}>
                {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
              </div>

              {/* Day Card */}
              {isActive ? (
                // Active Day - Hero Card
                <div className="bg-white p-6 rounded-2xl shadow-lg shadow-stone-200/50 border border-emerald-100">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-emerald-600 font-bold text-sm tracking-wide uppercase">
                      Today's Focus
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{task?.duration || 15} mins
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-2xl text-stone-900 mb-2">
                    Day {dayNumber}: {task?.title || 'Practice Session'}
                  </h3>
                  <p className="text-stone-500 mb-6">
                    {task?.description || 'Continue your practice journey.'}
                  </p>
                  
                  <button 
                    onClick={onStartSession}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-full font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Session
                  </button>
                </div>
              ) : isCompleted ? (
                // Completed Day
                <div className="bg-stone-50 p-5 rounded-xl border border-stone-100 opacity-70">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-stone-500 line-through">
                      Day {dayNumber}: {task?.title || 'Completed'}
                    </h3>
                    <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Done
                    </span>
                  </div>
                </div>
              ) : (
                // Future Day
                <div className="bg-white p-5 rounded-xl border border-dashed border-stone-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-stone-400">
                      Day {dayNumber}: {task?.title || 'Upcoming'}
                    </h3>
                    <Lock className="w-4 h-4 text-stone-300" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Focus Areas */}
      <div className="mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h4 className="font-semibold text-amber-800">This Week's Focus</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.focus_areas.map((area, idx) => (
            <span 
              key={idx}
              className="px-3 py-1.5 bg-white/80 text-amber-900 text-sm rounded-full border border-amber-200"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Reset Plan Option */}
      <div className="mt-8 text-center">
        <button
          onClick={onResetPlan}
          className="text-stone-400 hover:text-stone-600 text-sm font-medium flex items-center gap-1.5 mx-auto transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Choose a Different Plan
        </button>
      </div>
    </div>
  )
}
