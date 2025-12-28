'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { createPersonalitySnapshot } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

interface PersonalityStepProps {
  onNext: () => void
  onPrev: () => void
}

const TOTAL_STEPS = 5

export default function PersonalityStep({ onNext, onPrev }: PersonalityStepProps) {
  const { 
    personalityData, 
    setPersonalityData, 
    userId,
    setBackgroundTaskStatus 
  } = useOnboardingStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    work_style: personalityData?.work_style || '',
    communication: personalityData?.communication || '',
    strengths: personalityData?.strengths || '',
    challenges: personalityData?.challenges || '',
    writing_sample: personalityData?.writing_sample || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      onPrev()
    }
  }

  const handleSubmit = () => {
    // Basic validation
    if (!formData.work_style.trim() || !formData.communication.trim() || !formData.strengths.trim() || !formData.challenges.trim()) {
      return
    }

    setPersonalityData(formData)
    
    // Start personality snapshot processing in background if userId exists
    if (userId) {
      startPersonalitySnapshotBackground(formData)
    }
    
    onNext()
  }

  // TEMPORARILY DISABLED: Background processing for design testing
  // Start background processing when personality data changes and userId exists
  // useEffect(() => {
  //   if (personalityData && userId && formData.work_style && formData.communication) {
  //     const taskStatus = useOnboardingStore.getState().getBackgroundTaskStatus('personalitySnapshot')
  //     if (taskStatus.status === 'idle') {
  //       startPersonalitySnapshotBackground(personalityData)
  //     }
  //   }
  // }, [userId])

  const startPersonalitySnapshotBackground = async (data: typeof formData) => {
    // Mark as processing
    setBackgroundTaskStatus('personalitySnapshot', 'processing')
    
    try {
      // Convert to API format
      const responses = {
        work_style: data.work_style,
        communication: data.communication,
        strengths: data.strengths,
        challenges: data.challenges,
      }
      
      // Fire and forget - don't await
      createPersonalitySnapshot(userId!, responses, data.writing_sample)
        .then(() => {
          setBackgroundTaskStatus('personalitySnapshot', 'completed')
        })
        .catch((error: any) => {
          console.error('Background personality snapshot failed:', error)
          setBackgroundTaskStatus('personalitySnapshot', 'error', error.message || 'Failed to create personality snapshot')
        })
    } catch (error: any) {
      console.error('Error starting personality snapshot:', error)
      setBackgroundTaskStatus('personalitySnapshot', 'error', error.message || 'Failed to start personality snapshot')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.work_style.trim().length > 0
      case 2:
        return formData.communication.trim().length > 0
      case 3:
        return formData.strengths.trim().length > 0
      case 4:
        return formData.challenges.trim().length > 0
      default:
        return true // Step 5 is optional
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  }

  const renderStep = () => {
    const inputStyle = {
      fontFamily: 'Inter, sans-serif' as const,
      fontWeight: 400,
      fontSize: '16px',
      border: '1px solid #E3F3E7',
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(12px)',
      padding: '16px 18px',
      borderRadius: '14px',
      lineHeight: '1.6',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
    }

    switch (currentStep) {
      case 1:
        return (
          <div>
            <label className="block mb-2 block flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '16px' }}>
              <span className="text-lg">✍️</span>
              <span>How would you describe your work style? <span className="text-green-600">*</span></span>
            </label>
            <Textarea
              placeholder="e.g., I'm analytical and detail-oriented, preferring structured approaches with clear goals and metrics..."
              value={formData.work_style}
              onChange={(e) => handleChange('work_style', e.target.value)}
              rows={4}
              className="resize-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder-warm"
              style={inputStyle}
            />
          </div>
        )
      case 2:
        return (
          <div>
            <label className="block mb-2 block flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '16px' }}>
              <span className="text-lg">🗣️</span>
              <span>How do you typically communicate in professional settings? <span className="text-green-600">*</span></span>
            </label>
            <Textarea
              placeholder="e.g., I'm direct and concise, focusing on key points and actionable outcomes..."
              value={formData.communication}
              onChange={(e) => handleChange('communication', e.target.value)}
              rows={4}
              className="resize-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder-warm"
              style={inputStyle}
            />
          </div>
        )
      case 3:
        return (
          <div>
            <label className="block mb-2 block flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '16px' }}>
              <span className="text-lg">⚡</span>
              <span>What are your key strengths? <span className="text-green-600">*</span></span>
            </label>
            <Textarea
              placeholder="e.g., Problem-solving, leadership, adaptability, attention to detail..."
              value={formData.strengths}
              onChange={(e) => handleChange('strengths', e.target.value)}
              rows={3}
              className="resize-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder-warm"
              style={inputStyle}
            />
          </div>
        )
      case 4:
        return (
          <div>
            <label className="block mb-2 block flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '16px' }}>
              <span className="text-lg">🌱</span>
              <span>What areas are you working to improve? <span className="text-green-600">*</span></span>
            </label>
            <Textarea
              placeholder="e.g., Public speaking, delegation, time management..."
              value={formData.challenges}
              onChange={(e) => handleChange('challenges', e.target.value)}
              rows={3}
              className="resize-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder-warm"
              style={inputStyle}
            />
          </div>
        )
      case 5:
        return (
          <div>
            <label className="block mb-2 block flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '16px' }}>
              <span className="text-lg">📄</span>
              <span>Optional: Writing sample (helps match your voice)</span>
            </label>
            <Textarea
              placeholder="Paste any professional writing - email, report, presentation, blog post..."
              value={formData.writing_sample}
              onChange={(e) => handleChange('writing_sample', e.target.value)}
              rows={5}
              className="resize-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder-warm"
              style={inputStyle}
            />
            <p className="mt-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', color: '#7D8B92' }}>
              This helps our AI better understand your writing style and vocabulary level
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10 relative">
        {/* Soft Green Light Gradient Behind Title */}
        <div className="absolute -inset-4 bg-gradient-to-r from-green-50/60 via-emerald-50/40 to-green-50/60 rounded-2xl blur-xl -z-10" />
        <div className="relative">
          <h2 className="mb-2 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '20px' }}>
            <span className="text-xl">📝</span>
            Tell Us About Yourself
          </h2>
          <p className="leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', color: '#7D8B92' }}>
            We'll use this to learn how you communicate and shape answers that sound authentically like you.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index + 1 <= currentStep
                ? 'bg-gradient-to-r from-[#28d98a] to-[#6fffc5] w-8'
                : 'bg-gray-200 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Step Content with Slide Animation */}
      <div className="relative min-h-[200px] mb-8">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        {currentStep > 1 && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="px-6 py-6 rounded-full border-2 border-gray-200 hover:border-green-400 transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`${currentStep > 1 ? 'flex-1' : 'w-full'} bg-gradient-to-r from-[#7fffd2] to-[#28d98a] text-white rounded-full px-8 py-6 text-lg font-semibold shadow-[0_8px_25px_rgba(40,217,138,0.35)] hover:shadow-[0_12px_35px_rgba(40,217,138,0.45)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
        >
          {currentStep === TOTAL_STEPS ? 'Continue' : 'Next'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {currentStep <= 4 && (
        <p className="text-center mt-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', color: '#7D8B92' }}>
          * Required fields
        </p>
      )}
    </div>
  )
}
