'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Sparkles, CheckCircle2, Brain, BookOpen, ArrowRight, MinusCircle } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { createPersonalitySnapshot, processManualExperience, generateStoryBrain, generateStories } from '@/lib/api'

interface ProcessingStepProps {
  onComplete: (userId: string) => void
}

export default function ProcessingStep({ onComplete }: ProcessingStepProps) {
  const {
    userId,
    personalityData,
    experienceChoice,
    resumeFile,
    manualExperienceData,
    voiceFile,
    setProcessing,
    setError,
    completeStep
    // TEMPORARILY DISABLED: Background tasks for design testing
    // backgroundTasks,
    // getBackgroundTaskStatus
  } = useOnboardingStore()

  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [taskStatus, setTaskStatus] = useState<Record<string, 'completed' | 'skipped'>>({})
  const [failedTasks, setFailedTasks] = useState<string[]>([])
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({})

  const processingSteps = [
    { id: 'personality', label: 'Creating personality snapshot', duration: 2000 },
    { id: 'experience', label: experienceChoice === 'resume' ? 'Processing resume' : 'Processing manual experience', duration: 3000 },
    { id: 'voice', label: 'Analyzing voice sample (optional)', duration: voiceFile ? 2000 : 500 },
    { id: 'story-brain', label: 'Generating story brain', duration: 4000 },
    { id: 'finalizing', label: 'Finalizing profile', duration: 1000 }
  ]

  // TEMPORARILY DISABLED: Background task helper for design testing
  // Helper function to wait for background task completion
  // const waitForBackgroundTask = async (
  //   task: 'personalitySnapshot' | 'resumeProcessing' | 'storyBrain',
  //   intervalMs: number = 1000,
  //   maxAttempts: number = 30
  // ): Promise<void> => {
  //   let attempts = 0
  //   while (attempts < maxAttempts) {
  //     const taskStatus = getBackgroundTaskStatus(task)
  //     if (taskStatus.status === 'completed') {
  //       return
  //     }
  //     if (taskStatus.status === 'error') {
  //       throw new Error(taskStatus.error || 'Background task failed')
  //     }
  //     await new Promise(resolve => setTimeout(resolve, intervalMs))
  //     attempts++
  //   }
  //   throw new Error('Background task timeout')
  // }

  useEffect(() => {
    startProcessing()
  }, [])

  const startProcessing = async () => {
    setProcessing(true, 'Initializing...', 0)

    try {
      // TEMPORARILY DISABLED: Background task checking for design testing
      // Check background task status
      // const personalityTask = getBackgroundTaskStatus('personalitySnapshot')
      // const resumeTask = getBackgroundTaskStatus('resumeProcessing')

      // Step 1: Personality Snapshot
      // Process normally without background task checking
      setCurrentStep('Creating personality snapshot...')
      setProgress(10)

      if (personalityData) {
        const responses = {
          work_style: personalityData.work_style,
          communication: personalityData.communication,
          strengths: personalityData.strengths,
          challenges: personalityData.challenges,
        }
        await createPersonalitySnapshot(userId!, responses, personalityData.writing_sample)
        completeStep('personality')
        setCompletedTasks(prev => [...prev, 'Personality profile created'])
        setTaskStatus(prev => ({ ...prev, 'Personality profile created': 'completed' }))
      }

      // Step 2: Experience Processing
      if (experienceChoice === 'resume' && resumeFile) {
        // Already uploaded, mark as completed
        setCurrentStep('Resume analyzed')
        setProgress(35)
        setCompletedTasks(prev => [...prev, 'Resume analyzed'])
        setTaskStatus(prev => ({ ...prev, 'Resume analyzed': 'completed' }))
      } else if (experienceChoice === 'manual' && manualExperienceData) {
        setCurrentStep('Processing experience...')
        setProgress(35)
        await processManualExperience(
          userId!,
          manualExperienceData.experiences,
          undefined,
          manualExperienceData.additional_skills
        )
        setCompletedTasks(prev => [...prev, 'Experience data processed'])
        setTaskStatus(prev => ({ ...prev, 'Experience data processed': 'completed' }))
      }

      completeStep(experienceChoice === 'resume' ? 'resume-upload' : 'manual-experience')

      // Step 3: Voice Analysis (optional)
      setCurrentStep('Analyzing voice sample...')
      setProgress(60)

      if (voiceFile) {
        // TODO: Implement voice upload when backend is ready
        // await uploadVoice(userId!, voiceFile, duration)
        setCompletedTasks(prev => [...prev, 'Voice sample analyzed'])
        setTaskStatus(prev => ({ ...prev, 'Voice sample analyzed': 'completed' }))
      } else {
        setCompletedTasks(prev => [...prev, 'Voice analysis skipped'])
        setTaskStatus(prev => ({ ...prev, 'Voice analysis skipped': 'skipped' }))
      }

      completeStep('voice-upload')

      // Step 4: Generate Stories (required before story brain)
      setCurrentStep('Extracting stories from your experience...')
      setProgress(70)

      try {
        await generateStories(userId!)
        setCompletedTasks(prev => [...prev, 'Stories extracted'])
        setTaskStatus(prev => ({ ...prev, 'Stories extracted': 'completed' }))
      } catch (error: any) {
        // If stories can't be generated (e.g., no experiences), log but continue
        console.warn('Could not generate stories:', error.message)
        setCompletedTasks(prev => [...prev, 'Story extraction skipped'])
        setTaskStatus(prev => ({ ...prev, 'Story extraction skipped': 'skipped' }))
      }

      // Step 5: Story Brain Generation
      setCurrentStep('Building your story brain...')
      setProgress(85)

      try {
        await generateStoryBrain(userId!)
        setCompletedTasks(prev => [...prev, 'Story brain generated'])
        setTaskStatus(prev => ({ ...prev, 'Story brain generated': 'completed' }))
      } catch (error: any) {
        // If story brain can't be generated (e.g., no stories), log but continue
        console.warn('Could not generate story brain:', error.message)
        setCompletedTasks(prev => [...prev, 'Story brain generation skipped'])
        setTaskStatus(prev => ({ ...prev, 'Story brain generation skipped': 'skipped' }))
      }

      // Step 5: Finalizing
      setCurrentStep('Finalizing your profile...')
      setProgress(95)

      completeStep('processing')
      completeStep('complete')

      setProgress(100)
      setProcessing(false, 'Complete!', 100)

      // Complete onboarding after a short delay
      setTimeout(() => {
        onComplete(userId!)
      }, 2000)

    } catch (error: any) {
      setProcessing(false, 'Error occurred', 0)
      setError(error.message || 'Processing failed')
      console.error('Processing error:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 animate-pulse" />
          Building Your Profile
        </CardTitle>
        <CardDescription>
          AI is analyzing your information and creating personalized behavioral interview tools.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-8">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{currentStep}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Processing Steps */}
        <div className="space-y-3">
          {processingSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              {completedTasks.some(task =>
                task.toLowerCase().includes(step.label.toLowerCase().split(' ')[0])
              ) ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : progress > (index / processingSteps.length) * 100 ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
              )}
              <span className={
                completedTasks.some(task =>
                  task.toLowerCase().includes(step.label.toLowerCase().split(' ')[0])
                )
                  ? 'text-green-700 font-medium'
                  : progress > (index / processingSteps.length) * 100
                    ? 'text-blue-700 font-medium'
                    : 'text-gray-500'
              }>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Completed Tasks Summary */}
        {completedTasks.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200/60 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <BookOpen className="w-5 h-5 text-blue-600" />
              Progress Summary
            </h4>
            <ul className="space-y-2.5">
              {completedTasks.map((task, index) => {
                const status = taskStatus[task] || 'completed'
                const isCompleted = status === 'completed'
                const isSkipped = status === 'skipped'
                
                return (
                  <li key={index} className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={2.5} />
                    ) : isSkipped ? (
                      <MinusCircle className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={2} />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                    <span 
                      className={`text-sm flex-1 ${
                        isCompleted 
                          ? 'text-blue-700 font-medium' 
                          : isSkipped 
                            ? 'text-gray-500 italic' 
                            : 'text-gray-700'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: isCompleted ? 500 : 400 }}
                    >
                      {task}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Final Message */}
        {progress === 100 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Your BehavAced Profile is Ready!
              </h3>
              <p className="text-gray-600">
                AI has analyzed your experience and created personalized behavioral interview tools.
              </p>
            </div>
            <Button
              onClick={() => onComplete(userId!)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Failed Tasks Warning */}
        {failedTasks.length > 0 && progress === 100 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              Some tasks failed
            </h4>
            <p className="text-sm text-orange-800 mb-3">
              The following tasks could not be completed, but you can still proceed:
            </p>
            <ul className="text-sm text-orange-800 space-y-1 mb-3">
              {failedTasks.map((task, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                  {task}
                </li>
              ))}
            </ul>
            <p className="text-xs text-orange-700">
              You can retry these tasks later from your dashboard.
            </p>
          </div>
        )}

        {/* Error State */}
        {progress === 0 && currentStep.includes('Error') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 mb-4">
              Something went wrong during profile creation. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Restart Onboarding
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
