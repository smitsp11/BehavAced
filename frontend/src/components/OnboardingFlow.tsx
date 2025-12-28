'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import PersonalityStep from '@/components/onboarding/PersonalityStep'
import ExperienceChoiceStep from '@/components/onboarding/ExperienceChoiceStep'
import ResumeUploadStep from '@/components/onboarding/ResumeUploadStep'
import ManualExperienceStep from '@/components/onboarding/ManualExperienceStep'
import VoiceUploadStep from '@/components/onboarding/VoiceUploadStep'
import { startBackgroundProcessing } from '@/lib/backgroundProcessing'

interface OnboardingFlowProps {
  onComplete: (userId: string) => void
}

const STEP_INFO = [
  {
    id: 'personality',
    number: '01',
    title: 'Identity',
    description: 'Understanding your core work style and communication patterns.'
  },
  {
    id: 'experience-choice',
    number: '02',
    title: 'Path',
    description: 'Choose how you\'d like to share your professional experience.'
  },
  {
    id: 'resume-upload',
    number: '03',
    title: 'Resume',
    description: 'Upload your resume for AI analysis and story extraction.'
  },
  {
    id: 'manual-experience',
    number: '03',
    title: 'Experience',
    description: 'Share your key professional experiences and achievements.'
  },
  {
    id: 'voice-upload',
    number: '04',
    title: 'Voice',
    description: 'Upload a voice sample to match your natural speaking style.'
  }
]

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const {
    currentStep,
    getNextStep,
    getPrevStep,
    setStep,
    experienceChoice,
    userId,
    personalityData,
    resumeFile,
    manualExperienceData,
    voiceFile,
    completeStep
  } = useOnboardingStore()

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

  const handleCompleteOnboarding = () => {
    const currentState = useOnboardingStore.getState()
    
    let finalUserId = currentState.userId || userId
    if (!finalUserId) {
      finalUserId = crypto.randomUUID()
      console.log('Generated fallback userId:', finalUserId)
    }

    completeStep('voice-upload')
    completeStep('processing')
    completeStep('complete')

    setTimeout(() => {
      startBackgroundProcessing({
        userId: finalUserId,
        personalityData: currentState.personalityData || personalityData,
        experienceChoice: currentState.experienceChoice || experienceChoice,
        resumeFile: currentState.resumeFile || resumeFile,
        manualExperienceData: currentState.manualExperienceData || manualExperienceData,
        voiceFile: currentState.voiceFile || voiceFile,
      })
    }, 100)

    onComplete(finalUserId)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personality':
        return <PersonalityStep onNext={handleNext} onPrev={handlePrev} />
      case 'experience-choice':
        return <ExperienceChoiceStep onNext={handleNext} onPrev={handlePrev} />
      case 'resume-upload':
        return <ResumeUploadStep onNext={handleCompleteOnboarding} onPrev={handlePrev} />
      case 'manual-experience':
        return <ManualExperienceStep onNext={handleCompleteOnboarding} onPrev={handlePrev} />
      case 'voice-upload':
        return <VoiceUploadStep onNext={handleCompleteOnboarding} onPrev={handlePrev} />
      default:
        return <PersonalityStep onNext={handleNext} onPrev={handlePrev} />
    }
  }

  // Get visible steps based on experience choice
  const getVisibleSteps = () => {
    return STEP_INFO.filter(step => {
      if (step.id === 'resume-upload' && experienceChoice === 'manual') return false
      if (step.id === 'manual-experience' && experienceChoice === 'resume') return false
      return true
    })
  }

  const visibleSteps = getVisibleSteps()
  const currentStepIndex = visibleSteps.findIndex(step => step.id === currentStep)

  const slideUpVariants = {
    enter: {
      y: 50,
      opacity: 0
    },
    center: {
      y: 0,
      opacity: 1
    },
    exit: {
      y: -50,
      opacity: 0
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-stone-50 flex">
      {/* LEFT SIDEBAR - The Context Sidebar (35%) */}
      <div className="w-[35%] bg-stone-100/50 border-r border-stone-200 p-8 flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-600 mb-2 font-sans">
            The Executive Diagnostic
          </h2>
          <p className="font-sans text-sm text-stone-500 leading-relaxed">
            A private consultation to understand your authentic communication style.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="flex-1 space-y-8">
          {visibleSteps.map((step, index) => {
            const isCurrent = step.id === currentStep
            const isPast = index < currentStepIndex
            const isFuture = index > currentStepIndex

            return (
              <div
                key={step.id}
                className={`flex items-start gap-4 transition-all duration-300 ${
                  isCurrent
                    ? 'opacity-100'
                    : isPast
                    ? 'opacity-60'
                    : 'opacity-40'
                }`}
              >
                <div className="flex-shrink-0">
                  <span
                    className={`font-serif italic font-light text-3xl block ${
                      isCurrent
                        ? 'text-stone-900'
                        : isPast
                        ? 'text-stone-400'
                        : 'text-stone-300'
                    }`}
                  >
                    {step.number}
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <h3
                    className={`font-serif text-lg mb-1 ${
                      isCurrent
                        ? 'text-stone-900'
                        : 'text-stone-600'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="font-sans text-xs text-stone-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT COLUMN - The Writing Desk (65%) */}
      <div className="flex-1 bg-stone-50 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideUpVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="h-full flex items-center justify-center p-12"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
