'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Calendar, Target, CheckCircle2, Clock, Trophy, Zap } from 'lucide-react'
import { generatePlan, getPlan } from '@/lib/api'

interface PracticePlanProps {
  userId: string
}

interface PracticePlanData {
  plan_id: string
  user_id: string
  duration_days: number
  daily_tasks: any[]
  focus_areas: string[]
  target_competencies: string[]
  stories_to_strengthen: string[]
  created_at: string
}

export default function PracticePlan({ userId }: PracticePlanProps) {
  const [plan, setPlan] = useState<PracticePlanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadExistingPlan()
  }, [userId])

  const loadExistingPlan = async () => {
    try {
      const response = await getPlan(userId)
      if (response.success) {
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
      }
    } catch (error: any) {
      alert(error.message || 'Failed to generate practice plan')
    } finally {
      setGenerating(false)
    }
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Your Personalized Practice Plan
            </CardTitle>
            <CardDescription>
              Get a structured practice schedule tailored to your strengths and areas for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Create Your Practice Plan</h3>
              <p className="text-muted-foreground mb-6">
                We'll analyze your story bank and create a personalized practice schedule
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-medium">7-Day Plan</h4>
                  <p className="text-sm text-muted-foreground">Balanced practice schedule</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-medium">14-Day Plan</h4>
                  <p className="text-sm text-muted-foreground">Intensive improvement</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-medium">30-Day Plan</h4>
                  <p className="text-sm text-muted-foreground">Master behavioral interviews</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleGeneratePlan(7)}
                  disabled={generating}
                  size="lg"
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {generating ? 'Generating...' : 'Create 7-Day Plan'}
                </Button>
                <Button
                  onClick={() => handleGeneratePlan(14)}
                  disabled={generating}
                  variant="outline"
                  size="lg"
                >
                  14-Day Plan
                </Button>
                <Button
                  onClick={() => handleGeneratePlan(30)}
                  disabled={generating}
                  variant="outline"
                  size="lg"
                >
                  30-Day Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Your {plan.duration_days}-Day Practice Plan
          </CardTitle>
          <CardDescription>
            Created on {new Date(plan.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold">{plan.target_competencies.length}</h4>
              <p className="text-sm text-muted-foreground">Target Competencies</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold">{plan.daily_tasks.length}</p>
              <p className="text-sm text-muted-foreground">Daily Tasks</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">{plan.stories_to_strengthen.length}</p>
              <p className="text-sm text-muted-foreground">Stories to Strengthen</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <h4 className="font-semibold">Focus Areas:</h4>
            <div className="flex flex-wrap gap-2">
              {plan.focus_areas.map((area, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Target Competencies:</h4>
            <div className="flex flex-wrap gap-2">
              {plan.target_competencies.map((comp, idx) => (
                <span key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                  {comp}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Practice Schedule</h3>
        {plan.daily_tasks.map((day, dayIndex) => (
          <Card key={dayIndex}>
            <CardHeader>
              <CardTitle className="text-base">Day {dayIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {day.tasks?.map((task: any, taskIndex: number) => (
                  <div key={taskIndex} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-primary">{taskIndex + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      {task.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: {task.duration} minutes
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {task.type}
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">No tasks scheduled for this day</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button
              onClick={() => handleGeneratePlan(plan.duration_days)}
              disabled={generating}
              variant="outline"
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Regenerate Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
