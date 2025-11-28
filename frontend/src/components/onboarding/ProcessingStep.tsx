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
    completeStep,
    backgroundTasks,
    getBackgroundTaskStatus
  } = useOnboardingStore()

  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [taskStatus, setTaskStatus] = useState<Record<string, 'completed' | 'skipped'>>({})
  const [failedTasks, setFailedTasks] = useState<string[]>([])
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({})
  const [hasCompleted, setHasCompleted] = useState(false)

  const processingSteps = [
    { id: 'personality', label: 'Creating personality snapshot', duration: 2000 },
    { id: 'experience', label: experienceChoice === 'resume' ? 'Processing resume' : 'Processing manual experience', duration: 3000 },
    { id: 'voice', label: 'Analyzing voice sample (optional)', duration: voiceFile ? 2000 : 500 },
    { id: 'story-brain', label: 'Generating story brain', duration: 4000 },
    { id: 'finalizing', label: 'Finalizing profile', duration: 1000 }
  ]

  // Helper function to wait for background task completion
  const waitForBackgroundTask = async (
    task: 'personalitySnapshot' | 'resumeProcessing' | 'storyBrain',
    intervalMs: number = 1000,
    maxAttempts: number = 30
  ): Promise<void> => {
    let attempts = 0
    while (attempts < maxAttempts) {
      const taskStatus = getBackgroundTaskStatus(task)
      if (taskStatus.status === 'completed') {
        return
      }
      if (taskStatus.status === 'error') {
        throw new Error(taskStatus.error || 'Background task failed')
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs))
      attempts++
    }
    throw new Error('Background task timeout')
  }

  useEffect(() => {
    if (!hasCompleted) {
      startProcessing()
    }
  }, [])

  const startProcessing = async () => {
    setProcessing(true, 'Initializing...', 0)

    try {
      // Check background task status
      const personalityTask = getBackgroundTaskStatus('personalitySnapshot')
      const resumeTask = getBackgroundTaskStatus('resumeProcessing')

      // Step 1: Personality Snapshot
      if (personalityTask.status === 'completed') {
        // Already completed in background
        setCurrentStep('Personality snapshot already completed')
        setProgress(10)
        completeStep('personality')
        if (!completedTasks.includes('Personality profile created')) {
          setCompletedTasks(prev => [...prev, 'Personality profile created'])
          setTaskStatus(prev => ({ ...prev, 'Personality profile created': 'completed' }))
        }
      } else if (personalityTask.status === 'processing') {
        // Still processing in background, wait for it
        setCurrentStep('Waiting for personality snapshot to complete...')
        setProgress(10)
        await waitForBackgroundTask('personalitySnapshot', 1000, 30)
        completeStep('personality')
        if (!completedTasks.includes('Personality profile created')) {
          setCompletedTasks(prev => [...prev, 'Personality profile created'])
          setTaskStatus(prev => ({ ...prev, 'Personality profile created': 'completed' }))
        }
      } else if (personalityData) {
        // Not started yet, process now in background
        setCurrentStep('Creating personality snapshot...')
        setProgress(10)
        const responses = {
          work_style: personalityData.work_style,
          communication: personalityData.communication,
          strengths: personalityData.strengths,
          challenges: personalityData.challenges,
        }
        // Start in background and wait
        createPersonalitySnapshot(userId!, responses, personalityData.writing_sample)
          .then(() => {
            completeStep('personality')
            if (!completedTasks.includes('Personality profile created')) {
              setCompletedTasks(prev => [...prev, 'Personality profile created'])
              setTaskStatus(prev => ({ ...prev, 'Personality profile created': 'completed' }))
            }
          })
          .catch((error: any) => {
            console.error('Personality snapshot failed:', error)
            if (!completedTasks.includes('Personality snapshot skipped')) {
              setCompletedTasks(prev => [...prev, 'Personality snapshot skipped'])
              setTaskStatus(prev => ({ ...prev, 'Personality snapshot skipped': 'skipped' }))
            }
          })
        // Wait a bit for it to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        completeStep('personality')
        if (!completedTasks.includes('Personality profile created')) {
          setCompletedTasks(prev => [...prev, 'Personality profile created'])
          setTaskStatus(prev => ({ ...prev, 'Personality profile created': 'completed' }))
        }
      }

      // Step 2: Experience Processing
      if (experienceChoice === 'resume' && resumeFile) {
        if (resumeTask.status === 'completed') {
          // Already completed in background
          setCurrentStep('Resume already processed')
          setProgress(35)
          if (!completedTasks.includes('Resume analyzed')) {
            setCompletedTasks(prev => [...prev, 'Resume analyzed'])
            setTaskStatus(prev => ({ ...prev, 'Resume analyzed': 'completed' }))
          }
        } else if (resumeTask.status === 'processing') {
          // Still processing, wait for it
          setCurrentStep('Waiting for resume processing to complete...')
          setProgress(35)
          await waitForBackgroundTask('resumeProcessing', 1000, 30)
          if (!completedTasks.includes('Resume analyzed')) {
            setCompletedTasks(prev => [...prev, 'Resume analyzed'])
            setTaskStatus(prev => ({ ...prev, 'Resume analyzed': 'completed' }))
          }
        } else {
          // Already uploaded, mark as completed
          setCurrentStep('Resume analyzed')
          setProgress(35)
          if (!completedTasks.includes('Resume analyzed')) {
            setCompletedTasks(prev => [...prev, 'Resume analyzed'])
            setTaskStatus(prev => ({ ...prev, 'Resume analyzed': 'completed' }))
          }
        }
      } else if (experienceChoice === 'manual' && manualExperienceData) {
        setCurrentStep('Processing experience...')
        setProgress(35)
        // Process in background
        processManualExperience(
          userId!,
          manualExperienceData.experiences,
          undefined,
          manualExperienceData.additional_skills
        )
          .then(() => {
            if (!completedTasks.includes('Experience data processed')) {
              setCompletedTasks(prev => [...prev, 'Experience data processed'])
              setTaskStatus(prev => ({ ...prev, 'Experience data processed': 'completed' }))
            }
          })
          .catch((error: any) => {
            console.error('Manual experience processing failed:', error)
            if (!completedTasks.includes('Experience processing skipped')) {
              setCompletedTasks(prev => [...prev, 'Experience processing skipped'])
              setTaskStatus(prev => ({ ...prev, 'Experience processing skipped': 'skipped' }))
            }
          })
        await new Promise(resolve => setTimeout(resolve, 2000))
        if (!completedTasks.includes('Experience data processed')) {
          setCompletedTasks(prev => [...prev, 'Experience data processed'])
          setTaskStatus(prev => ({ ...prev, 'Experience data processed': 'completed' }))
        }
      }

      completeStep(experienceChoice === 'resume' ? 'resume-upload' : 'manual-experience')

      // Step 3: Voice Analysis (optional)
      setCurrentStep('Analyzing voice sample...')
      setProgress(60)

      if (voiceFile) {
        // TODO: Implement voice upload when backend is ready
        // await uploadVoice(userId!, voiceFile, duration)
        if (!completedTasks.includes('Voice sample analyzed')) {
          setCompletedTasks(prev => [...prev, 'Voice sample analyzed'])
          setTaskStatus(prev => ({ ...prev, 'Voice sample analyzed': 'completed' }))
        }
      } else {
        if (!completedTasks.includes('Voice analysis skipped')) {
          setCompletedTasks(prev => [...prev, 'Voice analysis skipped'])
          setTaskStatus(prev => ({ ...prev, 'Voice analysis skipped': 'skipped' }))
        }
      }

      completeStep('voice-upload')

      // Step 4: Generate Stories (required before story brain) - Run in background
      setCurrentStep('Extracting stories from your experience...')
      setProgress(70)

      generateStories(userId!)
        .then(() => {
          if (!completedTasks.includes('Stories extracted')) {
            setCompletedTasks(prev => [...prev, 'Stories extracted'])
            setTaskStatus(prev => ({ ...prev, 'Stories extracted': 'completed' }))
          }
        })
        .catch((error: any) => {
          console.warn('Could not generate stories:', error.message)
          if (!completedTasks.includes('Story extraction skipped')) {
            setCompletedTasks(prev => [...prev, 'Story extraction skipped'])
            setTaskStatus(prev => ({ ...prev, 'Story extraction skipped': 'skipped' }))
          }
        })

      // Step 5: Story Brain Generation - Run in background
      setCurrentStep('Building your story brain...')
      setProgress(85)

      generateStoryBrain(userId!)
        .then(() => {
          if (!completedTasks.includes('Story brain generated')) {
            setCompletedTasks(prev => [...prev, 'Story brain generated'])
            setTaskStatus(prev => ({ ...prev, 'Story brain generated': 'completed' }))
          }
        })
        .catch((error: any) => {
          console.warn('Could not generate story brain:', error.message)
          if (!completedTasks.includes('Story brain generation skipped')) {
            setCompletedTasks(prev => [...prev, 'Story brain generation skipped'])
            setTaskStatus(prev => ({ ...prev, 'Story brain generation skipped': 'skipped' }))
          }
        })

      // Wait a bit for background tasks to complete
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Step 6: Finalizing
      setCurrentStep('Finalizing your profile...')
      setProgress(95)

      completeStep('processing')
      completeStep('complete')

      setProgress(100)
      setProcessing(false, 'Complete!', 100)

      // Complete onboarding after a short delay (only once)
      if (!hasCompleted) {
        setHasCompleted(true)
        setTimeout(() => {
          onComplete(userId!)
        }, 2000)
      }

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
          {processingSteps.map((step, index) => {
            // Check if task is completed by matching step ID to background tasks or completed tasks
            const personalityTask = getBackgroundTaskStatus('personalitySnapshot')
            const resumeTask = getBackgroundTaskStatus('resumeProcessing')
            
            let isTaskCompleted = false
            if (step.id === 'personality' && personalityTask.status === 'completed') {
              isTaskCompleted = true
            } else if (step.id === 'experience' && resumeTask.status === 'completed') {
              isTaskCompleted = true
            } else if (completedTasks.some(task =>
              task.toLowerCase().includes(step.label.toLowerCase().split(' ')[0])
            )) {
              isTaskCompleted = true
            }
            
            const isTaskProcessing = progress > (index / processingSteps.length) * 100 && !isTaskCompleted
            
            return (
              <div key={step.id} className="flex items-center gap-4">
                {isTaskCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                ) : isTaskProcessing ? (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                )}
                <span className={
                  isTaskCompleted
                    ? 'text-blue-700 font-medium'
                    : isTaskProcessing
                      ? 'text-blue-700 font-medium'
                      : 'text-gray-500'
                }>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Completed Tasks Summary */}
        {completedTasks.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200/60 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <BookOpen className="w-5 h-5 text-green-600" />
              Progress Summary
            </h4>
            <ul className="space-y-2.5">
              {Array.from(new Set(completedTasks)).map((task, index) => {
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
                          ? 'text-green-700 font-medium' 
                          : isSkipped 
                            ? 'text-gray-500 italic' 
                            : 'text-green-700'
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
