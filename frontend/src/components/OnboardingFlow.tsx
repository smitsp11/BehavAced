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
    <div className="min-h-screen relative">
      {/* Unified Background Gradient - Same as TryMode */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50/30 to-white" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-gradient-to-br from-green-200/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-[700px] h-[700px] bg-gradient-to-bl from-emerald-200/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-green-200/18 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/12 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-[650px] h-[650px] bg-gradient-to-tl from-green-200/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 w-[450px] h-[450px] bg-gradient-to-r from-green-200/10 to-transparent rounded-full blur-3xl" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Premium Hero Section */}
        <FadeIn className="mb-16 text-center">
          <div className="mb-8">
            {/* Friendly Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6 shadow-lg">
              <span className="text-4xl">✨</span>
            </div>
            
            {/* Big Playfair Display Headline */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              Welcome to BehavAced
            </h1>
            
            {/* One-line Supportive Tagline */}
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              Let's build your personalized behavioral interview voice.
            </p>
          </div>

          {/* Soft Mint Progress Bar */}
          {!isProcessing && (
            <div className="max-w-md mx-auto">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#28d98a] to-[#6fffc5] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                <span>Step {getStepNumber()} of {getTotalSteps()}</span>
                <span>{Math.round(getProgress())}% Complete</span>
              </div>
            </div>
          )}
        </FadeIn>

        {/* Current Step Component with Animation - Floating Card */}
        <AnimatePresence mode="wait">
          <SlideIn key={currentStep}>
            <div className="bg-white/95 backdrop-blur-sm border-[0.5px] border-green-300/60 rounded-2xl shadow-[0_8px_30px_rgba(0,180,90,0.12)] max-w-2xl mx-auto" style={{ paddingTop: '48px', paddingLeft: '40px', paddingRight: '40px', paddingBottom: '40px' }}>
              {renderCurrentStep()}
            </div>
          </SlideIn>
        </AnimatePresence>
      </div>
    </div>
  )
}

