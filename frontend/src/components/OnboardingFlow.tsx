'use client'

import { useEffect } from 'react'
import { Progress } from '@/components/ui/Progress'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import PersonalityStep from '@/components/onboarding/PersonalityStep'
import ExperienceChoiceStep from '@/components/onboarding/ExperienceChoiceStep'
import ResumeUploadStep from '@/components/onboarding/ResumeUploadStep'
import ManualExperienceStep from '@/components/onboarding/ManualExperienceStep'
import VoiceUploadStep from '@/components/onboarding/VoiceUploadStep'
import ProcessingStep from '@/components/onboarding/ProcessingStep'

interface OnboardingFlowProps {
  onComplete: (userId: string) => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const {
    currentStep,
    completedSteps,
    getNextStep,
    getPrevStep,
    setStep,
    canProceedToStep,
    experienceChoice,
    isProcessing
  } = useOnboardingStore()

  // Calculate progress
  const getProgress = () => {
    const steps = ['personality', 'experience-choice', 'resume-upload', 'manual-experience', 'voice-upload', 'processing', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    return Math.max(0, Math.min(100, ((currentIndex + 1) / steps.length) * 100))
  }

  // Calculate step number for display
  const getStepNumber = () => {
    const stepOrder = ['personality', 'experience-choice', 'resume-upload', 'manual-experience', 'voice-upload', 'processing']
    const visibleSteps = stepOrder.filter(step => {
      if (step === 'resume-upload' && experienceChoice === 'manual') return false
      if (step === 'manual-experience' && experienceChoice === 'resume') return false
      return true
    })
    return visibleSteps.indexOf(currentStep) + 1
  }

  const getTotalSteps = () => {
    const stepOrder = ['personality', 'experience-choice', 'resume-upload', 'manual-experience', 'voice-upload', 'processing']
    const visibleSteps = stepOrder.filter(step => {
      if (step === 'resume-upload' && experienceChoice === 'manual') return false
      if (step === 'manual-experience' && experienceChoice === 'resume') return false
      return true
    })
    return visibleSteps.length
  }

  const handleNext = () => {
    const nextStep = getNextStep()
    if (nextStep) {
      setStep(nextStep)
    }
  }

  const handlePrev = () => {
    const prevStep = getPrevStep()
    if (prevStep) {
      setStep(prevStep)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personality':
        return <PersonalityStep onNext={handleNext} onPrev={handlePrev} />
      case 'experience-choice':
        return <ExperienceChoiceStep onNext={handleNext} onPrev={handlePrev} />
      case 'resume-upload':
        return <ResumeUploadStep onNext={handleNext} onPrev={handlePrev} />
      case 'manual-experience':
        return <ManualExperienceStep onNext={handleNext} onPrev={handlePrev} />
      case 'voice-upload':
        return <VoiceUploadStep onNext={handleNext} onPrev={handlePrev} />
      case 'processing':
        return <ProcessingStep onComplete={onComplete} />
      default:
        return <PersonalityStep onNext={handleNext} onPrev={handlePrev} />
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to BehavAced
          </h1>
          <p className="text-muted-foreground">
            Let's build your behavioral interview cognition engine
          </p>
        </div>

        {/* Progress */}
        {!isProcessing && (
          <div className="mb-6">
            <Progress value={getProgress()} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Step {getStepNumber()} of {getTotalSteps()}</span>
              <span>{Math.round(getProgress())}% Complete</span>
            </div>
          </div>
        )}

        {/* Current Step Component */}
        {renderCurrentStep()}
      </div>
    </div>
  )
}

