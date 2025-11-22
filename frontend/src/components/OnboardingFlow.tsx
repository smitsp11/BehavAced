'use client'

import { useEffect } from 'react'
import { Progress } from '@/components/ui/Progress'
import { AnimatePresence } from 'framer-motion'
import { SlideIn, FadeIn } from '@/components/ui/motion'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <FadeIn className="mb-12 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h1 className="text-5xl font-bold text-gradient mb-4">
              Welcome to BehavAced
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Let's build your personalized behavioral interview cognition engine with AI-powered insights
            </p>
          </div>

          {/* Progress */}
          {!isProcessing && (
            <div className="max-w-md mx-auto">
              <Progress value={getProgress()} className="h-3 mb-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {getStepNumber()} of {getTotalSteps()}</span>
                <span>{Math.round(getProgress())}% Complete</span>
              </div>
            </div>
          )}
        </FadeIn>

        {/* Current Step Component with Animation */}
        <AnimatePresence mode="wait">
          <SlideIn key={currentStep} className="card-floating">
            {renderCurrentStep()}
          </SlideIn>
        </AnimatePresence>
      </div>
    </div>
  )
}

