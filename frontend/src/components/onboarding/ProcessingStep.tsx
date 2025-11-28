'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Sparkles, CheckCircle2, Brain, BookOpen, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { createPersonalitySnapshot, processManualExperience, generateStoryBrain } from '@/lib/api'

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
  } = useOnboardingStore()

  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])

  const processingSteps = [
    { id: 'personality', label: 'Creating personality snapshot', duration: 2000 },
    { id: 'experience', label: experienceChoice === 'resume' ? 'Processing resume' : 'Processing manual experience', duration: 3000 },
    { id: 'voice', label: 'Analyzing voice sample (optional)', duration: voiceFile ? 2000 : 500 },
    { id: 'story-brain', label: 'Generating story brain', duration: 4000 },
    { id: 'finalizing', label: 'Finalizing profile', duration: 1000 }
  ]

  useEffect(() => {
    startProcessing()
  }, [])

  const startProcessing = async () => {
    setProcessing(true, 'Initializing...', 0)

    try {
      // Step 1: Personality Snapshot
      setCurrentStep('Creating personality snapshot...')
      setProgress(10)

      if (personalityData) {
        // Convert personalityData to the format expected by the API
        const responses = {
          work_style: personalityData.work_style,
          communication: personalityData.communication,
          strengths: personalityData.strengths,
          challenges: personalityData.challenges,
        }
        await createPersonalitySnapshot(userId!, responses, personalityData.writing_sample)
        completeStep('personality')
        setCompletedTasks(prev => [...prev, 'Personality profile created'])
      }

      // Step 2: Experience Processing
      setCurrentStep(experienceChoice === 'resume' ? 'Analyzing resume...' : 'Processing experience...')
      setProgress(35)

      if (experienceChoice === 'resume' && resumeFile) {
        // Resume already uploaded in previous step
        setCompletedTasks(prev => [...prev, 'Resume analyzed'])
      } else if (experienceChoice === 'manual' && manualExperienceData) {
        await processManualExperience(
          userId!,
          manualExperienceData.experiences,
          undefined,
          manualExperienceData.additional_skills
        )
        setCompletedTasks(prev => [...prev, 'Experience data processed'])
      }

      completeStep(experienceChoice === 'resume' ? 'resume-upload' : 'manual-experience')

      // Step 3: Voice Analysis (optional)
      setCurrentStep('Analyzing voice sample...')
      setProgress(60)

      if (voiceFile) {
        // TODO: Implement voice upload when backend is ready
        // await uploadVoice(userId!, voiceFile, duration)
        setCompletedTasks(prev => [...prev, 'Voice sample analyzed'])
      } else {
        setCompletedTasks(prev => [...prev, 'Voice analysis skipped'])
      }

      completeStep('voice-upload')

      // Step 4: Story Brain Generation
      setCurrentStep('Building your story brain...')
      setProgress(80)

      await generateStoryBrain(userId!)
      setCompletedTasks(prev => [...prev, 'Story brain generated'])

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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              What's Been Created
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              {completedTasks.map((task, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" />
                  {task}
                </li>
              ))}
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
